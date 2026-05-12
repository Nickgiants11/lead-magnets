"use client";

import { useEffect, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import PlayCard from "@/components/PlayCard";
import GateForm from "@/components/GateForm";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import Atmosphere from "@/components/Atmosphere";
import {
  isValidEmail,
  loadState,
  normalizeUrl,
  saveState,
} from "@/lib/utils";
import type { CompanyIntel, Play, ResearchIntel } from "@/lib/types";

const LOADING_MESSAGES = [
  "Scraping your website…",
  "Researching your industry…",
  "Scanning Reddit for buyer complaints…",
  "Generating your 9 outbound plays…",
  "Almost done…",
];

interface FormErrors {
  websiteUrl?: string;
  companyName?: string;
  userEmail?: string;
}

export default function Home() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [loading, setLoading] = useState(false);
  const [companyIntel, setCompanyIntel] = useState<CompanyIntel | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadState();
    if (existing) {
      if (existing.websiteUrl) setWebsiteUrl(existing.websiteUrl);
      if (existing.companyName) setCompanyName(existing.companyName);
      if (existing.userEmail) setUserEmail(existing.userEmail);
      if (existing.companyIntel) setCompanyIntel(existing.companyIntel);
      if (existing.plays && existing.plays.length > 0)
        setPlays(existing.plays);
    }
  }, []);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!websiteUrl.trim()) next.websiteUrl = "Website URL is required";
    if (!companyName.trim()) next.companyName = "Company name is required";
    if (!userEmail.trim()) next.userEmail = "Email is required";
    else if (!isValidEmail(userEmail)) next.userEmail = "Enter a valid email";
    return next;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setLoading(true);
    setError(null);
    setPlays([]);
    setCompanyIntel(null);

    try {
      const url = normalizeUrl(websiteUrl);

      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, companyName }),
      });
      if (!scrapeRes.ok) {
        const { error: msg } = await scrapeRes.json().catch(() => ({}));
        throw new Error(
          msg ||
            "We had trouble scraping that URL. Try your homepage URL.",
        );
      }
      const { companyIntel: intel } = (await scrapeRes.json()) as {
        companyIntel: CompanyIntel;
      };

      const researchPromise = fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIntel: intel }),
      })
        .then(async (r) => {
          if (!r.ok) return null;
          const { researchIntel } = (await r.json()) as {
            researchIntel: ResearchIntel;
          };
          return researchIntel;
        })
        .catch(() => null);

      const research = await researchPromise;

      const playsRes = await fetch("/api/generate-plays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIntel: intel, researchIntel: research }),
      });
      if (!playsRes.ok) {
        const { error: msg } = await playsRes.json().catch(() => ({}));
        throw new Error(msg || "Generation timed out. Please try again.");
      }
      const { plays: generated } = (await playsRes.json()) as { plays: Play[] };

      setCompanyIntel(intel);
      setPlays(generated);

      saveState({
        websiteUrl: url,
        companyName,
        userEmail,
        companyIntel: intel,
        researchIntel: research,
        plays: generated,
        stage: 1,
      });
    } catch (err: any) {
      const msg = err?.message || "Something went wrong. Please try again.";
      setError(/network/i.test(msg) ? "Connection error. Check your internet and try again." : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-bg">
      <Atmosphere />
      <ProgressBar current={1} />

      <main className="relative max-w-container mx-auto px-6 md:px-12 py-12 md:py-20" style={{ zIndex: 10 }}>
        <header className="mb-12">
          <div className="bl-eyebrow mb-6">
            FREE TOOL · ZERO GATES TO START
          </div>
          <h1 className="hero-headline text-text-primary mb-6">
            9 outbound plays<br />
            <em className="bl-serif text-accent-light">built for your offer.</em>
          </h1>
          <p className="text-text-secondary max-w-[680px]" style={{ fontSize: 17, lineHeight: 1.6 }}>
            Drop your website. We&apos;ll scrape it, research your market, and
            generate 9 tailored outbound plays in under 60 seconds. Calculators,
            templates, and strategy generators we run with every BuzzLead client.
          </p>
        </header>

        {!loading && plays.length === 0 && !error && (
          <form
            onSubmit={handleGenerate}
            className="bl-glass-card p-7 md:p-8 space-y-5 max-w-2xl"
          >
            <Field
              label="Your Website"
              value={websiteUrl}
              onChange={setWebsiteUrl}
              placeholder="https://yourcompany.com"
              error={errors.websiteUrl}
            />
            <Field
              label="Company Name"
              value={companyName}
              onChange={setCompanyName}
              placeholder="Acme Corp"
              error={errors.companyName}
            />
            <Field
              label="Your Email"
              value={userEmail}
              onChange={setUserEmail}
              placeholder="you@company.com"
              error={errors.userEmail}
              type="email"
              hint="So we can send your results."
            />
            <button
              type="submit"
              className="w-full md:w-auto bl-cta-primary px-6 py-3 uppercase tracking-wider text-sm"
            >
              Generate My GTM →
            </button>
          </form>
        )}

        {loading && (
          <div className="max-w-2xl">
            <LoadingState messages={LOADING_MESSAGES} />
          </div>
        )}

        {error && !loading && (
          <div className="max-w-2xl">
            <ErrorState message={error} onRetry={handleRetry} />
          </div>
        )}

        {!loading && plays.length > 0 && companyIntel && (
          <>
            <div className="mb-8">
              <div className="bl-eyebrow-muted mb-3">
                {companyIntel.companyName} · {companyIntel.industryVertical}
              </div>
              <h2 className="text-3xl md:text-[44px]" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-1.2px", lineHeight: 1.05, color: "var(--color-text-primary)" }}>
                9 tailored outbound plays.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
              {plays.map((p, i) => (
                <PlayCard key={p.id} play={p} index={i} />
              ))}
            </div>

            <div className="border-t border-border pt-12 mb-8">
              <div className="max-w-2xl mb-6">
                <div className="bl-eyebrow mb-4">UNLOCK</div>
                <h2 className="text-3xl md:text-[44px] mb-4" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-1.2px", lineHeight: 1.05, color: "var(--color-text-primary)" }}>
                  Get the full playbooks.
                </h2>
                <p className="text-text-secondary" style={{ fontSize: 17, lineHeight: 1.6 }}>
                  Select 3 plays. Get step-by-step execution, list-building
                  fields for AI Ark + Apollo, and cold email copy.
                </p>
              </div>

              <GateForm
                plays={plays}
                companyIntel={companyIntel}
                defaultCompanyName={companyName}
                defaultEmail={userEmail}
              />
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

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  hint?: string;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  hint,
}: FieldProps) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary block mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-surface-2 border px-3 py-2.5 text-text-primary text-sm focus:outline-none transition-colors rounded-xl placeholder:text-text-tertiary ${
          error
            ? "border-danger focus:border-danger"
            : "border-border focus:border-accent"
        }`}
      />
      {hint && !error && (
        <span className="text-text-tertiary text-xs mt-1 block">{hint}</span>
      )}
      {error && (
        <span className="text-danger text-xs mt-1 block">{error}</span>
      )}
    </label>
  );
}
