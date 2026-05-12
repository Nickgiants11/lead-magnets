# BuzzLead GTM Strategy Generator

Public-facing 3-stage tool that scrapes a prospect's website, runs industry + Reddit research, and generates 9 tailored outbound plays. After a gate form, 3 selected plays unlock full execution playbooks (with AI Ark + Apollo list-building fields) and BuzzLead-framework cold email copy.

Built to be linked from `buzzlead.io/resources/free-tools` as a lead magnet.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Anthropic Claude (`claude-sonnet-4-6`)
- Exa AI for web + Reddit research
- Firecrawl for website scraping (with `fetch` fallback)
- Resend for lead notification email
- Vercel deployment (60s function timeout)

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in values:

```env
ANTHROPIC_API_KEY=        # console.anthropic.com → API Keys
EXA_API_KEY=              # dashboard.exa.ai → API Keys
FIRECRAWL_API_KEY=        # firecrawl.dev → Dashboard → API Keys
RESEND_API_KEY=           # resend.com → API Keys
NOTIFICATION_EMAIL=troy@buzzlead.io
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

All five must also be added to Vercel project env vars (Production + Preview).

## Local dev

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import into Vercel.
3. Add the env vars listed above.
4. Deploy.

`vercel.json` already sets the API function timeout to 60 seconds — required for the multi-step generation pipeline.

## Linking from buzzlead.io

Add a card to `buzzlead.io/resources/free-tools`:

```
Type: Templates & Strategy
Title: GTM Strategy Generator
Description: Drop your website. Get 9 custom outbound plays built from your
             website, market research, and Reddit buyer intelligence. Free.
Link: https://<your-vercel-deployment>.vercel.app
```

## Architecture

| Stage | Page | What runs |
|---|---|---|
| 1 | `/` | Scrape → Research → Generate 9 plays |
| Gate | `/` (form) | `POST /api/notify` (lead email to Troy), session state saved |
| 2 | `/unlocked` | `POST /api/generate-playbooks` (3 plays in parallel) |
| 3 | `/copy` | `POST /api/generate-copy` (3 plays in parallel) |

State persists across page navigations via `sessionStorage`. If state is missing on `/unlocked` or `/copy`, the user is redirected to `/`.

## API routes

- `POST /api/scrape` — Firecrawl + Claude → `CompanyIntel`
- `POST /api/research` — Exa + Claude → `ResearchIntel` (falls back to a heuristic synthesis if Exa fails)
- `POST /api/generate-plays` — Claude → 9 `Play[]`
- `POST /api/generate-playbooks` — Claude (parallel x 3) → `Play[]` with `playbook`
- `POST /api/generate-copy` — Claude (parallel x 3) → `Play[]` with `copy`
- `POST /api/notify` — Resend → lead notification HTML email to `NOTIFICATION_EMAIL`

## Notes

- Firecrawl scrape failures degrade to a basic `fetch()` HTML extractor
- Exa research failures degrade to a generic fallback so the rest of the flow never hard-fails
- The notify email is fire-and-forget; the gate form does not block the user if Resend is misconfigured
- Calendly link on Stage 3 points to `https://calendly.com/d/ckmr-kng-h2z` — update in `app/copy/page.tsx` if that changes
