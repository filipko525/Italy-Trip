'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line/70 bg-bg/92 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Domovská obrazovka"
          className="grid h-10 w-10 place-items-center rounded-2xl bg-raised text-sea"
        >
          <Home size={19} />
        </Link>
        <div>
          <h1 className="font-condensed text-lg font-bold uppercase leading-none tracking-wide">
            {title}
          </h1>
          {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
