"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CompanyIntel, LeadCapture, SignalCampaign } from "@/lib/types";
import { isValidEmail, loadState, saveState } from "@/lib/utils";

interface GateFormProps {
  campaigns: SignalCampaign[];
  companyIntel: CompanyIntel | null;
  defaultCompanyName?: string;
  defaultEmail?: string;
}

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  selectedCampaigns?: string;
  submit?: string;
}

export default function GateForm({
  campaigns,
  companyIntel,
  defaultCompanyName,
  defaultEmail,
}: GateFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState(defaultCompanyName ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!isValidEmail(email)) next.email = "Enter a valid email";
    if (!phone.trim()) next.phone = "Phone is required";
    if (!company.trim()) next.company = "Company name is required";
    if (selectedIds.length !== 3)
      next.selectedCampaigns = "Select exactly 3 signals to unlock";
    return next;
  };

  const toggleCampaign = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
      return;
    }
    if (selectedIds.length >= 3) return;
    setSelectedIds([...selectedIds, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const lead: LeadCapture = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company.trim(),
    };

    try {
      const selectedCampaigns = campaigns.filter((c) => selectedIds.includes(c.id));

      // Fire-and-forget the notification email; don't block the user if it fails
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadCapture: lead,
          companyIntel,
          campaigns: selectedCampaigns,
        }),
      }).catch(() => {
        // ignore
      });

      const existing = loadState() ?? {};
      saveState({
        ...existing,
        leadCapture: lead,
        selectedCampaigns,
        campaigns,
        companyIntel: companyIntel ?? undefined,
        stage: 2,
      });
      router.push("/unlocked");
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
      setSubmitting(false);
    }
  };

  return (
    <div className="bl-glass-card p-6 md:p-8">
      <div className="bl-eyebrow mb-3">UNLOCK</div>
      <h2
        className="text-3xl mb-3"
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 400,
          letterSpacing: "-0.8px",
          lineHeight: 1.05,
          color: "var(--color-text-primary)",
        }}
      >
        Unlock your signal playbooks.
      </h2>
      <p className="text-text-secondary mb-6" style={{ fontSize: 15, lineHeight: 1.55 }}>
        Choose 3 signals to get the full playbook — data sourcing steps, list-building fields, and
        outreach scripts for each.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Full Name"
            value={name}
            onChange={setName}
            error={errors.name}
            required
          />
          <Field
            label="Work Email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            type="email"
            required
          />
          <Field
            label="Phone Number"
            value={phone}
            onChange={setPhone}
            error={errors.phone}
            type="tel"
            required
          />
          <Field
            label="Company Name"
            value={company}
            onChange={setCompany}
            error={errors.company}
            required
          />
        </div>

        <div className="border-t border-border pt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
              Select 3 signals to unlock
            </span>
            <span
              className={`font-mono text-[11px] uppercase tracking-wider ${
                selectedIds.length === 3 ? "text-accent" : "text-text-tertiary"
              }`}
            >
              {selectedIds.length}/3 selected
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {campaigns.map((c) => {
              const selected = selectedIds.includes(c.id);
              const disabled = !selected && selectedIds.length >= 3;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCampaign(c.id)}
                  disabled={disabled}
                  className={`text-left p-3 border transition-colors rounded-xl ${
                    selected
                      ? "border-accent bg-accent/10 text-accent"
                      : disabled
                        ? "border-border bg-surface text-text-tertiary cursor-not-allowed opacity-60"
                        : "border-border bg-surface text-text-primary hover:border-border-strong"
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider mb-1 opacity-80">
                    {c.signalType}
                  </div>
                  <div className="text-sm font-semibold leading-tight">{c.name}</div>
                </button>
              );
            })}
          </div>
          {errors.selectedCampaigns && (
            <p className="text-danger text-xs mt-2 font-mono uppercase tracking-wider">
              {errors.selectedCampaigns}
            </p>
          )}
        </div>

        {errors.submit && (
          <p className="text-danger text-sm">{errors.submit}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto bl-cta-primary px-6 py-3 uppercase tracking-wider text-sm"
        >
          {submitting ? "Unlocking…" : "Unlock My Playbooks →"}
        </button>
      </form>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
}

function Field({ label, value, onChange, error, required, type = "text" }: FieldProps) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary block mb-1.5">
        {label}
        {required && " *"}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-surface-2 border px-3 py-2.5 text-text-primary text-sm focus:outline-none transition-colors rounded-xl ${
          error
            ? "border-danger focus:border-danger"
            : "border-border focus:border-accent"
        }`}
      />
      {error && (
        <span className="text-danger text-xs mt-1 block">{error}</span>
      )}
    </label>
  );
}
