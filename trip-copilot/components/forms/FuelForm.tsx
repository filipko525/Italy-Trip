'use client';

import { useMemo, useState } from 'react';
import type { CountryCode } from '@/types';
import { COUNTRY_LABELS } from '@/data/trip';
import { useAppState } from '@/lib/storage/app-state';
import { formatEur, formatNumber } from '@/lib/calculations/costs';
import { Button } from '@/components/ui/Button';
import { CheckboxField, SelectField, TextAreaField, TextField } from '@/components/ui/Field';

const today = () => new Date().toISOString().slice(0, 10);
const num = (v: string) => Number(v.replace(',', '.'));

export function FuelForm({ onDone }: { onDone: () => void }) {
  const { addFuelEntry, state } = useAppState();
  const [date, setDate] = useState(today());
  const [place, setPlace] = useState('');
  const [country, setCountry] = useState<CountryCode>('SK');
  const [odometer, setOdometer] = useState('');
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [fullTank, setFullTank] = useState(true);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Celková cena sa počíta automaticky: litre × cena za liter.
  const total = useMemo(() => {
    const l = num(liters);
    const p = num(pricePerLiter);
    return Number.isFinite(l) && Number.isFinite(p) ? l * p : 0;
  }, [liters, pricePerLiter]);

  const lastOdometer = useMemo(() => {
    const sorted = [...state.fuelEntries].sort((a, b) => b.odometerKm - a.odometerKm);
    return sorted[0]?.odometerKm ?? null;
  }, [state.fuelEntries]);

  const submit = () => {
    const l = num(liters);
    const p = num(pricePerLiter);
    const o = num(odometer);
    if (!Number.isFinite(l) || l <= 0) return setError('Zadaj počet litrov.');
    if (!Number.isFinite(p) || p <= 0) return setError('Zadaj cenu za liter.');
    if (!Number.isFinite(o) || o <= 0) return setError('Zadaj stav kilometrov z tachometra.');
    if (lastOdometer !== null && o <= lastOdometer)
      return setError(`Stav kilometrov musí byť vyšší než minule (${lastOdometer} km).`);

    addFuelEntry({
      date,
      place: place.trim() || 'Neuvedené miesto',
      country,
      odometerKm: o,
      liters: l,
      pricePerLiter: p,
      totalPrice: l * p,
      fullTank,
      note: note.trim() || undefined,
    });
    onDone();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Dátum" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <SelectField
          label="Krajina"
          value={country}
          onChange={(e) => setCountry(e.target.value as CountryCode)}
        >
          {(Object.keys(COUNTRY_LABELS) as CountryCode[]).map((c) => (
            <option key={c} value={c}>
              {COUNTRY_LABELS[c]}
            </option>
          ))}
        </SelectField>
      </div>

      <TextField
        label="Miesto"
        placeholder="Napríklad pumpa pri Villachu"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
      />

      <TextField
        label="Stav kilometrov"
        inputMode="numeric"
        placeholder="napríklad 187540"
        value={odometer}
        onChange={(e) => setOdometer(e.target.value)}
        hint={lastOdometer !== null ? `Naposledy ${lastOdometer} km` : 'Odpíš z tachometra'}
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Litre"
          inputMode="decimal"
          placeholder="0,00"
          value={liters}
          onChange={(e) => setLiters(e.target.value)}
        />
        <TextField
          label="Cena za liter"
          inputMode="decimal"
          placeholder="0,000"
          value={pricePerLiter}
          onChange={(e) => setPricePerLiter(e.target.value)}
        />
      </div>

      <div className="rounded-2xl bg-raised p-3">
        <p className="eyebrow">Celková cena</p>
        <p className="tnum text-2xl font-semibold">{formatEur(total)}</p>
        {liters ? (
          <p className="mt-1 text-xs text-muted">
            {formatNumber(num(liters) || 0, 2)} l · spotreba sa prepočíta po ďalšom tankovaní do plna
          </p>
        ) : null}
      </div>

      <CheckboxField label="Tankované do plnej nádrže" checked={fullTank} onChange={setFullTank} />
      <p className="-mt-1 text-xs text-muted">
        Spotreba sa počíta len medzi dvomi tankovaniami do plna. Bez toho by číslo klamalo.
      </p>

      <TextAreaField
        label="Poznámka"
        placeholder="Voliteľné"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button size="lg" full onClick={submit}>
        Uložiť tankovanie
      </Button>
    </div>
  );
}
