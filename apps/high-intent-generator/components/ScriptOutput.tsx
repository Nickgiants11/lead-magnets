"use client";

import { useState } from "react";
import type { SignalCampaign, ScriptVariant } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";

interface ScriptOutputProps {
  campaigns: SignalCampaign[];
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
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
      className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 border border-border-strong text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors rounded-xl"
    >
      {copied ? "Copied!" : label}
    </button>
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
      <div className="flex items-center justify-between gap-3 mb-2">
        <h4 className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
          {title}
        </h4>
        {actions}
      </div>
      {children}
    </section>
  );
}

function VariantCard({ variant, label }: { variant: ScriptVariant; label: string }) {
  const isLinkedIn = variant.medium === "linkedin";

  return (
    <div className="bl-glass-card p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <span className="bl-eyebrow">
          {label} · {variant.framework}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary px-2 py-0.5 border border-border rounded-full">
          {isLinkedIn ? "LinkedIn DM" : "Cold Email"}
        </span>
      </div>

      {!isLinkedIn && variant.subjectLines && variant.subjectLines.length > 0 && (
        <Section title="Subject Lines">
          <div className="space-y-1.5">
            {variant.subjectLines.map((sl, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 bg-surface-2 border border-border px-3 py-2 rounded-xl"
              >
                <span className="text-sm text-text-primary truncate">{sl}</span>
                <CopyButton text={sl} />
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section
        title={isLinkedIn ? "LinkedIn DM" : "Email Body"}
        actions={<CopyButton text={variant.emailBody} />}
      >
        <pre className="bg-surface-2 border border-border p-4 text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed rounded-xl">
          {variant.emailBody}
        </pre>
      </Section>

      <Section
        title="Follow-Up"
        actions={<CopyButton text={variant.followUp} />}
      >
        <pre className="bg-surface-2 border border-border p-4 text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed rounded-xl">
          {variant.followUp}
        </pre>
      </Section>

      <Section title="Why It Works">
        <p className="text-sm text-text-secondary italic leading-relaxed">
          {variant.whyItWorks}
        </p>
      </Section>
    </div>
  );
}

export default function ScriptOutput({ campaigns }: ScriptOutputProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bl-glass-card p-6 text-text-tertiary text-sm">
        No campaigns available.
      </div>
    );
  }

  const active = campaigns[activeIdx];

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 mb-8">
        {campaigns.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveIdx(i)}
            className="bl-pill"
            data-active={i === activeIdx}
          >
            {String(i + 1).padStart(2, "0")} · {c.name}
          </button>
        ))}
      </div>

      {active && active.scripts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VariantCard variant={active.scripts.variant1} label="Variant 1" />
          <VariantCard variant={active.scripts.variant2} label="Variant 2" />
        </div>
      ) : (
        <div className="bl-glass-card p-6 text-text-tertiary text-sm">
          Scripts unavailable for this campaign — please retry generation.
        </div>
      )}
    </div>
  );
}
