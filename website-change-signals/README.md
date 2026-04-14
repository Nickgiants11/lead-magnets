# Website Change Signals

Monitor competitor and target company websites for rebrands. When they change, reach out.

**Why it works:** Companies in "transformation mode" are evaluating everything — new vendors, tools, partners. A website rebrand signals budget and openness to change.

---

## Two Plays

1. **Monitor competitor sites** → When they rebrand, their customers might be frustrated with the instability. Reach out.

2. **Monitor target companies** → When they rebrand, they're in buying mode. Perfect time to start a conversation.

---

## Quick Start (5 minutes)

### Option 1: Visualping (Easiest)

1. Go to [visualping.io](https://visualping.io) — free tier = 5 pages
2. Add competitor URLs (homepage, pricing page)
3. Set to daily checks, medium sensitivity
4. Get email alerts when something changes
5. Reach out using templates below

### Option 2: Run the Script (More Control)

```bash
# Clone this repo
git clone https://github.com/Nickgiants11/giveaways.git
cd giveaways/website-change-signals

# Install dependencies
npm install puppeteer

# Add sites to monitor
node scripts/monitor.mjs --add https://competitor.com --name "Competitor A" --type competitor

# Run the check
node scripts/monitor.mjs

# (Optional) Set up daily cron
# 0 9 * * * cd /path/to/website-change-signals && node scripts/monitor.mjs
```

### Option 3: n8n Workflow (No-Code)

Import `workflows/website-monitor.json` into your n8n instance.

---

## What to Monitor

| Page | Why |
|------|-----|
| Competitor homepage | Their customers might be ready to switch |
| Target company homepage | They're in buying mode |
| Pricing pages | Price changes = strategy shift |
| Careers pages | Hiring = growth = budget |

---

## Outreach Templates

### When a target company rebrands:

**Subject:** Saw the rebrand — looks sharp

```
Hey [Name],

Noticed [Company] just refreshed the site — the new positioning is solid.

When companies go through rebrands, they're usually rethinking other stuff too. 
If [your service] is on the list, happy to share what's working for similar companies.

Either way, congrats on the launch.

[Signature]
```

### When a competitor rebrands (reach out to their customers):

**Subject:** Quick question about [Competitor]

```
Hey [Name],

Saw [Competitor] just went through a major rebrand — usually means changes under the hood too.

If you've noticed any disruption or are curious what else is out there, 
happy to show you what we're doing differently.

No pressure either way.

[Signature]
```

More templates in [templates/outreach-emails.md](./templates/outreach-emails.md)

---

## Files

```
website-change-signals/
├── README.md          ← You're here
├── SKILL.md           ← Detailed guide
├── scripts/
│   └── monitor.mjs    ← Node.js monitoring script
├── templates/
│   └── outreach-emails.md  ← 5 copy-paste email templates
└── workflows/
    └── website-monitor.json  ← n8n workflow (import directly)
```

---

## Results to Expect

- 2-5 relevant changes per month (per 20 sites monitored)
- 15-25% response rate (2-3x normal cold email)
- Best for: Agency owners, SaaS sales, anyone doing outbound

---

## Cost

| Option | Free | Paid |
|--------|------|------|
| Visualping | 5 pages | $10/mo for 25 |
| Custom script | Free | Server costs |
| n8n | Self-hosted free | Cloud $20/mo |

---

Made by [Nick Konstantinidis](https://twitter.com/nickkonstantinidis) @ [BuzzLead](https://buzzlead.io)
