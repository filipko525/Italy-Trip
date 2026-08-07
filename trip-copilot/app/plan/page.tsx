'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Timeline } from '@/components/trip/Timeline';
import { ChecklistBlock } from '@/components/trip/ChecklistBlock';
import { TollList } from '@/components/trip/TollList';
import { DocumentsList } from '@/components/trip/DocumentsList';
import { AccommodationCard } from '@/components/cards/AccommodationCard';
import { Collapsible } from '@/components/ui/Collapsible';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Chip';
import { ACCOMMODATIONS } from '@/data/accommodations';
import { CESTA_SPAT, CESTA_TAM } from '@/data/routes';
import { CHECKLISTS, CONTACTS } from '@/data/checklists';
import { DOCUMENTS } from '@/data/documents';
import { TOLLS } from '@/data/tolls';
import { BUDGET, CAR } from '@/data/trip';
import { useAppState } from '@/lib/storage/app-state';
import { formatMinutes } from '@/lib/calculations/geo';
import { computeFuelStats, FUEL_RESERVE_WARNING } from '@/lib/calculations/fuel';
import { formatEur, formatNumber } from '@/lib/calculations/costs';

export default function PlanPage() {
  const { state } = useAppState();

  const departure = CHECKLISTS.find((c) => c.id === 'cl-departure')!;
  const returning = CHECKLISTS.find((c) => c.id === 'cl-return')!;
  const car = CHECKLISTS.find((c) => c.id === 'cl-car')!;

  const doneIn = (ids: string[]) => ids.filter((id) => state.checkedItems[id]).length;
  const tollsBought = TOLLS.filter((t) => state.tolls[t.id]?.purchased ?? t.purchased).length;
  const docsReady = DOCUMENTS.filter((d) => state.documents[d.id]?.ready).length;
  const fuel = computeFuelStats(state.fuelEntries);

  return (
    <main className="flex-1">
        <AppHeader title="Plán" subtitle="15. – 23. augusta 2026" />
      <div className="space-y-3 px-4 py-4">
        <Card className="p-4">
          <p className="eyebrow mb-3">Časová os</p>
          <Timeline />
        </Card>

        <Collapsible
          title="Ubytovanie"
          summary={`${ACCOMMODATIONS[0].name} · rakúsky nocľah zatiaľ nevybraný`}
        >
          <div className="space-y-3">
            {ACCOMMODATIONS.map((a) => (
              <AccommodationCard key={a.id} accommodation={a} />
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Cesta" summary="Jeden segment tam, dva späť">
          <div className="space-y-4">
            {[CESTA_TAM, CESTA_SPAT].map((route) => (
              <div key={route.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold">{route.name}</h3>
                  <p className="tnum text-sm text-muted">
                    {route.distanceKm} km · {formatMinutes(route.drivingMinutes)}
                  </p>
                </div>
                <ul className="mt-2 space-y-2">
                  {route.segments.map((segment) => (
                    <li key={segment.id} className="rounded-2xl bg-raised/60 p-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-medium">{segment.name}</p>
                        <p className="tnum shrink-0 text-sm text-muted">
                          {segment.distanceKm} km · {formatMinutes(segment.drivingMinutes)}
                        </p>
                      </div>
                      {segment.description ? (
                        <p className="mt-1 text-sm text-muted">{segment.description}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted">
                        {segment.waypoints.map((w) => w.name).join(' → ')}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-xs text-muted">
              Kilometre a časy sú odhady bez dopravy a prestávok. Trasa vedie cez Rakúsko a Tarvisio,
              nie cez Slovinsko.
            </p>
          </div>
        </Collapsible>

        <Collapsible
          title="Diaľničné známky a mýto"
          summary={`${tollsBought} z ${TOLLS.length} vybavených`}
        >
          <TollList />
        </Collapsible>

        <Collapsible
          title="Tankovanie"
          summary={
            fuel.totalLiters > 0
              ? `${formatNumber(fuel.totalLiters, 1)} l · ${formatEur(fuel.totalPrice)}`
              : `Odhad ${BUDGET.fuelLitersFrom}–${BUDGET.fuelLitersTo} l na dovolenku`
          }
        >
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl bg-raised/60 p-3">
              <p className="font-medium">{CAR.model}</p>
              <p className="mt-1 text-muted">
                {CAR.power}, {CAR.fuel}, nádrž približne {CAR.tankLiters} l. Väčšina jazdy okolo{' '}
                {CAR.cruiseSpeedKmh} km/h na tempomate.
              </p>
            </div>
            <div className="rounded-2xl bg-raised/60 p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-muted">Predbežný odhad na dovolenku</span>
                <Tag tone="signal">predbežné</Tag>
              </div>
              <p className="tnum mt-1 text-lg font-semibold">
                {BUDGET.fuelLitersFrom}–{BUDGET.fuelLitersTo} l · {BUDGET.fuelEurFrom}–
                {BUDGET.fuelEurTo} €
              </p>
            </div>
            <p className="rounded-2xl bg-signal/12 p-3 text-signal">{FUEL_RESERVE_WARNING}</p>
            <Link href="/naklady" className="block text-sea underline">
              Zapísať tankovanie na obrazovke Náklady
            </Link>
          </div>
        </Collapsible>

        <Collapsible title="Dokumenty" summary={`${docsReady} z ${DOCUMENTS.length} pripravených`}>
          <DocumentsList />
        </Collapsible>

        <Collapsible
          title="Checklist pred odchodom"
          summary={`${doneIn(departure.items.map((i) => i.id))} z ${departure.items.length} hotových`}
        >
          <ChecklistBlock checklist={departure} />
        </Collapsible>

        <Collapsible
          title="Checklist pred návratom"
          summary={`${doneIn(returning.items.map((i) => i.id))} z ${returning.items.length} hotových`}
        >
          <ChecklistBlock checklist={returning} />
        </Collapsible>

        <Collapsible
          title="Výbava auta"
          summary={`${doneIn(car.items.map((i) => i.id))} z ${car.items.length} hotových`}
        >
          <ChecklistBlock checklist={car} />
        </Collapsible>

        <Collapsible title="Dôležité kontakty" summary="112 platí v SK, AT aj IT">
          <ul className="divide-y divide-line/60">
            {CONTACTS.map((c) => {
              const value =
                c.id === 'k-4' ? state.accommodationOverrides['acc-austria']?.phone ?? c.value : c.value;
              const missing = value === 'doplniť';
              return (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{c.label}</p>
                    {c.note ? <p className="text-xs text-muted">{c.note}</p> : null}
                  </div>
                  {missing ? (
                    <Tag tone="signal">doplniť</Tag>
                  ) : (
                    <a
                      href={`tel:${value}`}
                      className="inline-flex items-center gap-1.5 rounded-pill bg-sea px-3 py-2 text-sm font-medium text-white"
                    >
                      <Phone size={15} /> {value}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </Collapsible>
      </div>
    </main>
  );
}
