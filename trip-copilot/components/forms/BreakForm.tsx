'use client';

import { useState } from 'react';
import type { BreakType } from '@/types';
import { useAppState } from '@/lib/storage/app-state';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { TextAreaField, TextField } from '@/components/ui/Field';

export const BREAK_TYPE_LABELS: Record<BreakType, string> = {
  wc: 'WC',
  jedlo: 'Jedlo',
  tankovanie: 'Tankovanie',
  sumi: 'Sumi',
  oddych: 'Oddych',
  zaujimave: 'Zaujímavé miesto',
};

export function BreakForm({ onDone }: { onDone: () => void }) {
  const { startBreak } = useAppState();
  const [type, setType] = useState<BreakType>('oddych');
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');

  return (
    <div className="space-y-3">
      <div>
        <p className="eyebrow mb-2">Typ prestávky</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BREAK_TYPE_LABELS) as BreakType[]).map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)}>
              {BREAK_TYPE_LABELS[t]}
            </Chip>
          ))}
        </div>
      </div>

      <TextField
        label="Miesto"
        placeholder="Napríklad odpočívadlo pri Grazi"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
      />

      <TextAreaField
        label="Poznámka"
        placeholder="Voliteľné"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <Button
        size="lg"
        full
        onClick={() => {
          startBreak({ type, place: place.trim() || 'Neuvedené miesto', note: note.trim() || undefined });
          onDone();
        }}
      >
        Začať prestávku
      </Button>
    </div>
  );
}
