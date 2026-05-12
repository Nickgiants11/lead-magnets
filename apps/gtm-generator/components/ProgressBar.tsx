"use client";

interface ProgressBarProps {
  current: 1 | 2 | 3;
}

const STEPS = [
  { num: 1, label: "Generate Plays" },
  { num: 2, label: "Unlock Playbooks" },
  { num: 3, label: "Get Copy" },
];

export default function ProgressBar({ current }: ProgressBarProps) {
  return (
    <div className="w-full border-b border-border bg-surface-2">
      <div className="max-w-container mx-auto px-6 md:px-12 py-5">
        <div className="flex items-center gap-2 md:gap-4 font-mono text-[11px] uppercase tracking-wider">
          {STEPS.map((step, idx) => {
            const isCompleted = step.num < current;
            const isActive = step.num === current;
            return (
              <div key={step.num} className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-full border text-[10px] flex-shrink-0 ${
                      isCompleted
                        ? "bg-accent border-accent text-bg"
                        : isActive
                          ? "bg-text-primary border-text-primary text-bg"
                          : "border-border-strong text-text-tertiary"
                    }`}
                  >
                    {isCompleted ? "✓" : step.num}
                  </span>
                  <span
                    className={`truncate ${
                      isActive
                        ? "text-text-primary"
                        : isCompleted
                          ? "text-accent"
                          : "text-text-tertiary"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block flex-1 h-px ${
                      isCompleted ? "bg-accent" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
