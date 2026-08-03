'use client';

import { useMemo, useState } from 'react';
import { Fuel, Plus, Trash2 } from 'lucide-react';
import type { CountryCode } from '@/types';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Tag } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/Field';
import { Collapsible } from '@/components/ui/Collapsible';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { FuelForm } from '@/components/forms/FuelForm';
import { useAppState } from '@/lib/storage/app-state';
import {
  byCategory,
  byCountry,
  EXPENSE_CATEGORY_LABELS,
  formatEur,
  formatNumber,
  sumExpenses,
  todaysExpenses,
} from '@/lib/calculations/costs';
import { computeFuelStats, FUEL_RESERVE_WARNING, TANK_LEVELS } from '@/lib/calculations/fuel';
import { formatShortDateSk } from '@/lib/calculations/dates';
import { COUNTRY_LABELS } from '@/data/trip';

export default function NakladyPage() {
  const { state, setSettings, removeExpense, removeFuelEntry } = useAppState();
  const [sheet, setSheet] = useState<null | 'expense' | 'fuel'>(null);
  const [tankLevel, setTankLevel] = useState<string>('plna');

  const total = useMemo(() => sumExpenses(state.expenses), [state.expenses]);
  const categories = useMemo(() => byCategory(state.expenses), [state.expenses]);
  const countries = useMemo(() => byCountry(state.expenses), [state.expenses]);
  const today = useMemo(() => sumExpenses(todaysExpenses(state.expenses)), [state.expenses]);
  const fuel = useMemo(() => computeFuelStats(state.fuelEntries), [state.fuelEntries]);

  const fuelTotal = categories.find((c) => c.category === 'benzin')?.total ?? 0;
  const tollTotal =
    (categories.find((c) => c.category === 'znamky')?.total ?? 0) +
    (categories.find((c) => c.category === 'myto')?.total ?? 0);
  const budget = state.settings.budgetEur;
  const remaining = budget - total;
  const usedPct = budget > 0 ? Math.min(100, (total / budget) * 100) : 0;

  const level = TANK_LEVELS.find((l) => l.id === tankLevel)!;
  const rangeLeft =
    fuel.estimatedRangeKm !== null ? Math.round(fuel.estimatedRangeKm * level.fraction) : null;

  return (
    <main className="flex-1">
      <AppHeader title="Náklady" subtitle="Predvolená mena euro" />

      <div className="space-y-3 px-4 py-4">
        <Card className="p-4">
          <p className="eyebrow">Celkové náklady</p>
          <p className="tnum mt-1 text-4xl font-bold leading-none">{formatEur(total)}</p>

          <div className="mt-4 h-2 overflow-hidden rounded-pill bg-raised">
            <div
              className={`h-full transition-all ${remaining < 0 ? 'bg-danger' : 'bg-sea'}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Rozpočet {formatEur(budget)}</span>
            <span className={remaining < 0 ? 'font-semibold text-danger' : 'font-medium'}>
              {remaining < 0 ? 'prekročené o ' : 'zostáva '}
              {formatEur(Math.abs(remaining))}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Mini label="Dnes" value={formatEur(today)} />
            <Mini label="Benzín" value={formatEur(fuelTotal)} />
            <Mini label="Cesta a mýto" value={formatEur(tollTotal)} />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" icon={<Plus size={20} />} onClick={() => setSheet('expense')}>
            Výdavok
          </Button>
          <Button size="lg" variant="secondary" icon={<Fuel size={20} />} onClick={() => setSheet('fuel')}>
            Tankovanie
          </Button>
        </div>

        <Collapsible title="Podľa kategórie" summary={`${categories.length} kategórií`}>
          {categories.length === 0 ? (
            <p className="text-sm text-muted">
              Zatiaľ žiadne výdavky. Prvý pribudne hneď, ako zapíšeš tankovanie alebo mýto.
            </p>
          ) : (
            <ul className="space-y-2">
              {categories.map(({ category, total: value }) => (
                <li key={category}>
                  <div className="flex justify-between text-sm">
                    <span>{EXPENSE_CATEGORY_LABELS[category]}</span>
                    <span className="tnum font-medium">{formatEur(value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-pill bg-raised">
                    <div className="h-full bg-lagoon" style={{ width: `${(value / total) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Collapsible>

        <Collapsible title="Podľa krajiny" summary="Slovensko, Rakúsko, Taliansko">
          {countries.length === 0 ? (
            <p className="text-sm text-muted">Zatiaľ žiadne výdavky.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {countries.map(({ country, total: value }) => (
                <li key={country} className="flex justify-between">
                  <span>{COUNTRY_LABELS[country as CountryCode]}</span>
                  <span className="tnum font-medium">{formatEur(value)}</span>
                </li>
              ))}
            </ul>
          )}
        </Collapsible>

        <Collapsible
          title="Tankovanie a spotreba"
          summary={
            fuel.totalLiters > 0
              ? `${formatNumber(fuel.totalLiters, 1)} l · priemer ${
                  fuel.averageConsumption ? `${formatNumber(fuel.averageConsumption, 1)} l/100 km` : 'zatiaľ neznámy'
                }`
              : 'Zatiaľ žiadne tankovanie'
          }
          defaultOpen
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Mini label="Celkom litrov" value={formatNumber(fuel.totalLiters, 1)} />
              <Mini label="Celkom" value={formatEur(fuel.totalPrice)} />
              <Mini
                label="Priemer za liter"
                value={fuel.averagePricePerLiter ? formatEur(fuel.averagePricePerLiter) : '–'}
              />
              <Mini
                label="Priemerná spotreba"
                value={
                  fuel.averageConsumption ? `${formatNumber(fuel.averageConsumption, 1)} l/100 km` : '–'
                }
              />
            </div>

            {fuel.averageConsumption === null ? (
              <p className="text-sm text-muted">
                Spotreba sa objaví po druhom tankovaní do plnej nádrže. Počíta sa ako dotankované
                litre delené prejdenými kilometrami krát sto.
              </p>
            ) : null}

            <div>
              <p className="eyebrow mb-2">Stav nádrže</p>
              <div className="flex flex-wrap gap-2">
                {TANK_LEVELS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setTankLevel(l.id)}
                    aria-pressed={tankLevel === l.id}
                    className={`h-10 rounded-pill border px-3.5 text-sm ${
                      tankLevel === l.id ? 'border-sea bg-sea text-white' : 'border-line bg-surface'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-muted">
                {rangeLeft !== null
                  ? `Odhadovaný dojazd približne ${rangeLeft} km.`
                  : 'Dojazd sa odhadne po prvej vypočítanej spotrebe.'}
              </p>
              {(tankLevel === 'rezerva' || tankLevel === 'stvrtina') && (
                <p className="mt-2 rounded-2xl bg-signal/12 p-3 text-sm text-signal">
                  {FUEL_RESERVE_WARNING}
                </p>
              )}
            </div>

            {state.fuelEntries.length > 0 ? (
              <ul className="divide-y divide-line/60">
                {state.fuelEntries.map((e) => (
                  <li key={e.id} className="flex items-start justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{e.place}</p>
                      <p className="tnum text-xs text-muted">
                        {formatShortDateSk(e.date)} · {formatNumber(e.liters, 2)} l ·{' '}
                        {formatNumber(e.pricePerLiter, 3)} €/l · {e.odometerKm} km
                      </p>
                      {e.fullTank ? <Tag tone="sea">plná nádrž</Tag> : <Tag>čiastočné</Tag>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tnum font-semibold">{formatEur(e.totalPrice)}</span>
                      <button
                        onClick={() => removeFuelEntry(e.id)}
                        aria-label="Vymazať tankovanie"
                        className="text-muted"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Collapsible>

        <Collapsible title="Rozpočet" summary={formatEur(budget)}>
          <TextField
            label="Celkový dovolenkový rozpočet v eurách"
            inputMode="numeric"
            value={String(budget)}
            onChange={(e) => setSettings({ budgetEur: Number(e.target.value.replace(',', '.')) || 0 })}
            hint="Predvolená hodnota je predbežná – uprav ju podľa seba."
          />
        </Collapsible>

        <Card className="p-4">
          <p className="eyebrow mb-3">Všetky výdavky</p>
          {state.expenses.length === 0 ? (
            <p className="text-sm text-muted">
              Zatiaľ prázdne. Zapisuj priebežne – po dovolenke si to nikto nepamätá.
            </p>
          ) : (
            <ul className="divide-y divide-line/60">
              {state.expenses.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.title}</p>
                    <p className="text-xs text-muted">
                      {formatShortDateSk(e.date)} · {EXPENSE_CATEGORY_LABELS[e.category]} ·{' '}
                      {COUNTRY_LABELS[e.country]}
                    </p>
                    {e.note ? <p className="text-xs text-muted">{e.note}</p> : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="tnum font-semibold">{formatEur(e.amount)}</span>
                    <button
                      onClick={() => removeExpense(e.id)}
                      aria-label="Vymazať výdavok"
                      className="text-muted"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Sheet open={sheet === 'expense'} onClose={() => setSheet(null)} title="Nový výdavok">
        <ExpenseForm onDone={() => setSheet(null)} />
      </Sheet>
      <Sheet open={sheet === 'fuel'} onClose={() => setSheet(null)} title="Nové tankovanie">
        <FuelForm onDone={() => setSheet(null)} />
      </Sheet>
    </main>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-raised px-2 py-3 text-center">
      <p className="tnum text-base font-semibold leading-none">{value}</p>
      <p className="mt-1 font-condensed text-[11px] uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}
