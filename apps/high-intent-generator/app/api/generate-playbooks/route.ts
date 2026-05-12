import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { GENERATE_PLAYBOOKS_PROMPT } from '@/lib/prompts';
import { extractJson } from '@/lib/utils';
import { SignalCampaign, SignalPlaybook, CompanyIntel, ResearchIntel } from '@/lib/types';

export const maxDuration = 120;
export const runtime = 'nodejs';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generatePlaybook(
  campaign: SignalCampaign,
  companyIntel: CompanyIntel,
  researchIntel?: ResearchIntel
): Promise<SignalCampaign> {
  try {
    const userMessage = `Campaign:
Name: ${campaign.name}
Signal Type: ${campaign.signalType}
Angle: ${campaign.angle}
Difficulty: ${campaign.difficulty}
Conversion Tier: ${campaign.conversionTier}

Company Intel:
${JSON.stringify(companyIntel, null, 2)}

Market Research:
${researchIntel ? JSON.stringify(researchIntel, null, 2) : 'Not available.'}

Generate the full signal playbook for this campaign.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: GENERATE_PLAYBOOKS_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const playbook = extractJson(text) as SignalPlaybook;

    return { ...campaign, playbook };
  } catch {
    return campaign;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { campaigns, companyIntel, researchIntel }: {
      campaigns: SignalCampaign[];
      companyIntel: CompanyIntel;
      researchIntel?: ResearchIntel;
    } = await req.json();

    if (!campaigns?.length || !companyIntel) {
      return NextResponse.json({ error: 'Missing campaigns or companyIntel' }, { status: 400 });
    }

    const enriched = await Promise.all(
      campaigns.map(c => generatePlaybook(c, companyIntel, researchIntel))
    );

    return NextResponse.json({ campaigns: enriched });
  } catch (err) {
    console.error('generate-playbooks error:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
