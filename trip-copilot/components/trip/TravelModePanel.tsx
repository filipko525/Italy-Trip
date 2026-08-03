'use client';

import { useEffect, useState } from 'react';
import { Coffee, Fuel, Pause, Receipt, Square } from 'lucide-react';
import type { TravelStatus } from '@/types';
import { useAppState } from '@/lib/storage/app-state';
import { formatMinutes } from '@/lib/calculations/geo';
import { minutesBetween } from '@/lib/calculations/dates';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { BreakForm, BREAK_TYPE_LABELS } from '@/components/forms/BreakForm';
import { FuelForm } from '@/components/forms/FuelForm';
import { ExpenseForm } from '@/components/forms/ExpenseForm';

const STATUSES: { id: TravelStatus; label: string }[] = [
  { id: 'jazda', label: 'Jazda' },
  { id: 'prestavka', label: 'Prestávka' },
  { id: 'tankovanie', label: 'Tankovanie' },
  { id: 'jedlo', label: 'Jedlo' },
  { id: 'ubytovanie', label: 'Ubytovanie' },
  { id: 'ciel', label: 'Cieľ dosiahnutý' },
];

/** Po tomto čase jazdy bez prestávky ukážeme pripomienku. */
const BREAK_REMINDER_MINUTES = 120;

export function TravelModePanel() {
  const { state, setTravel, endBreak } = useAppState();
  const [sheet, setSheet] = useState<null | 'break' | 'fuel' | 'expense'>(null);
  const [, tick] = useState(0);

  // Časy v paneli musia bežať aj bez interakcie.
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const { travel, breaks } = state;
  const activeBreak = breaks.find((b) => !b.endedAt);

  const tripMinutes = travel.startedAt ? minutesBetween(travel.startedAt) : 0;
  const breakMinutes = breaks.reduce((sum, b) => sum + minutesBetween(b.startedAt, b.endedAt), 0);
  const drivingMinutes = Math.max(0, tripMinutes - breakMinutes);
  const lastBreakEnd = breaks.find((b) => b.endedAt)?.endedAt;
  const sinceLastBreak = lastBreakEnd
    ? minutesBetween(lastBreakEnd)
    : travel.startedAt
      ? minutesBetween(travel.startedAt)
      : 0;

  const needsBreak = !activeBreak && sinceLastBreak >= BREAK_REMINDER_MINUTES;

  if (!travel.active) return null;

  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="eyebrow">Cestovný režim</p>
        <button
          onClick={() => setTravel({ active: false })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted"
        >
          <Square size={13} /> Ukončiť
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Jazda" value={formatMinutes(drivingMinutes)} />
        <Stat label="Prestávky" value={formatMinutes(breakMinutes)} />
        <Stat label="Počet prestávok" value={String(breaks.length)} />
      </div>

      <p className="mt-2 text-center text-xs text-muted">
        Od poslednej prestávky {formatMinutes(sinceLastBreak)}
      </p>

      {needsBreak ? (
        <p className="mt-3 rounded-2xl bg-signal/12 p-3 text-sm text-signal">
          Idete už {formatMinutes(sinceLastBreak)} bez prestávky. Najbližšie odpočívadlo je dobrý
          nápad – aj kvôli Sumi.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Chip
            key={s.id}
            active={travel.status === s.id}
            onClick={() => setTravel({ status: s.id })}
          >
            {s.label}
          </Chip>
        ))}
      </div>

      {activeBreak ? (
        <div className="mt-4 rounded-2xl bg-raised p-3">
          <p className="text-sm">
            Prebieha prestávka: <strong>{BREAK_TYPE_LABELS[activeBreak.type]}</strong> ·{' '}
            {activeBreak.place}
          </p>
          <p className="tnum mt-1 text-xs text-muted">
            trvá {formatMinutes(minutesBetween(activeBreak.startedAt))}
          </p>
          <Button className="mt-3" full onClick={() => endBreak(activeBreak.id)}>
            Ukončiť prestávku
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <BigAction icon={<Pause size={22} />} label="Prestávka" onClick={() => setSheet('break')} />
          <BigAction icon={<Fuel size={22} />} label="Tankovanie" onClick={() => setSheet('fuel')} />
          <BigAction icon={<Receipt size={22} />} label="Výdavok" onClick={() => setSheet('expense')} />
        </div>
      )}

      <p className="mt-3 flex items-start gap-2 text-xs text-muted">
        <Coffee size={14} className="mt-0.5 shrink-0" />
        Zapisuje spolujazdec. Vodič sa aplikácie počas jazdy nedotýka.
      </p>

      <Sheet open={sheet === 'break'} onClose={() => setSheet(null)} title="Zapísať prestávku">
        <BreakForm onDone={() => setSheet(null)} />
      </Sheet>
      <Sheet open={sheet === 'fuel'} onClose={() => setSheet(null)} title="Zapísať tankovanie">
        <FuelForm onDone={() => setSheet(null)} />
      </Sheet>
      <Sheet open={sheet === 'expense'} onClose={() => setSheet(null)} title="Zapísať výdavok">
        <ExpenseForm onDone={() => setSheet(null)} />
      </Sheet>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-raised px-2 py-3">
      <p className="tnum text-lg font-semibold leading-none">{value}</p>
      <p className="mt-1 font-condensed text-[11px] uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}

function BigAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-sea text-white active:bg-sea/90"
    >
      {icon}
      <span className="font-condensed text-sm font-semibold uppercase tracking-wide">{label}</span>
    </button>
  );
}
