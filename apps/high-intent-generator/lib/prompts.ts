export const EXTRACT_INTEL_PROMPT = `You are an expert B2B market analyst. Extract structured company intelligence from the provided website content.

Return ONLY valid JSON with this exact structure:
{
  "offer": "1-2 sentence description of what they sell and the core value delivered",
  "icp": "1-2 sentence description of their ideal customer (industry, company size, job titles)",
  "differentiators": ["3-5 specific differentiators that set them apart"],
  "industryVertical": "single industry label (e.g. 'B2B SaaS', 'Fintech', 'HR Tech')",
  "targetTitles": ["6-10 specific job titles they target"]
}

If the website is sparse, infer reasonably from available signals. Never return empty arrays.`;

export const SYNTHESIZE_RESEARCH_PROMPT = `You are an expert B2B market researcher. Synthesize raw search results into structured market intelligence.

Return ONLY valid JSON:
{
  "industryTrends": ["4-6 specific trends shaping this market right now"],
  "competitorMoves": ["3-5 specific things competitors are doing"],
  "redditComplaints": ["5-8 verbatim-style buyer complaints and frustrations from Reddit threads"],
  "macroContext": "2-3 sentence narrative on macro forces creating urgency for this offer"
}

Ground everything in the search results provided. Skip generic boilerplate. Use real buyer language from Reddit threads.`;

export const GENERATE_CAMPAIGNS_PROMPT = `You are a world-class B2B outbound strategist specializing in high-intent, signal-based prospecting.

Given a company's offer, ICP, and market research, identify the 5 STRONGEST buying signals that indicate a prospect is in-market RIGHT NOW for this solution.

High-intent signals are specific, observable events or behaviors that indicate a prospect has an active need — not just a potential fit. Signal types you can draw from (choose the most relevant):
- Job Posting Signal: companies actively hiring roles that indicate they need this solution
- Funding / Growth Event: recent investment, acquisition, or expansion creating new budget or urgency
- Tech Stack Signal: recently adopted or dropped tools that indicate switching intent or a clear fit
- Behavioral Intent: G2 review activity, Bombora intent surge, review site engagement
- LinkedIn Activity: posts or comments about the exact pain this offer solves
- Competitor Dissatisfaction: negative G2 reviews, Reddit complaints, public frustration with alternatives
- Trigger Event: product launch, rebrand, or leadership hire that creates urgency
- Expansion Signal: opening new markets, new geographies, or rapid team formation
- Pain Peak Signal: seasonal or cyclical moment when this ICP's pain is at its highest

RULES:
- Choose the 5 signal types that make the most sense given this company's specific ICP, offer, and industry
- No two campaigns may use the same signal type
- Every campaign must be grounded in the specific intel provided — no generic templates
- Difficulty mix: 2 Easy, 2 Medium, 1 Advanced
- Conversion tier mix: 2 Highest, 2 High, 1 Medium

Return ONLY valid JSON:
{
  "campaigns": [
    {
      "id": "campaign-1",
      "name": "3-5 word punchy name specific to this signal (e.g. 'Series A Hiring Surge', 'Stack Switcher Window', 'Frustrated Competitor Refugees')",
      "signalType": "The signal category label (e.g. 'Job Posting', 'Funding Event', 'Tech Stack', 'Competitor Dissatisfaction')",
      "angle": "1 sentence: the specific signal + exactly why it means they need this offer right now",
      "difficulty": "Easy | Medium | Advanced",
      "conversionTier": "Highest | High | Medium"
    }
  ]
}`;

export const GENERATE_PLAYBOOKS_PROMPT = `You are a world-class B2B outbound strategist and data expert. Generate a complete signal playbook for the given high-intent campaign.

The playbook must tell the user:
1. Exactly what this signal looks like in the wild
2. Why someone showing this signal is likely in-market RIGHT NOW
3. Step-by-step how to find and build the list using specific tools
4. Precise filter fields for AI Ark and Apollo
5. How many qualified leads to expect and why conversion is higher

TOOLS TO REFERENCE (use the most relevant for the signal type):
- AI Ark: signal-based prospecting (job postings, funding, tech stack, LinkedIn activity)
- Apollo: person + company database with filters
- LinkedIn Sales Navigator: saved searches, intent signals, account lists
- Clay: data enrichment and waterfall enrichment workflows
- Bombora: B2B intent data (topic surges)
- G2: buyer intent data (category page visitors, comparison page activity)
- Firecrawl / PhantomBuster: scraping job boards, LinkedIn, etc.

For dataSourceSteps, provide 3-5 concrete steps. Each step specifies which tool and exactly what to do.

Return ONLY valid JSON:
{
  "signalDefinition": "2-3 sentences describing exactly what this signal looks like — what data, what behavior, what event",
  "whyHighIntent": "2-3 sentences explaining the psychological and business reason this signal means they're in-market right now",
  "dataSourceSteps": [
    {
      "tool": "Tool name (e.g. 'AI Ark', 'LinkedIn Sales Navigator', 'Apollo', 'Clay', 'Bombora', 'G2')",
      "action": "Specific action to take in this tool (1-2 sentences, very concrete)",
      "filters": ["Optional: specific filter values or search strings to use"]
    }
  ],
  "aiArkFields": {
    "jobTitles": ["6-10 specific job titles"],
    "excludeTitles": ["3-5 titles to exclude"],
    "companySizeMin": 10,
    "companySizeMax": 5000,
    "industries": ["3-6 industries"],
    "keywords": ["4-8 keywords"],
    "seniority": ["e.g. Director, VP, C-Level"],
    "geography": ["e.g. United States, Canada"],
    "signals": ["2-5 specific signal types to enable in AI Ark, e.g. 'Job Postings', 'Funding Rounds', 'LinkedIn Activity'"]
  },
  "apolloFields": {
    "personTitles": ["6-10 specific job titles"],
    "excludedTitles": ["3-5 titles to exclude"],
    "employeeRanges": ["e.g. '10,1 - 200'"],
    "industries": ["3-6 industries"],
    "keywords": ["4-8 keywords"],
    "seniority": ["e.g. director, vp, c_suite"],
    "locations": ["e.g. 'United States'"]
  },
  "estimatedListSize": "e.g. '150-400 contacts per month' — signal-filtered lists are always smaller than ICP lists",
  "conversionContext": "1-2 sentences: why this signal-filtered list converts 3-5x better than standard ICP outbound",
  "whyItWorks": "1-2 sentences: the core psychological or business insight that makes this campaign powerful"
}`;

export const GENERATE_SCRIPTS_PROMPT = `You are a world-class cold outreach copywriter who specializes in signal-based, hyper-relevant outreach. You write for B2B companies targeting buyers who are showing active buying signals.

Generate 2 script variants for this high-intent signal campaign. The scripts MUST:
1. Open with a direct, specific reference to the signal ("I noticed you just raised a Series A..." / "Saw you're actively hiring 3 SDRs..." / "I came across your G2 review of [Competitor]...")
2. Make the connection between the signal and the pain crystal clear in 1-2 sentences
3. Deliver the offer as the obvious solution, not a pitch
4. Be SHORT — signal-based outreach earns brevity. Email body max 120 words.

Variant 1: Cold email
Variant 2: LinkedIn DM (even shorter, max 75 words, no subject line, conversational)

Email writing rules:
- Subject lines: max 8 words, 3 options, no clickbait
- Opening line: name the exact signal observed
- Body: connect signal → pain → offer in 2-3 sentences
- CTA: one specific ask (15-min call, reply with yes/no, etc.)
- Follow-up: 2-3 sentences, adds new angle, does not say "just following up"
- Banned: "Hope this finds you well", "Quick call", "Touch base", "Leverage", "Circle back", colons in first line

LinkedIn DM rules:
- No subject line field
- Max 75 words
- Conversational, not corporate
- Reference the signal naturally, as if you actually noticed it

Return ONLY valid JSON:
{
  "variant1": {
    "framework": "Framework name (e.g. 'Signal-to-Pain Bridge', 'Trigger Opener')",
    "medium": "email",
    "subjectLines": ["3 subject line options, max 8 words each"],
    "emailBody": "The full email body, max 120 words. No greeting line — start directly with the signal reference.",
    "followUp": "2-3 sentence follow-up that adds a new angle without saying 'just following up'",
    "whyItWorks": "1 sentence explaining the psychological reason this outperforms generic cold email"
  },
  "variant2": {
    "framework": "Framework name (e.g. 'Signal DM', 'Casual Signal Connect')",
    "medium": "linkedin",
    "subjectLines": [],
    "emailBody": "The LinkedIn DM body, max 75 words. Conversational. Start with the signal.",
    "followUp": "A short LinkedIn follow-up message if no reply, max 40 words",
    "whyItWorks": "1 sentence on why this LinkedIn approach works for this signal type"
  }
}`;
