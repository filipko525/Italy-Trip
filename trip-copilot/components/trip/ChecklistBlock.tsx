'use client';

import { Check } from 'lucide-react';
import type { Checklist } from '@/types';
import { useAppState } from '@/lib/storage/app-state';

export function ChecklistBlock({ checklist }: { checklist: Checklist }) {
  const { state, toggleChecklistItem } = useAppState();
  const done = checklist.items.filter((i) => state.checkedItems[i.id]).length;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        {checklist.description ? (
          <p className="text-sm text-muted">{checklist.description}</p>
        ) : (
          <span />
        )}
        <p className="tnum shrink-0 font-condensed text-sm font-semibold uppercase tracking-wide text-muted">
          {done} / {checklist.items.length}
        </p>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-pill bg-raised">
        <div
          className="h-full bg-sea transition-all"
          style={{ width: `${(done / checklist.items.length) * 100}%` }}
        />
      </div>

      <ul className="divide-y divide-line/60">
        {checklist.items.map((item) => {
          const checked = Boolean(state.checkedItems[item.id]);
          return (
            <li key={item.id}>
              <button
                onClick={() => toggleChecklistItem(item.id)}
                aria-pressed={checked}
                className="flex w-full items-start gap-3 py-3 text-left"
              >
                <span
                  className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition-colors ${
                    checked ? 'border-sea bg-sea text-white' : 'border-line'
                  }`}
                >
                  {checked ? <Check size={16} strokeWidth={3} /> : null}
                </span>
                <span>
                  <span className={`block ${checked ? 'text-muted line-through' : ''}`}>
                    {item.label}
                  </span>
                  {item.note ? (
                    <span className="mt-0.5 block text-xs text-muted">{item.note}</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
