'use client';

import { SignalCampaign } from '@/lib/types';

const SIGNAL_ICONS: Record<string, string> = {
  'Job Posting': '📋',
  'Funding Event': '💰',
  'Tech Stack': '🔧',
  'Behavioral Intent': '🎯',
  'LinkedIn Activity': '💼',
  'Competitor Dissatisfaction': '😤',
  'Trigger Event': '⚡',
  'Expansion Signal': '📈',
  'Pain Peak Signal': '🔥',
};

const TIER_STYLES: Record<string, string> = {
  Highest: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  High: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  Medium: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: 'bg-white/10 text-white/60',
  Medium: 'bg-white/10 text-white/60',
  Advanced: 'bg-white/10 text-white/60',
};

export function CampaignCard({ campaign, index }: { campaign: SignalCampaign; index: number }) {
  const icon = SIGNAL_ICONS[campaign.signalType] ?? '🎯';
  const num = String(index + 1).padStart(2, '0');

  return (
    <div className="bl-glass-card rounded-2xl p-5 flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bl-icon-tile w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0">
            {icon}
          </div>
          <span className="text-white/30 text-xs font-mono">{num}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_STYLES[campaign.conversionTier] ?? 'bg-white/10 text-white/60'}`}>
          {campaign.conversionTier} Intent
        </span>
      </div>

      <div>
        <h3 className="text-white font-medium text-sm leading-snug font-[family-name:var(--font-instrument-serif)] italic mb-1">
          {campaign.name}
        </h3>
        <p className="text-white/50 text-xs leading-relaxed">{campaign.angle}</p>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/5">
        <span className="text-xs text-white/40">{campaign.signalType}</span>
        <span className="text-white/20 text-xs">·</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${DIFFICULTY_STYLES[campaign.difficulty] ?? 'bg-white/10 text-white/60'}`}>
          {campaign.difficulty}
        </span>
      </div>
    </div>
  );
}
