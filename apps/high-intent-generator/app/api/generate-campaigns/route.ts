import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { GENERATE_CAMPAIGNS_PROMPT } from '@/lib/prompts';
import { extractJson } from '@/lib/utils';
import { CompanyIntel, ResearchIntel, SignalCampaign } from '@/lib/types';

export const maxDuration = 60;
export const runtime = 'nodejs';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { companyIntel, researchIntel }: { companyIntel: CompanyIntel; researchIntel?: ResearchIntel } = await req.json();

    if (!companyIntel) return NextResponse.json({ error: 'Missing companyIntel' }, { status: 400 });

    const userMessage = `Company Intel:
${JSON.stringify(companyIntel, null, 2)}

Market Research:
${researchIntel ? JSON.stringify(researchIntel, null, 2) : 'Not available — generate based on company intel alone.'}

Generate 5 high-intent signal campaigns for this company.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: GENERATE_CAMPAIGNS_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = extractJson(text) as { campaigns: SignalCampaign[] };

    if (!parsed?.campaigns?.length) {
      return NextResponse.json({ error: 'Failed to generate campaigns' }, { status: 500 });
    }

    return NextResponse.json({ campaigns: parsed.campaigns.slice(0, 5) });
  } catch (err) {
    console.error('generate-campaigns error:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
