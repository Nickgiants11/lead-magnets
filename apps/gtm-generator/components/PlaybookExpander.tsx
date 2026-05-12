"use client";

import { useState } from "react";
import type { Play } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";

interface PlaybookExpanderProps {
  play: Play;
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

function fieldsToText(label: string, fields: Record<string, any>): string {
  const lines = [`${label}`, ""];
  for (const [k, v] of Object.entries(fields)) {
    const formatted = Array.isArray(v) ? v.join(", ") : String(v);
    lines.push(`${k}: ${formatted}`);
  }
  return lines.join("\n");
}

export default function PlaybookExpander({
  play,
  index,
}: PlaybookExpanderProps) {
  const [open, setOpen] = useState(true);
  const pb = play.playbook;

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
          <h3 className="text-2xl truncate" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.6px", color: "var(--color-text-primary)" }}>
            {play.name}
          </h3>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-[1.6px] text-text-tertiary px-2.5 py-1 border border-border rounded-full flex-shrink-0">
            {play.type}
          </span>
        </div>
        <span className="text-text-tertiary font-mono text-sm flex-shrink-0">
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open && pb && (
        <div className="border-t border-border p-5 md:p-6 space-y-7">
          <Section title="The Angle">
            <p className="text-text-secondary leading-relaxed">
              {pb.fullDescription}
            </p>
            <p className="text-text-secondary leading-relaxed mt-3">
              <span className="text-text-primary font-semibold">
                Messaging angle:
              </span>{" "}
              {pb.messagingAngle}
            </p>
          </Section>

          <Section title="Execution Steps">
            <ol className="space-y-2 list-decimal pl-5 text-text-secondary leading-relaxed">
              {pb.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </Section>

          <Section
            title="List Building — AI Ark"
            actions={
              <CopyAllButton text={fieldsToText("AI Ark", pb.aiArkFields)} />
            }
          >
            <Grid>
              <Row label="Job Titles">
                <ChipList items={pb.aiArkFields.jobTitles} />
              </Row>
              <Row label="Exclude Titles">
                <ChipList
                  items={pb.aiArkFields.jobTitlesExclude}
                  variant="danger"
                />
              </Row>
              <Row label="Company Size">
                <span className="text-text-secondary text-sm">
                  {pb.aiArkFields.companySizeMin} – {pb.aiArkFields.companySizeMax}{" "}
                  employees
                </span>
              </Row>
              <Row label="Industries">
                <ChipList items={pb.aiArkFields.industries} />
              </Row>
              <Row label="Keywords">
                <ChipList items={pb.aiArkFields.keywords} />
              </Row>
              <Row label="Seniority">
                <ChipList items={pb.aiArkFields.seniorityLevels} />
              </Row>
              <Row label="Geography">
                <ChipList items={pb.aiArkFields.geographies} />
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
              <CopyAllButton text={fieldsToText("Apollo", pb.apolloFields)} />
            }
          >
            <Grid>
              <Row label="Person Titles">
                <ChipList items={pb.apolloFields.personTitles} />
              </Row>
              <Row label="Excluded Titles">
                <ChipList
                  items={pb.apolloFields.excludedTitles}
                  variant="danger"
                />
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
                <ChipList items={pb.apolloFields.seniorityLevels} />
              </Row>
              <Row label="Locations">
                <ChipList items={pb.apolloFields.locations} />
              </Row>
            </Grid>
          </Section>

          <Section title="Estimated List Size">
            <p className="text-text-secondary">{pb.estimatedListSize}</p>
          </Section>

          <Section title="Why It Works">
            <p className="text-text-secondary italic leading-relaxed">
              {pb.whyItWorks}
            </p>
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
