import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GENERATE_PLAYBOOKS_PROMPT } from "@/lib/prompts";
import { extractJson } from "@/lib/utils";
import type { CompanyIntel, Play, Playbook, ResearchIntel } from "@/lib/types";

export const maxDuration = 60;
export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

async function generateOne(
  anthropic: Anthropic,
  play: Play,
  intel: CompanyIntel,
  research: ResearchIntel | null,
): Promise<Play> {
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: GENERATE_PLAYBOOKS_PROMPT,
    messages: [
      {
        role: "user",
        content: `THE PLAY:
- Name: ${play.name}
- Type: ${play.type}
- Angle: ${play.angle}
- Difficulty: ${play.difficulty}
- Response Rate Tier: ${play.responseRateTier}

COMPANY INTEL:
- Name: ${intel.companyName}
- Offer: ${intel.offer}
- ICP: ${intel.icp}
- Differentiators: ${intel.differentiators.join("; ")}
- Industry vertical: ${intel.industryVertical}
- Target titles: ${intel.targetTitles.join(", ")}

MACRO RESEARCH:
- Industry trends: ${research?.industryTrends.join(" | ") ?? "(none)"}
- Reddit complaints: ${research?.redditComplaints.join(" | ") ?? "(none)"}

Produce the playbook JSON exactly per the spec. Return only JSON.`,
      },
    ],
  });

  const text = completion.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  const parsed = extractJson<{ playbook: Playbook }>(text);
  return { ...play, playbook: parsed.playbook };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plays: Play[] = body?.plays ?? [];
    const intel: CompanyIntel = body?.companyIntel;
    const research: ResearchIntel | null = body?.researchIntel ?? null;

    if (!intel || plays.length === 0) {
      return NextResponse.json(
        { error: "plays and companyIntel are required" },
        { status: 400 },
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const results = await Promise.all(
      plays.map((p) =>
        generateOne(anthropic, p, intel, research).catch(() => p),
      ),
    );

    return NextResponse.json({ plays: results });
  } catch {
    return NextResponse.json(
      { error: "Generation timed out. Please try again." },
      { status: 500 },
    );
  }
}
