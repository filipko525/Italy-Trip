'use client';

import type { ReactNode } from 'react';

export function Chip({
  active,
  onClick,
  children,
  tone = 'default',
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  tone?: 'default' | 'signal';
}) {
  const base =
    'inline-flex items-center gap-1.5 rounded-pill px-3.5 h-10 text-sm whitespace-nowrap transition-colors border';
  const state = active
    ? tone === 'signal'
      ? 'bg-signal text-white border-signal'
      : 'bg-sea text-white border-sea'
    : 'bg-surface text-ink border-line hover:bg-raised';

  if (!onClick) {
    return <span className={`${base} ${state}`}>{children}</span>;
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${state}`} aria-pressed={active}>
      {children}
    </button>
  );
}

export function Tag({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'sea' | 'signal' | 'danger' }) {
  const tones = {
    muted: 'bg-raised text-muted',
    sea: 'bg-sea/12 text-sea',
    signal: 'bg-signal/15 text-signal',
    danger: 'bg-danger/12 text-danger',
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
