'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import type { CountryCode, ExpenseCategory } from '@/types';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from '@/lib/calculations/costs';
import { COUNTRY_LABELS } from '@/data/trip';
import { useAppState } from '@/lib/storage/app-state';
import { Button } from '@/components/ui/Button';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';

const today = () => new Date().toISOString().slice(0, 10);

export function ExpenseForm({
  onDone,
  defaultCategory = 'jedlo',
}: {
  onDone: () => void;
  defaultCategory?: ExpenseCategory;
}) {
  const { addExpense } = useAppState();
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState<ExpenseCategory>(defaultCategory);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [country, setCountry] = useState<CountryCode>('SK');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // "data:image/jpeg;base64,AAAA..." -> len časť za čiarkou
        resolve(result.split(',')[1] ?? '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const scanReceipt = async (file: File) => {
    setScanning(true);
    setScanNote(null);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType: file.type || 'image/jpeg' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScanNote(data.error ?? 'Bloček sa nepodarilo prečítať – zadaj sumu ručne.');
        return;
      }
      if (data.amount === null || data.amount === undefined) {
        setScanNote('Sumu se z fotky nepodarilo s istotou prečítať – skontroluj a doplň ručne.');
        return;
      }
      setAmount(String(data.amount).replace('.', ','));
      setScanNote(`Suma prečítaná z bločku: ${data.amount} € – over si ju pred uložením.`);
    } catch {
      setScanNote('Bloček sa nepodarilo prečítať (chyba pripojenia) – zadaj sumu ručne.');
    } finally {
      setScanning(false);
    }
  };

  const submit = () => {
    const value = Number(amount.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) {
      setError('Zadaj sumu väčšiu ako nula.');
      return;
    }
    addExpense({
      date,
      category,
      title: title.trim() || EXPENSE_CATEGORY_LABELS[category],
      amount: value,
      currency: 'EUR',
      country,
      note: note.trim() || undefined,
    });
    onDone();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) scanReceipt(file);
          e.target.value = '';
        }}
      />
      <Button
        variant="secondary"
        full
        disabled={scanning}
        icon={scanning ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
        onClick={() => fileInputRef.current?.click()}
      >
        {scanning ? 'Čítam bloček…' : 'Odfotiť bloček a vyplniť sumu'}
      </Button>
      {scanNote ? <p className="text-sm text-muted">{scanNote}</p> : null}

      <div className="grid grid-cols-2 gap-3">
        <TextField label="Dátum" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <TextField
          label="Suma v eurách"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <SelectField
        label="Kategória"
        value={category}
        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
      >
        {EXPENSE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {EXPENSE_CATEGORY_LABELS[c]}
          </option>
        ))}
      </SelectField>

      <TextField
        label="Názov"
        placeholder="Napríklad mýto Latisana"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

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

      <TextAreaField
        label="Poznámka"
        placeholder="Voliteľné"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button size="lg" full onClick={submit}>
        Uložiť výdavok
      </Button>
    </div>
  );
}
