"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import { CampaignCard } from "@/components/CampaignCard";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import Atmosphere from "@/components/Atmosphere";
import {
  isValidEmail,
  loadState,
  normalizeUrl,
  saveState,
} from "@/lib/utils";
import type { CompanyIntel, SignalCampaign, ResearchIntel } from "@/lib/types";

const SCRAPING_MESSAGES = [
  "Reading your website...",
  "Extracting your offer and ICP...",
  "Identifying your target market...",
];

const RESEARCHING_MESSAGES = [
  "Scanning buying signals in your market...",
  "Searching Reddit for buyer pain points...",
  "Analysing competitor landscape...",
  "Identifying intent triggers...",
];

const GENERATING_MESSAGES = [
  "Selecting the 5 strongest signal types for your ICP...",
  "Matching signals to your offer...",
  "Building high-intent campaign framework...",
  "Calibrating conversion potential...",
];

type LoadingStep = "scraping" | "researching" | "generating";

const STEP_MESSAGES: Record<LoadingStep, string[]> = {
  scraping: SCRAPING_MESSAGES,
  researching: RESEARCHING_MESSAGES,
  generating: GENERATING_MESSAGES,
};

interface FormErrors {
  fullName?: string;
  websiteUrl?: string;
  companyName?: string;
  userEmail?: string;
  phone?: string;
  selectedIds?: string;
}

export default function Home() {
  const router = useRouter();

  // Form fields
  const [fullName, setFullName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Generation state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("scraping");
  const [companyIntel, setCompanyIntel] = useState<CompanyIntel | null>(null);
  const [researchIntel, setResearchIntel] = useState<ResearchIntel | null>(null);
  const [campaigns, setCampaigns] = useState<SignalCampaign[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Campaign selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const existing = loadState();
    if (existing) {
      if (existing.websiteUrl) setWebsiteUrl(existing.websiteUrl);
      if (existing.companyName) setCompanyName(existing.companyName);
      if (existing.userEmail) setUserEmail(existing.userEmail);
      if (existing.companyIntel) setCompanyIntel(existing.companyIntel);
      if (existing.campaigns && existing.campaigns.length > 0)
        setCampaigns(existing.campaigns);
    }
  }, []);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!websiteUrl.trim()) next.websiteUrl = "Website URL is required";
    if (!companyName.trim()) next.companyName = "Company name is required";
    if (!userEmail.trim()) next.userEmail = "Email is required";
    else if (!isValidEmail(userEmail)) next.userEmail = "Enter a valid email";
    if (!phone.trim()) next.phone = "Phone number is required";
    return next;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setLoading(true);
    setError(null);
    setCampaigns([]);
    setCompanyIntel(null);
    setSelectedIds([]);

    try {
      const url = normalizeUrl(websiteUrl);

      setLoadingStep("scraping");
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, companyName }),
      });
      if (!scrapeRes.ok) {
        const { error: msg } = await scrapeRes.json().catch(() => ({}));
        throw new Error(msg || "We had trouble scraping that URL. Try your homepage URL.");
      }
      const { companyIntel: intel } = (await scrapeRes.json()) as { companyIntel: CompanyIntel };

      setLoadingStep("researching");
      const research = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIntel: intel }),
      })
        .then(async (r) => {
          if (!r.ok) return null;
          const { researchIntel } = (await r.json()) as { researchIntel: ResearchIntel };
          return researchIntel;
        })
        .catch(() => null);

      setLoadingStep("generating");
      const campaignsRes = await fetch("/api/generate-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIntel: intel, researchIntel: research }),
      });
      if (!campaignsRes.ok) {
        const { error: msg } = await campaignsRes.json().catch(() => ({}));
        throw new Error(msg || "Generation timed out. Please try again.");
      }
      const { campaigns: generated } = (await campaignsRes.json()) as { campaigns: SignalCampaign[] };

      setCompanyIntel(intel);
      setResearchIntel(research);
      setCampaigns(generated);

      saveState({
        websiteUrl: url,
        companyName,
        userEmail,
        companyIntel: intel,
        researchIntel: research ?? undefined,
        campaigns: generated,
        stage: 1,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(/network/i.test(msg) ? "Connection error. Check your internet and try again." : msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUnlock = async () => {
    if (selectedIds.length === 0) {
      setErrors({ selectedIds: "Select at least 1 signal to unlock" });
      return;
    }
    setErrors({});
    setUnlocking(true);

    const selectedCampaigns = campaigns.filter((c) => selectedIds.includes(c.id));
    const leadCapture = {
      name: fullName.trim(),
      email: userEmail.trim(),
      phone: phone.trim(),
      company: companyName.trim(),
    };

    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadCapture, companyIntel, campaigns: selectedCampaigns }),
    }).catch(() => {});

    const existing = loadState() ?? {};
    saveState({
      ...existing,
      leadCapture,
      selectedCampaigns,
      campaigns,
      companyIntel: companyIntel ?? undefined,
      researchIntel: researchIntel ?? undefined,
      stage: 2,
    });

    router.push("/unlocked");
  };

  return (
    <div className="min-h-screen bg-bg">
      <Atmosphere />
      <ProgressBar current={1} />

      <main
        className="relative max-w-container mx-auto px-6 md:px-12 py-12 md:py-20"
        style={{ zIndex: 10 }}
      >
        <header className="mb-12">
          <div className="bl-eyebrow mb-6">HIGH-INTENT SIGNAL GENERATOR</div>
          <h1 className="hero-headline text-text-primary mb-6">
            5 high-intent campaigns.{" "}
            <em className="bl-serif text-accent-light">Built for your ICP.</em>
          </h1>
          <p className="text-text-secondary max-w-[680px]" style={{ fontSize: 17, lineHeight: 1.6 }}>
            We scrape your website, scan buying signals in your market, and surface the 5 intent
            triggers most likely to convert — with step-by-step playbooks and outreach scripts.
          </p>
        </header>

        {!loading && campaigns.length === 0 && !error && (
          <form onSubmit={handleGenerate} className="bl-glass-card p-7 md:p-8 space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                placeholder="Jane Smith"
                error={errors.fullName}
              />
              <Field
                label="Company Name"
                value={companyName}
                onChange={setCompanyName}
                placeholder="Acme Corp"
                error={errors.companyName}
              />
              <Field
                label="Work Email"
                value={userEmail}
                onChange={setUserEmail}
                placeholder="jane@acme.com"
                error={errors.userEmail}
                type="email"
              />
              <Field
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                placeholder="+1 (555) 000-0000"
                error={errors.phone}
                type="tel"
              />
            </div>
            <Field
              label="Your Website"
              value={websiteUrl}
              onChange={setWebsiteUrl}
              placeholder="https://yourcompany.com"
              error={errors.websiteUrl}
            />
            <button
              type="submit"
              className="w-full md:w-auto bl-cta-primary px-6 py-3 uppercase tracking-wider text-sm"
            >
              Find My Signals →
            </button>
          </form>
        )}

        {loading && (
          <div className="max-w-2xl">
            <LoadingState messages={STEP_MESSAGES[loadingStep]} />
          </div>
        )}

        {error && !loading && (
          <div className="max-w-2xl">
            <ErrorState message={error} onRetry={() => setError(null)} />
          </div>
        )}

        {!loading && campaigns.length > 0 && companyIntel && (
          <>
            <div className="mb-8">
              <div className="bl-eyebrow-muted mb-3">{companyIntel.industryVertical}</div>
              <h2
                className="text-3xl md:text-[44px]"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "-1.2px",
                  lineHeight: 1.05,
                  color: "var(--color-text-primary)",
                }}
              >
                Your 5 high-intent signal campaigns.
              </h2>
              <p className="text-text-tertiary text-sm mt-3">
                Select the campaigns you want full playbooks for — you can choose all 5.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {campaigns.map((c, i) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  index={i}
                  selected={selectedIds.includes(c.id)}
                  onToggle={() => toggleCampaign(c.id)}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6 border-t border-border">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
                  {selectedIds.length === 0
                    ? "Select at least 1 campaign"
                    : `${selectedIds.length} of ${campaigns.length} selected`}
                </span>
                {errors.selectedIds && (
                  <span className="text-danger text-xs">{errors.selectedIds}</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleUnlock}
                disabled={unlocking || selectedIds.length === 0}
                className="bl-cta-primary px-6 py-3 uppercase tracking-wider text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {unlocking ? "Unlocking…" : `Get My Playbooks →`}
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

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}

function Field({ label, value, onChange, placeholder, error, type = "text" }: FieldProps) {
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
          error ? "border-danger focus:border-danger" : "border-border focus:border-accent"
        }`}
      />
      {error && <span className="text-danger text-xs mt-1 block">{error}</span>}
    </label>
  );
}
