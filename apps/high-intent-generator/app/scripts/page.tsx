"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import ScriptOutput from "@/components/ScriptOutput";
import Atmosphere from "@/components/Atmosphere";
import { loadState, saveState } from "@/lib/utils";
import type { CompanyIntel, SignalCampaign } from "@/lib/types";

const LOADING_MESSAGES = [
  "Writing signal-triggered outreach scripts...",
  "Crafting cold email subject lines...",
  "Writing LinkedIn DM variants...",
  "Running quality checks...",
  "Almost done...",
];

const CALENDLY_URL = "https://calendly.com/d/ckmr-kng-h2z";

export default function ScriptsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<SignalCampaign[]>([]);

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

    const alreadyHaveScripts = state.selectedCampaigns.every((c) => !!c.scripts);
    if (alreadyHaveScripts) {
      setCampaigns(state.selectedCampaigns);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/generate-scripts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaigns: state.selectedCampaigns,
            companyIntel: state.companyIntel as CompanyIntel,
          }),
        });
        if (!res.ok) {
          const { error: msg } = await res.json().catch(() => ({}));
          throw new Error(msg || "Generation timed out. Please try again.");
        }
        const { campaigns: generated } = (await res.json()) as {
          campaigns: SignalCampaign[];
        };
        if (cancelled) return;
        setCampaigns(generated);
        const existing = loadState() ?? {};
        saveState({ ...existing, selectedCampaigns: generated, stage: 3 });
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
      <ProgressBar current={3} />

      <main
        className="relative max-w-container mx-auto px-6 md:px-12 py-12 md:py-20"
        style={{ zIndex: 10 }}
      >
        <header className="mb-12">
          <div className="bl-eyebrow mb-6">OUTREACH SCRIPTS</div>
          <h1 className="hero-headline text-text-primary mb-6">
            Your outreach scripts{" "}
            <em className="bl-serif text-accent-light">are ready.</em>
          </h1>
          <p
            className="text-text-secondary max-w-[680px]"
            style={{ fontSize: 17, lineHeight: 1.6 }}
          >
            Signal-triggered email and LinkedIn DM scripts for each campaign.
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

        {!loading && !error && campaigns.length > 0 && (
          <>
            <div className="mb-12">
              <ScriptOutput campaigns={campaigns} />
            </div>

            <div className="border-t border-border pt-10">
              <div className="bl-glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="bl-eyebrow mb-3">DONE-FOR-YOU</div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-2 leading-snug">
                    Want us to run these for you?
                  </h2>
                  <p className="text-text-secondary text-sm">
                    20 minutes. We&apos;ll audit your ICP and map out the first 90 days.
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
