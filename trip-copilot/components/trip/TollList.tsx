'use client';

import { Info } from 'lucide-react';
import { SLOVINSKO_NOTE, TOLLS } from '@/data/tolls';
import { COUNTRY_LABELS } from '@/data/trip';
import { useAppState } from '@/lib/storage/app-state';
import { formatDateSk } from '@/lib/calculations/dates';
import { CheckboxField, TextField } from '@/components/ui/Field';
import { Tag } from '@/components/ui/Chip';

export function TollList() {
  const { state, toggleToll, setTollDetail } = useAppState();

  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {TOLLS.map((toll) => {
          const stored = state.tolls[toll.id];
          const purchased = stored?.purchased ?? toll.purchased;
          return (
            <li key={toll.id} className="rounded-2xl bg-raised/60 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{COUNTRY_LABELS[toll.country]}</p>
                  <h4 className="font-semibold leading-snug">{toll.name}</h4>
                </div>
                <Tag tone={purchased ? 'sea' : 'signal'}>{purchased ? 'kúpené' : 'nekúpené'}</Tag>
              </div>

              <p className="mt-1.5 text-sm text-muted">{toll.description}</p>

              {toll.validFrom ? (
                <p className="tnum mt-1.5 text-xs text-muted">
                  Platnosť {formatDateSk(toll.validFrom)}
                  {toll.validTo && toll.validTo !== toll.validFrom
                    ? ` – ${formatDateSk(toll.validTo)}`
                    : ''}
                </p>
              ) : null}

              <CheckboxField
                label="Označiť ako kúpené"
                checked={purchased}
                onChange={(v) => toggleToll(toll.id, v)}
              />

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Cena v eurách"
                  inputMode="decimal"
                  placeholder="doplniť"
                  value={stored?.priceEur !== undefined ? String(stored.priceEur) : ''}
                  onChange={(e) =>
                    setTollDetail(toll.id, { priceEur: Number(e.target.value.replace(',', '.')) || undefined })
                  }
                />
                <TextField
                  label="Poznámka"
                  placeholder={toll.note ?? 'voliteľné'}
                  value={stored?.note ?? ''}
                  onChange={(e) => setTollDetail(toll.id, { note: e.target.value })}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="flex items-start gap-2 rounded-2xl bg-sea/10 p-3 text-sm text-sea">
        <Info size={16} className="mt-0.5 shrink-0" />
        {SLOVINSKO_NOTE}
      </p>
    </div>
  );
}
