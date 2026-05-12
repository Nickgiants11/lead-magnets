import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GENERATE_PLAYS_PROMPT } from "@/lib/prompts";
import { extractJson } from "@/lib/utils";
import type { CompanyIntel, Play, ResearchIntel } from "@/lib/types";

export const maxDuration = 60;
export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const intel: CompanyIntel = body?.companyIntel;
    const research: ResearchIntel | null = body?.researchIntel ?? null;
    if (!intel) {
      return NextResponse.json(
        { error: "companyIntel is required" },
        { status: 400 },
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const userMessage = `COMPANY INTEL:
- Name: ${intel.companyName}
- Website: ${intel.websiteUrl}
- Offer: ${intel.offer}
- ICP: ${intel.icp}
- Differentiators: ${intel.differentiators.join("; ")}
- Industry vertical: ${intel.industryVertical}
- Target titles: ${intel.targetTitles.join(", ")}

MACRO RESEARCH:
- Industry trends: ${research?.industryTrends.join(" | ") ?? "(none)"}
- Competitor moves: ${research?.competitorMoves.join(" | ") ?? "(none)"}
- Reddit/forum complaints: ${research?.redditComplaints.join(" | ") ?? "(none)"}
- Macro context: ${research?.macroContext ?? "(none)"}

Generate exactly 9 plays per the spec. Return only JSON.`;

    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: GENERATE_PLAYS_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = completion.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("\n");

    const parsed = extractJson<{ plays: Play[] }>(text);
    if (!parsed.plays || parsed.plays.length === 0) {
      return NextResponse.json(
        { error: "Generation timed out. Please try again." },
        { status: 500 },
      );
    }
    // Ensure stable ids
    const plays = parsed.plays.slice(0, 9).map((p, i) => ({
      ...p,
      id: p.id || `play_${i + 1}`,
    }));
    return NextResponse.json({ plays });
  } catch {
    return NextResponse.json(
      { error: "Generation timed out. Please try again." },
      { status: 500 },
    );
  }
}
