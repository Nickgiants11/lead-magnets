import { NextResponse } from "next/server";
import Exa from "exa-js";
import Anthropic from "@anthropic-ai/sdk";
import { SYNTHESIZE_RESEARCH_PROMPT } from "@/lib/prompts";
import { extractJson } from "@/lib/utils";
import type { CompanyIntel, ResearchIntel } from "@/lib/types";

export const maxDuration = 60;
export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

interface ExaSnippet {
  title?: string;
  url?: string;
  text?: string;
}

async function exaSearch(
  exa: Exa,
  query: string,
  numResults: number,
  useAutoprompt = true,
): Promise<ExaSnippet[]> {
  try {
    const result = await exa.searchAndContents(query, {
      numResults,
      useAutoprompt,
      text: { maxCharacters: 1500 },
    });
    return (result?.results ?? []).map((r: any) => ({
      title: r.title,
      url: r.url,
      text: r.text,
    }));
  } catch {
    return [];
  }
}

function formatSnippets(label: string, snippets: ExaSnippet[]): string {
  if (!snippets.length) return `${label}\n(no results)\n`;
  return (
    `${label}\n` +
    snippets
      .map(
        (s, i) =>
          `[${i + 1}] ${s.title ?? "Untitled"} — ${s.url ?? ""}\n${(s.text ?? "").slice(0, 1200)}`,
      )
      .join("\n\n") +
    "\n"
  );
}

function fallbackResearch(intel: CompanyIntel): ResearchIntel {
  return {
    industryTrends: [
      `${intel.industryVertical} buyers are increasingly skeptical of generic outbound`,
      `Budget consolidation is pushing buyers toward consolidated platforms over point solutions`,
      `Buyer committees are larger; champions need internal-selling assets, not just demos`,
    ],
    competitorMoves: [
      `Competitors in ${intel.industryVertical} are leaning on free tools and content as top-of-funnel`,
      `Several alternatives are bundling services with software to differentiate`,
    ],
    redditComplaints: [
      `Buyers complain about vendors that pitch before understanding their stack`,
      `Common frustration: long sales cycles with no clear ROI proof`,
      `Operators are tired of cold emails that read like templates`,
    ],
    macroContext: `The ${intel.industryVertical} market is consolidating and buyers expect specificity. Generic pitches lose; signal-based, peer-to-peer outreach wins.`,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const intel: CompanyIntel = body?.companyIntel;
    if (!intel) {
      return NextResponse.json(
        { error: "companyIntel is required" },
        { status: 400 },
      );
    }

    if (!process.env.EXA_API_KEY) {
      return NextResponse.json({ researchIntel: fallbackResearch(intel) });
    }

    const exa = new Exa(process.env.EXA_API_KEY);

    const [trends, competitors, complaints] = await Promise.all([
      exaSearch(
        exa,
        `${intel.industryVertical} B2B outbound challenges 2025 2026`,
        5,
        true,
      ),
      exaSearch(
        exa,
        `${intel.offer} company competitive landscape ${intel.industryVertical}`,
        5,
        true,
      ),
      exaSearch(
        exa,
        `site:reddit.com ${intel.industryVertical} ${intel.offer} problems complaints frustrated`,
        8,
        true,
      ),
    ]);

    const allEmpty =
      trends.length === 0 &&
      competitors.length === 0 &&
      complaints.length === 0;
    if (allEmpty) {
      return NextResponse.json({ researchIntel: fallbackResearch(intel) });
    }

    const corpus = [
      formatSnippets("=== INDUSTRY TRENDS ===", trends),
      formatSnippets("=== COMPETITOR MOVES ===", competitors),
      formatSnippets("=== REDDIT / FORUMS ===", complaints),
    ].join("\n\n");

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYNTHESIZE_RESEARCH_PROMPT,
      messages: [
        {
          role: "user",
          content: `Company: ${intel.companyName}\nOffer: ${intel.offer}\nICP: ${intel.icp}\nIndustry: ${intel.industryVertical}\n\nRaw search results:\n\n${corpus}`,
        },
      ],
    });

    const text = completion.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("\n");

    const parsed = extractJson<ResearchIntel>(text);
    return NextResponse.json({ researchIntel: parsed });
  } catch {
    // Research is best-effort; degrade gracefully
    try {
      const body = await req.clone().json();
      if (body?.companyIntel) {
        return NextResponse.json({
          researchIntel: fallbackResearch(body.companyIntel),
        });
      }
    } catch {
      // ignore
    }
    return NextResponse.json(
      { error: "Research step failed." },
      { status: 500 },
    );
  }
}
