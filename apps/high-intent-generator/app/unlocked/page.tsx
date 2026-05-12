"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import PlaybookExpander from "@/components/PlaybookExpander";
import Atmosphere from "@/components/Atmosphere";
import { loadState, saveState } from "@/lib/utils";
import type { CompanyIntel, SignalCampaign, ResearchIntel } from "@/lib/types";

const LOADING_MESSAGES = [
  "Building your signal playbooks...",
  "Generating AI Ark + Apollo list filters...",
  "Mapping data sourcing steps...",
  "Tailoring playbooks to your offer...",
  "Almost done...",
];

export default function UnlockedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrichedCampaigns, setEnrichedCampaigns] = useState<SignalCampaign[]>([]);

  useEffect(() => {
    const state = loadState();
    if (
      !state ||
      !state.selectedCampaigns ||
      state.selectedCampaigns.length === 0 ||
      !state.companyIntel
    ) {
      router.replace("/");
      return;
    }

    const alreadyEnriched = state.selectedCampaigns.every((c) => !!c.playbook);
    if (alreadyEnriched) {
      setEnrichedCampaigns(state.selectedCampaigns);
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
            campaigns: state.selectedCampaigns,
            companyIntel: state.companyIntel as CompanyIntel,
            researchIntel: (state.researchIntel as ResearchIntel) ?? null,
          }),
        });
        if (!res.ok) {
          const { error: msg } = await res.json().catch(() => ({}));
          throw new Error(msg || "Generation timed out. Please try again.");
        }
        const { campaigns } = (await res.json()) as { campaigns: SignalCampaign[] };
        if (cancelled) return;
        setEnrichedCampaigns(campaigns);
        const existing = loadState() ?? {};
        saveState({ ...existing, selectedCampaigns: campaigns, stage: 2 });
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Generation timed out. Please try again.";
        setError(msg);
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

      <main
        className="relative max-w-container mx-auto px-6 md:px-12 py-12 md:py-20"
        style={{ zIndex: 10 }}
      >
        <header className="mb-12">
          <div className="bl-eyebrow mb-6">YOUR PLAYBOOKS</div>
          <h1 className="hero-headline text-text-primary mb-6">
            Your signal playbooks{" "}
            <em className="bl-serif text-accent-light">are ready.</em>
          </h1>
          <p
            className="text-text-secondary max-w-[680px]"
            style={{ fontSize: 17, lineHeight: 1.6 }}
          >
            Step-by-step data sourcing and list-building for your 3 highest-intent campaigns.
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

        {!loading && !error && enrichedCampaigns.length > 0 && (
          <>
            <div className="space-y-4 mb-12">
              {enrichedCampaigns.map((c, i) => (
                <PlaybookExpander key={c.id} campaign={c} index={i} />
              ))}
            </div>

            <div className="border-t border-border pt-10 flex flex-col items-start gap-3">
              <p className="text-text-secondary">
                Ready to generate signal-triggered outreach scripts for these campaigns?
              </p>
              <button
                type="button"
                onClick={() => router.push("/scripts")}
                className="bl-cta-primary px-6 py-3 uppercase tracking-wider text-sm"
              >
                Generate Outreach Scripts →
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
