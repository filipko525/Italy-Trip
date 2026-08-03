'use client';

import { useState } from 'react';
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
