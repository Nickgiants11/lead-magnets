import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { GENERATE_SCRIPTS_PROMPT } from '@/lib/prompts';
import { extractJson } from '@/lib/utils';
import { SignalCampaign, SignalScripts, CompanyIntel } from '@/lib/types';

export const maxDuration = 120;
export const runtime = 'nodejs';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateScripts(
  campaign: SignalCampaign,
  companyIntel: CompanyIntel
): Promise<SignalCampaign> {
  try {
    const userMessage = `Campaign:
Name: ${campaign.name}
Signal Type: ${campaign.signalType}
Angle: ${campaign.angle}
${campaign.playbook ? `Signal Definition: ${campaign.playbook.signalDefinition}
Why High Intent: ${campaign.playbook.whyHighIntent}` : ''}

Company Offer: ${companyIntel.offer}
ICP: ${companyIntel.icp}
Differentiators: ${companyIntel.differentiators.join(', ')}

Write 2 high-intent outreach script variants (1 cold email, 1 LinkedIn DM) that open with a direct reference to the signal.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      system: GENERATE_SCRIPTS_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const scripts = extractJson(text) as SignalScripts;

    return { ...campaign, scripts };
  } catch {
    return campaign;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { campaigns, companyIntel }: {
      campaigns: SignalCampaign[];
      companyIntel: CompanyIntel;
    } = await req.json();

    if (!campaigns?.length || !companyIntel) {
      return NextResponse.json({ error: 'Missing campaigns or companyIntel' }, { status: 400 });
    }

    const enriched = await Promise.all(
      campaigns.map(c => generateScripts(c, companyIntel))
    );

    return NextResponse.json({ campaigns: enriched });
  } catch (err) {
    console.error('generate-scripts error:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
