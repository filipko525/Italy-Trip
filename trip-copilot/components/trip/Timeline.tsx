'use client';

import { useState } from 'react';
import { CalendarDays, Pencil, RotateCcw } from 'lucide-react';
import { PLAN } from '@/data/plan';
import { formatShortDateSk, weekdaySk } from '@/lib/calculations/dates';
import { Tag } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { useAppState } from '@/lib/storage/app-state';

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
  const { state, setPlanOverride, clearPlanOverride } = useAppState();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('');

  const editingItem = PLAN.find((p) => p.id === editingId) ?? null;
  const hasOverride = editingId ? Boolean(state.planOverrides[editingId]) : false;

  const openEditor = (itemId: string, date: string, time?: string) => {
    setEditingId(itemId);
    setDraftDate(date);
    setDraftTime(time ?? '');
  };

  const save = () => {
    if (!editingId) return;
    setPlanOverride(editingId, { date: draftDate, time: draftTime || undefined });
    setEditingId(null);
  };

  const resetToOriginal = () => {
    if (!editingId) return;
    clearPlanOverride(editingId);
    setEditingId(null);
  };

  return (
    <>
      <ol className="relative space-y-4 pl-6">
        <span className="absolute left-[7px] top-2 bottom-2 w-px bg-line" aria-hidden />
        {PLAN.map((item) => {
          const override = state.planOverrides[item.id];
          const date = override?.date ?? item.date;
          const time = override?.time ?? item.time;
          return (
            <li key={item.id} className="relative">
              <span
                className={`absolute -left-[22px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-surface ${
                  KIND_COLOR[item.kind] ?? 'bg-sea'
                }`}
                aria-hidden
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-condensed text-xs uppercase tracking-wider text-muted">
                  <CalendarDays size={13} />
                  {formatShortDateSk(date)} {weekdaySk(date)}
                  {time ? <span className="tnum">· {time}</span> : null}
                  {override ? <Tag tone="sea">upravené</Tag> : null}
                </div>
                <button
                  onClick={() => openEditor(item.id, date, time)}
                  aria-label="Upraviť dátum a čas"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-raised/70 text-muted"
                >
                  <Pencil size={14} />
                </button>
              </div>
              <h3 className="mt-0.5 font-semibold leading-snug">{item.title}</h3>
              {item.detail ? <p className="mt-1 text-sm text-muted">{item.detail}</p> : null}
              {item.tentative ? (
                <span className="mt-2 inline-block">
                  <Tag tone="signal">predbežné</Tag>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <Sheet
        open={editingItem !== null}
        onClose={() => setEditingId(null)}
        title={editingItem?.title ?? 'Upraviť termín'}
      >
        <div className="space-y-4">
          <TextField
            label="Dátum"
            type="date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
          />
          <TextField
            label="Čas (voliteľné)"
            type="time"
            value={draftTime}
            onChange={(e) => setDraftTime(e.target.value)}
            hint="Nechaj prázdne, ak táto položka čas nemá."
          />
          <div className="flex gap-2 pt-2">
            <Button full onClick={save}>
              Uložiť
            </Button>
            {hasOverride ? (
              <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={resetToOriginal}>
                Pôvodný
              </Button>
            ) : null}
          </div>
        </div>
      </Sheet>
    </>
  );
}
