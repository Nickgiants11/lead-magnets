"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import CopyOutput from "@/components/CopyOutput";
import Atmosphere from "@/components/Atmosphere";
import { loadState, saveState } from "@/lib/utils";
import type { CompanyIntel, Play } from "@/lib/types";

const LOADING_MESSAGES = [
  "Writing your cold email copy…",
  "Applying BuzzLead copywriting frameworks…",
  "Running quality checks…",
  "Almost done…",
];

const CALENDLY_URL = "https://calendly.com/d/ckmr-kng-h2z";

export default function CopyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const state = loadState();
    if (
      !state ||
      !state.selectedPlays ||
      state.selectedPlays.length === 0 ||
      !state.companyIntel
    ) {
      router.replace("/");
      return;
    }

    const alreadyHaveCopy = state.selectedPlays.every((p) => !!p.copy);
    if (alreadyHaveCopy) {
      setPlays(state.selectedPlays);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/generate-copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plays: state.selectedPlays,
            companyIntel: state.companyIntel as CompanyIntel,
          }),
        });
        if (!res.ok) {
          const { error: msg } = await res.json().catch(() => ({}));
          throw new Error(msg || "Generation timed out. Please try again.");
        }
        const { plays: generated } = (await res.json()) as { plays: Play[] };
        if (cancelled) return;
        setPlays(generated);
        const existing = loadState() ?? {};
        saveState({ ...existing, selectedPlays: generated, stage: 3 });
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Generation timed out. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-bg">
      <Atmosphere />
      <ProgressBar current={3} />

      <main className="relative max-w-container mx-auto px-6 md:px-12 py-12 md:py-20" style={{ zIndex: 10 }}>
        <header className="mb-12">
          <div className="bl-eyebrow mb-6">COLD EMAIL COPY</div>
          <h1 className="hero-headline text-text-primary mb-6">
            Cold email copy<br />
            <em className="bl-serif text-accent-light">for your 3 plays.</em>
          </h1>
          <p className="text-text-secondary max-w-[680px]" style={{ fontSize: 17, lineHeight: 1.6 }}>
            2 variants per play. Frameworks labeled. Ready to load into
            EmailBison or Smartlead.
          </p>
        </header>

        {loading && (
          <div className="max-w-2xl">
            <LoadingState messages={LOADING_MESSAGES} />
          </div>
        )}

        {error && !loading && (
          <div className="max-w-2xl">
            <ErrorState
              message={error}
              onRetry={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
            />
          </div>
        )}

        {!loading && !error && plays.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2.5 mb-8">
              {plays.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className="bl-pill"
                  data-active={i === activeIdx}
                >
                  {String(i + 1).padStart(2, "0")} · {p.name}
                </button>
              ))}
            </div>

            <div className="mb-12">
              {plays[activeIdx] && <CopyOutput play={plays[activeIdx]} />}
            </div>

            <div className="border-t border-border pt-10">
              <div className="bl-glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="bl-eyebrow mb-3">DONE-FOR-YOU</div>
                  <h2 className="text-2xl md:text-3xl mb-2" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.8px", lineHeight: 1.05, color: "var(--color-text-primary)" }}>
                    Want us to run these for you?
                  </h2>
                  <p className="text-text-secondary text-sm">
                    20 minutes. We&apos;ll audit your ICP and map out the first
                    90 days.
                  </p>
                </div>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bl-cta-primary px-6 py-3 uppercase tracking-wider text-sm whitespace-nowrap"
                >
                  Book a Strategy Call →
                </a>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-border py-6 mt-16">
        <div className="max-w-container mx-auto px-6 md:px-12 text-text-tertiary text-xs font-mono uppercase tracking-wider">
          Built by BuzzLead · buzzlead.io
        </div>
      </footer>
    </div>
  );
}
