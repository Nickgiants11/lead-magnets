"use client";

import { useState } from "react";
import type { SignalCampaign, SignalPlaybook } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";

const SIGNAL_ICONS: Record<string, string> = {
  'Job Posting': '📋',
  'Funding Event': '💰',
  'Tech Stack': '🔧',
  'Behavioral Intent': '🎯',
  'LinkedIn Activity': '💼',
  'Competitor Dissatisfaction': '😤',
  'Trigger Event': '⚡',
  'Expansion Signal': '📈',
  'Pain Peak Signal': '🔥',
};

const TIER_STYLES: Record<string, string> = {
  Highest: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  High: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  Medium: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
};

interface PlaybookExpanderProps {
  campaign: SignalCampaign;
  index: number;
}

function Chip({
  text,
  variant = "default",
}: {
  text: string;
  variant?: "default" | "danger";
}) {
  return (
    <span
      className={`inline-block font-mono text-[11px] px-2 py-1 border rounded-xl ${
        variant === "danger"
          ? "border-danger/50 text-danger bg-danger/5"
          : "border-border-strong text-text-secondary bg-surface-2"
      }`}
    >
      {text}
    </span>
  );
}

function ChipList({
  items,
  variant = "default",
}: {
  items: string[] | undefined;
  variant?: "default" | "danger";
}) {
  if (!items || items.length === 0)
    return <span className="text-text-tertiary text-sm">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <Chip key={i} text={t} variant={variant} />
      ))}
    </div>
  );
}

function CopyAllButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(text);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }}
      className="font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 border border-border-strong text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors rounded-xl"
    >
      {copied ? "Copied!" : "Copy All Fields"}
    </button>
  );
}

function fieldsToText(label: string, fields: Record<string, unknown>): string {
  const lines = [`${label}`, ""];
  for (const [k, v] of Object.entries(fields)) {
    const formatted = Array.isArray(v) ? v.join(", ") : String(v);
    lines.push(`${k}: ${formatted}`);
  }
  return lines.join("\n");
}

export default function PlaybookExpander({ campaign, index }: PlaybookExpanderProps) {
  const [open, setOpen] = useState(true);
  const pb: SignalPlaybook | undefined = campaign.playbook;
  const icon = SIGNAL_ICONS[campaign.signalType] ?? '🎯';

  return (
    <div className="bl-glass-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 hover:bg-surface-2/40 transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-mono text-xs text-accent-light flex-shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex-shrink-0 text-base">{icon}</span>
          <h3
            className="text-2xl truncate"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              letterSpacing: "-0.6px",
              color: "var(--color-text-primary)",
            }}
          >
            {campaign.name}
          </h3>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-[1.6px] text-text-tertiary px-2.5 py-1 border border-border rounded-full flex-shrink-0">
            {campaign.signalType}
          </span>
          <span
            className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TIER_STYLES[campaign.conversionTier] ?? 'bg-white/10 text-white/60 border border-white/10'}`}
          >
            {campaign.conversionTier} Intent
          </span>
        </div>
        <span className="text-text-tertiary font-mono text-sm flex-shrink-0">
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open && pb && (
        <div className="border-t border-border p-5 md:p-6 space-y-7">
          <Section title="The Signal">
            <p className="text-text-secondary leading-relaxed">{pb.signalDefinition}</p>
            <p className="text-text-secondary leading-relaxed mt-3">
              <span className="text-text-primary font-semibold">Why high-intent: </span>
              {pb.whyHighIntent}
            </p>
          </Section>

          <Section title="How to Source the Data">
            <ol className="space-y-4 list-none pl-0">
              {pb.dataSourceSteps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-mono text-[11px] text-accent-light flex-shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <span className="inline-block font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-accent/30 text-accent-light rounded-full mb-1.5">
                      {step.tool}
                    </span>
                    <p className="text-text-secondary text-sm leading-relaxed">{step.action}</p>
                    {step.filters && step.filters.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {step.filters.map((f, fi) => (
                          <span
                            key={fi}
                            className="inline-block font-mono text-[10px] px-2 py-0.5 border border-border text-text-tertiary bg-surface-2 rounded"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section
            title="List Building — AI Ark"
            actions={
              <CopyAllButton
                text={fieldsToText("AI Ark", {
                  "Job Titles": pb.aiArkFields.jobTitles,
                  "Exclude Titles": pb.aiArkFields.excludeTitles,
                  "Company Size Min": pb.aiArkFields.companySizeMin,
                  "Company Size Max": pb.aiArkFields.companySizeMax,
                  Industries: pb.aiArkFields.industries,
                  Keywords: pb.aiArkFields.keywords,
                  Seniority: pb.aiArkFields.seniority,
                  Geography: pb.aiArkFields.geography,
                  Signals: pb.aiArkFields.signals,
                })}
              />
            }
          >
            <Grid>
              <Row label="Job Titles">
                <ChipList items={pb.aiArkFields.jobTitles} />
              </Row>
              <Row label="Exclude Titles">
                <ChipList items={pb.aiArkFields.excludeTitles} variant="danger" />
              </Row>
              <Row label="Company Size">
                <span className="text-text-secondary text-sm">
                  {pb.aiArkFields.companySizeMin} – {pb.aiArkFields.companySizeMax} employees
                </span>
              </Row>
              <Row label="Industries">
                <ChipList items={pb.aiArkFields.industries} />
              </Row>
              <Row label="Keywords">
                <ChipList items={pb.aiArkFields.keywords} />
              </Row>
              <Row label="Seniority">
                <ChipList items={pb.aiArkFields.seniority} />
              </Row>
              <Row label="Geography">
                <ChipList items={pb.aiArkFields.geography} />
              </Row>
              {pb.aiArkFields.signals && pb.aiArkFields.signals.length > 0 && (
                <Row label="Signals">
                  <ChipList items={pb.aiArkFields.signals} />
                </Row>
              )}
            </Grid>
          </Section>

          <Section
            title="List Building — Apollo"
            actions={
              <CopyAllButton
                text={fieldsToText("Apollo", {
                  "Person Titles": pb.apolloFields.personTitles,
                  "Excluded Titles": pb.apolloFields.excludedTitles,
                  "Employee Ranges": pb.apolloFields.employeeRanges,
                  Industries: pb.apolloFields.industries,
                  Keywords: pb.apolloFields.keywords,
                  Seniority: pb.apolloFields.seniority,
                  Locations: pb.apolloFields.locations,
                })}
              />
            }
          >
            <Grid>
              <Row label="Person Titles">
                <ChipList items={pb.apolloFields.personTitles} />
              </Row>
              <Row label="Excluded Titles">
                <ChipList items={pb.apolloFields.excludedTitles} variant="danger" />
              </Row>
              <Row label="Employee Ranges">
                <ChipList items={pb.apolloFields.employeeRanges} />
              </Row>
              <Row label="Industries">
                <ChipList items={pb.apolloFields.industries} />
              </Row>
              <Row label="Keywords">
                <ChipList items={pb.apolloFields.keywords} />
              </Row>
              <Row label="Seniority">
                <ChipList items={pb.apolloFields.seniority} />
              </Row>
              <Row label="Locations">
                <ChipList items={pb.apolloFields.locations} />
              </Row>
            </Grid>
          </Section>

          <Section title="Expected Results">
            <p className="text-text-secondary">{pb.estimatedListSize}</p>
            <p className="text-text-secondary mt-2 text-sm">{pb.conversionContext}</p>
          </Section>

          <Section title="Why It Works">
            <p className="text-text-secondary italic leading-relaxed">{pb.whyItWorks}</p>
          </Section>
        </div>
      )}
      {open && !pb && (
        <div className="border-t border-border p-5 text-text-tertiary text-sm">
          Playbook unavailable — please retry generation.
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-3">
        <h4 className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
          {title}
        </h4>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 md:gap-4 py-2 border-b border-border/50 last:border-0">
      <div className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary pt-1">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}
