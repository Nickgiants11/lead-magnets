# Website Change Signals — Lead Gen Skill

Monitor competitor and target company websites for rebrands, overhauls, and significant changes. Turn detections into warm outreach.

---

## Why This Works

Companies in "transformation mode" are evaluating everything:
- New vendors
- New tools  
- New partners

A website rebrand signals budget, decision-making momentum, and openness to change.

**Two plays:**
1. **Competitor sites** → Their customers might be ready to switch
2. **Target company sites** → They're in buying mode

---

## Quick Start (Visualping)

**Time:** 10 minutes
**Cost:** Free (5 pages) or $10/mo (25 pages)

### Step 1: Create account
Go to [visualping.io](https://visualping.io) and sign up.

### Step 2: Add pages to monitor

For each competitor or target company:
1. Paste URL (homepage, pricing page, or about page)
2. Select "Full Page" or highlight specific section
3. Set frequency: **Daily**
4. Set sensitivity: **Medium** (catches rebrands, ignores minor tweaks)

### Step 3: Configure alerts
- Email notification (default)
- Or webhook to Slack/Zapier/n8n (Pro plan)

### Step 4: Review weekly
When you get an alert, visit the site and confirm it's a real change. Then reach out.

---

## What to Monitor

### Competitor sites (steal their customers)
```
https://competitor1.com
https://competitor1.com/pricing
https://competitor2.com
https://competitor2.com/features
```

### Target companies (catch them in buying mode)
- Companies that just raised funding
- Companies with new marketing leadership
- High-value prospects you're nurturing

### High-signal pages
| Page | Why |
|------|-----|
| Homepage | Rebrand = transformation mode |
| Pricing | Price change = strategy shift |
| Careers | Hiring surge = growth = budget |
| About/Team | Leadership changes |

---

## Outreach Templates

### For target companies (they rebranded)

**Subject:** Saw the rebrand — looks sharp

```
Hey [Name],

Noticed [Company] just refreshed the site — the new positioning around [X] is solid.

When companies go through rebrands, they're usually rethinking other stuff too. If outbound is on the list, happy to share what's working for similar companies right now.

Either way, congrats on the launch.

[Signature]
```

### For competitor's customers (competitor rebranded)

**Subject:** Quick question about [Competitor]

```
Hey [Name],

Saw [Competitor] just went through a major rebrand — usually means changes under the hood too.

If you've noticed any disruption or are just curious what else is out there, happy to show you what we're doing differently.

No pressure either way.

[Signature]
```

---

## Advanced: Automated Script

For teams that want full control. Runs daily, alerts on changes.

### Install dependencies
```bash
npm install puppeteer
```

### Script: `monitor.mjs`

See `scripts/monitor.mjs` in this skill folder.

### Run manually
```bash
node scripts/monitor.mjs
```

### Run on cron (daily 9am)
```bash
0 9 * * * cd /path/to/skill && node scripts/monitor.mjs
```

---

## n8n Workflow (No-Code)

### Nodes:
1. **Schedule Trigger** — Daily at 9am
2. **HTTP Request** — GET target URL
3. **Code** — Hash the response body
4. **Read Binary File** — Load previous hash
5. **IF** — Compare hashes
6. **Slack/Email** — Alert if changed
7. **Write Binary File** — Save new hash

Import `workflows/website-monitor.json` into n8n.

---

## Costs

| Option | Free Tier | Paid |
|--------|-----------|------|
| Visualping | 5 pages, 2 checks/day | $10/mo = 25 pages |
| Distill.io | Unlimited (local) | $15/mo (cloud) |
| Custom script | Free | Server costs (~$5/mo) |
| n8n | Self-hosted free | Cloud $20/mo |

---

## Results to Expect

- **Detection rate:** 2-5 relevant changes per month (per 20 monitored sites)
- **Response rate:** 15-25% (2-3x normal cold email)
- **Best for:** Agency owners, SaaS sales teams, anyone doing outbound

---

## Files in This Skill

```
website-change-signals/
├── SKILL.md (this file)
├── scripts/
│   └── monitor.mjs (Node.js monitoring script)
├── templates/
│   └── outreach-emails.md (copy-paste templates)
└── workflows/
    └── website-monitor.json (n8n workflow)
```

---

*Created by Nick Konstantinidis @ BuzzLead*
