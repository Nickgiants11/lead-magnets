"use client";

import type { Play } from "@/lib/types";

interface PlaySelectorProps {
  plays: Play[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  max?: number;
}

export default function PlaySelector({
  plays,
  selectedIds,
  onChange,
  max = 3,
}: PlaySelectorProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
      return;
    }
    if (selectedIds.length >= max) return;
    onChange([...selectedIds, id]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
          Select {max} plays to unlock
        </span>
        <span
          className={`font-mono text-[11px] uppercase tracking-wider ${
            selectedIds.length === max ? "text-accent" : "text-text-tertiary"
          }`}
        >
          {selectedIds.length}/{max} selected
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {plays.map((p) => {
          const selected = selectedIds.includes(p.id);
          const disabled = !selected && selectedIds.length >= max;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
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
                {p.type}
              </div>
              <div className="text-sm font-semibold leading-tight">{p.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
