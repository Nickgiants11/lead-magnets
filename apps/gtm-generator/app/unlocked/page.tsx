"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import PlaybookExpander from "@/components/PlaybookExpander";
import Atmosphere from "@/components/Atmosphere";
import { loadState, saveState } from "@/lib/utils";
import type { CompanyIntel, Play, ResearchIntel } from "@/lib/types";

const LOADING_MESSAGES = [
  "Building your full playbooks…",
  "Generating AI Ark + Apollo list filters…",
  "Tailoring execution steps to your offer…",
  "Almost done…",
];

export default function UnlockedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [enrichedPlays, setEnrichedPlays] = useState<Play[]>([]);

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

    setCompanyName(state.companyIntel.companyName);

    const alreadyEnriched = state.selectedPlays.every((p) => !!p.playbook);
    if (alreadyEnriched) {
      setEnrichedPlays(state.selectedPlays);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/generate-playbooks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plays: state.selectedPlays,
            companyIntel: state.companyIntel as CompanyIntel,
            researchIntel: (state.researchIntel as ResearchIntel) ?? null,
          }),
        });
        if (!res.ok) {
          const { error: msg } = await res.json().catch(() => ({}));
          throw new Error(msg || "Generation timed out. Please try again.");
        }
        const { plays } = (await res.json()) as { plays: Play[] };
        if (cancelled) return;
        setEnrichedPlays(plays);
        const existing = loadState() ?? {};
        saveState({ ...existing, selectedPlays: plays, stage: 2 });
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
      <ProgressBar current={2} />

      <main className="relative max-w-container mx-auto px-6 md:px-12 py-12 md:py-20" style={{ zIndex: 10 }}>
        <header className="mb-12">
          <div className="bl-eyebrow mb-6">YOUR PLAYBOOKS</div>
          <h1 className="hero-headline text-text-primary mb-6">
            3 plays.<br />
            <em className="bl-serif text-accent-light">Full execution.</em>
          </h1>
          {companyName && (
            <p className="text-text-secondary max-w-[680px]" style={{ fontSize: 17, lineHeight: 1.6 }}>
              {companyName}&apos;s tailored outbound playbooks with list-building
              fields for AI Ark and Apollo.
            </p>
          )}
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
                router.refresh();
                window.location.reload();
              }}
            />
          </div>
        )}

        {!loading && !error && enrichedPlays.length > 0 && (
          <>
            <div className="space-y-4 mb-12">
              {enrichedPlays.map((p, i) => (
                <PlaybookExpander key={p.id} play={p} index={i} />
              ))}
            </div>

            <div className="border-t border-border pt-10 flex flex-col items-start gap-3">
              <p className="text-text-secondary">
                Ready to generate cold email copy for these plays?
              </p>
              <button
                type="button"
                onClick={() => router.push("/copy")}
                className="bl-cta-primary px-6 py-3 uppercase tracking-wider text-sm"
              >
                Generate Copy →
              </button>
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
