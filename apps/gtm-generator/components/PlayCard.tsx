"use client";

import type { Difficulty, Play, ResponseRateTier } from "@/lib/types";

interface PlayCardProps {
  play: Play;
  index: number;
}

function difficultyClass(d: Difficulty): string {
  if (d === "Easy") return "border-success/40 text-success";
  if (d === "Medium") return "border-accent-warm/50 text-accent-warm";
  return "border-accent/50 text-accent-light";
}

function tierClass(t: ResponseRateTier): string {
  if (t === "High") return "border-success/40 text-success";
  if (t === "Medium") return "border-border-strong text-text-secondary";
  return "border-accent-light/40 text-accent-light";
}

function PlayIcon({ type }: { type: string }) {
  // Lightweight inline SVG glyphs by play type
  const stroke = 1.8;
  const size = 22;
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "Signal Play":
      return (
        <svg {...props}>
          <path d="M2 12h3l3-9 4 18 3-9h7" />
        </svg>
      );
    case "Pain Play":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        </svg>
      );
    case "Competitor Play":
      return (
        <svg {...props}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "Trigger Play":
      return (
        <svg {...props}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case "Timing Play":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "Account-Based Play":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
  }
}

export default function PlayCard({ play, index }: PlayCardProps) {
  return (
    <div className="bl-glass-card p-7 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="bl-icon-tile">
          <PlayIcon type={play.type} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span
            className={`font-mono text-[10px] uppercase tracking-[1.6px] px-1.5 py-0.5 border rounded-full ${difficultyClass(play.difficulty)}`}
          >
            {play.difficulty}
          </span>
          <span
            className={`font-mono text-[10px] uppercase tracking-[1.6px] px-1.5 py-0.5 border rounded-full ${tierClass(play.responseRateTier)}`}
          >
            {play.responseRateTier}
          </span>
        </div>
      </div>

      <div className="bl-eyebrow-muted">
        {String(index + 1).padStart(2, "0")} · {play.type}
      </div>

      <h3 className="bl-card-title">{play.name}</h3>

      <p className="text-sm text-text-secondary leading-[1.55] flex-1">
        {play.angle}
      </p>

      <div className="bl-cta-link mt-2">
        <span>Unlock playbook</span>
        <svg
          width={13}
          height={13}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </div>
  );
}
