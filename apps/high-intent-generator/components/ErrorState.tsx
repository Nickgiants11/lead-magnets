"use client";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-surface border border-danger/60 p-6 md:p-8 rounded-xl">
      <div className="font-mono text-[11px] uppercase tracking-wider text-danger mb-2">
        Error
      </div>
      <h3 className="text-text-primary text-lg font-semibold mb-2">{message}</h3>
      <p className="text-text-secondary text-sm mb-5">
        This sometimes happens with unusual URLs or slow APIs. Try again.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="bl-cta-primary px-5 py-2.5 uppercase tracking-wider text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
