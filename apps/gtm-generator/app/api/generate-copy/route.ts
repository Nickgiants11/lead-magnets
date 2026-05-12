import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GENERATE_COPY_PROMPT } from "@/lib/prompts";
import { extractJson } from "@/lib/utils";
import type { CompanyIntel, CopySet, Play } from "@/lib/types";

export const maxDuration = 60;
export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

async function generateOne(
  anthropic: Anthropic,
  play: Play,
  intel: CompanyIntel,
): Promise<Play> {
  const playbookSummary = play.playbook
    ? `Description: ${play.playbook.fullDescription}\nMessaging angle: ${play.playbook.messagingAngle}\nWhy it works: ${play.playbook.whyItWorks}`
    : "(playbook not available)";

  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2500,
    system: GENERATE_COPY_PROMPT,
    messages: [
      {
        role: "user",
        content: `THE PLAY:
- Name: ${play.name}
- Type: ${play.type}
- Angle: ${play.angle}
- ${playbookSummary}

COMPANY OFFER: ${intel.offer}
ICP: ${intel.icp}
DIFFERENTIATORS: ${intel.differentiators.join("; ")}
INDUSTRY: ${intel.industryVertical}

Write 2 cold email variants per the spec. Return only JSON.`,
      },
    ],
  });

  const text = completion.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  const parsed = extractJson<{ copy: CopySet }>(text);
  return { ...play, copy: parsed.copy };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plays: Play[] = body?.plays ?? [];
    const intel: CompanyIntel = body?.companyIntel;

    if (!intel || plays.length === 0) {
      return NextResponse.json(
        { error: "plays and companyIntel are required" },
        { status: 400 },
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const results = await Promise.all(
      plays.map((p) => generateOne(anthropic, p, intel).catch(() => p)),
    );

    return NextResponse.json({ plays: results });
  } catch {
    return NextResponse.json(
      { error: "Generation timed out. Please try again." },
      { status: 500 },
    );
  }
}
