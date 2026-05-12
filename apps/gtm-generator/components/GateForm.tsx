"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CompanyIntel, LeadCapture, Play } from "@/lib/types";
import { isValidEmail, loadState, saveState } from "@/lib/utils";
import PlaySelector from "./PlaySelector";

interface GateFormProps {
  plays: Play[];
  companyIntel: CompanyIntel | null;
  defaultCompanyName?: string;
  defaultEmail?: string;
}

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  selectedPlays?: string;
  submit?: string;
}

export default function GateForm({
  plays,
  companyIntel,
  defaultCompanyName,
  defaultEmail,
}: GateFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState(defaultCompanyName ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!isValidEmail(email)) next.email = "Enter a valid email";
    if (!phone.trim()) next.phone = "Phone is required";
    if (!companyName.trim()) next.companyName = "Company name is required";
    if (selectedIds.length !== 3)
      next.selectedPlays = "Select exactly 3 plays to unlock";
    return next;
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
      companyName: companyName.trim(),
      selectedPlayIds: selectedIds,
    };

    try {
      // Fire-and-forget the notification email; don't block the user if it fails
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadCapture: lead,
          companyIntel,
          plays,
        }),
      }).catch(() => {
        // ignore
      });

      const existing = loadState() ?? {};
      const selectedPlays = plays.filter((p) => selectedIds.includes(p.id));
      saveState({
        ...existing,
        leadCapture: lead,
        selectedPlays,
        plays,
        companyIntel,
        stage: 2,
      });
      router.push("/unlocked");
    } catch (err: any) {
      setErrors({ submit: "Something went wrong. Please try again." });
      setSubmitting(false);
    }
  };

  return (
    <div className="bl-glass-card p-6 md:p-8">
      <div className="bl-eyebrow mb-3">UNLOCK</div>
      <h2 className="text-3xl mb-3" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.8px", lineHeight: 1.05, color: "var(--color-text-primary)" }}>
        Get the full playbooks.
      </h2>
      <p className="text-text-secondary mb-6" style={{ fontSize: 15, lineHeight: 1.55 }}>
        Enter your details, select 3 plays, and unlock step-by-step execution
        guides + AI Ark/Apollo list-building fields.
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
            value={companyName}
            onChange={setCompanyName}
            error={errors.companyName}
            required
          />
        </div>

        <div className="border-t border-border pt-5">
          <PlaySelector
            plays={plays}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            max={3}
          />
          {errors.selectedPlays && (
            <p className="text-danger text-xs mt-2 font-mono uppercase tracking-wider">
              {errors.selectedPlays}
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
