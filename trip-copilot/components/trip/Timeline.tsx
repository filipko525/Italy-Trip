'use client';

import { CalendarDays } from 'lucide-react';
import { PLAN } from '@/data/plan';
import { formatShortDateSk, weekdaySk } from '@/lib/calculations/dates';
import { Tag } from '@/components/ui/Chip';

const KIND_COLOR: Record<string, string> = {
  odchod: 'bg-signal',
  jazda: 'bg-sea',
  prichod: 'bg-lagoon',
  checkin: 'bg-lagoon',
  pobyt: 'bg-sand',
  checkout: 'bg-signal',
  nocl: 'bg-sea',
  domov: 'bg-lagoon',
};

/** Časová os dovolenky. Poradie nesie informáciu, preto je to naozaj os. */
export function Timeline() {
  return (
    <ol className="relative space-y-4 pl-6">
      <span className="absolute left-[7px] top-2 bottom-2 w-px bg-line" aria-hidden />
      {PLAN.map((item) => (
        <li key={item.id} className="relative">
          <span
            className={`absolute -left-[22px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-surface ${
              KIND_COLOR[item.kind] ?? 'bg-sea'
            }`}
            aria-hidden
          />
          <div className="flex items-center gap-2 font-condensed text-xs uppercase tracking-wider text-muted">
            <CalendarDays size={13} />
            {formatShortDateSk(item.date)} {weekdaySk(item.date)}
            {item.time ? <span className="tnum">· {item.time}</span> : null}
          </div>
          <h3 className="mt-0.5 font-semibold leading-snug">{item.title}</h3>
          {item.detail ? <p className="mt-1 text-sm text-muted">{item.detail}</p> : null}
          {item.tentative ? (
            <span className="mt-2 inline-block">
              <Tag tone="signal">predbežné</Tag>
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
