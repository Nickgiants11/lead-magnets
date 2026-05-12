"use client";

import { useEffect, useState } from "react";

interface LoadingStateProps {
  messages: string[];
  intervalMs?: number;
}

export default function LoadingState({
  messages,
  intervalMs = 3000,
}: LoadingStateProps) {
  const [idx, setIdx] = useState(0);
  const [showSlow, setShowSlow] = useState(false);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(
      () => setIdx((i) => (i + 1) % messages.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [messages.length, intervalMs]);

  useEffect(() => {
    const t = setTimeout(() => setShowSlow(true), 45_000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="bl-glass-card p-8 md:p-12 flex flex-col items-center text-center">
      <div className="relative mb-6">
        <span className="block w-3 h-3 rounded-full bg-accent animate-pulse" />
        <span className="absolute inset-0 w-3 h-3 rounded-full bg-accent/50 animate-ping" />
      </div>
      <p className="text-text-primary text-base md:text-lg font-medium min-h-[1.5em]">
        {messages[idx]}
      </p>
      {showSlow && (
        <p className="text-text-tertiary text-xs font-mono uppercase tracking-wider mt-4">
          This is taking longer than usual…
        </p>
      )}
    </div>
  );
}
