'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Navigation2, CalendarDays, Wallet, Cat, ListChecks } from 'lucide-react';

const ITEMS = [
  { href: '/mapa', label: 'Mapa', Icon: Map },
  { href: '/pred-nami', label: 'Pred nami', Icon: Navigation2 },
  { href: '/plan', label: 'Plán', Icon: CalendarDays },
  { href: '/naklady', label: 'Náklady', Icon: Wallet },
  { href: '/sumi', label: 'Sumi', Icon: Cat },
  { href: '/checklisty', label: 'Checklisty', Icon: ListChecks },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hlavná navigácia"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-line bg-surface/95 backdrop-blur safe-bottom"
    >
      <ul className="grid grid-cols-6">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-[68px] flex-col items-center justify-center gap-1 transition-colors ${
                  active ? 'text-sea' : 'text-muted'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
                <span className="font-condensed text-[11px] font-semibold uppercase tracking-wider">
                  {label}
                </span>
                <span
                  className={`h-[3px] w-6 rounded-full ${active ? 'bg-sea' : 'bg-transparent'}`}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
