'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { PoiCategory } from '@/types';
import { AppHeader } from '@/components/navigation/AppHeader';
import { PoiCard } from '@/components/cards/PoiCard';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { useAppState } from '@/lib/storage/app-state';
import { usePoisAhead } from '@/hooks/usePoisAhead';
import { QUICK_FILTERS } from '@/data/poi';
import { formatKm } from '@/lib/calculations/geo';

const DETOUR_OPTIONS = [
  { id: 'any', label: 'Akákoľvek', value: null },
  { id: '0', label: 'Bez zachádzky', value: 0 },
  { id: '5', label: 'Do 5 min', value: 5 },
  { id: '15', label: 'Do 15 min', value: 15 },
  { id: '30', label: 'Do 30 min', value: 30 },
];

const STOP_OPTIONS = [
  { id: 'any', label: 'Akákoľvek', value: null },
  { id: '10', label: '10 min', value: 10 },
  { id: '15', label: '15 min', value: 15 },
  { id: '30', label: '30 min', value: 30 },
  { id: '60', label: '60 min', value: 60 },
  { id: 'long', label: 'Viac než hodina', value: 999 },
];

const TYPE_FILTERS: { id: string; label: string; categories: PoiCategory[]; catOnly?: boolean }[] = [
  { id: 'wc', label: 'Iba WC', categories: ['wc'] },
  { id: 'pumpa', label: 'Tankovanie', categories: ['pumpa'] },
  { id: 'jedlo', label: 'Jedlo', categories: ['jedlo'] },
  { id: 'kava', label: 'Káva', categories: ['kava'] },
  { id: 'oddych', label: 'Oddych', categories: ['odpocivadlo', 'pokoj'] },
  { id: 'vidiet', label: 'Niečo vidieť', categories: ['vyhliadka', 'zaujimave', 'prechadzka'] },
  { id: 'sumi', label: 'Prestávka so Sumi', categories: ['pokoj', 'pet', 'odpocivadlo', 'prechadzka'], catOnly: true },
];

export default function PredNamiPage() {
  const { state, toggleSavedPoi, toggleVisitedPoi } = useAppState();
  const [detour, setDetour] = useState<number | null>(null);
  const [stop, setStop] = useState<number | null>(null);
  const [categories, setCategories] = useState<PoiCategory[]>([]);
  const [catOnly, setCatOnly] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { position, ahead } = usePoisAhead();

  const list = useMemo(() => {
    return ahead.filter((p) => {
      if (categories.length > 0 && !categories.includes(p.category)) return false;
      if (catOnly && !p.catFriendly) return false;
      if (detour !== null && p.estimatedDetourMinutes > detour) return false;
      if (stop !== null) {
        if (stop === 999 ? p.stopMinutes <= 60 : p.stopMinutes > stop) return false;
      }
      return true;
    });
  }, [ahead, categories, catOnly, detour, stop]);

  /** Rýchle tlačidlo nastaví kategórie, zachádzku aj dĺžku zastávky naraz. */
  const applyQuick = (quickId: string) => {
    if (activeChip === quickId) return resetFilters();
    const quick = QUICK_FILTERS.find((q) => q.id === quickId);
    if (!quick) return;
    setCategories(quick.categories);
    setCatOnly(quick.id === 'sumi');
    setDetour(quick.maxDetour ?? null);
    setStop(quick.maxStop ?? null);
    setActiveChip(quick.id);
  };

  const applyType = (typeId: string) => {
    if (activeChip === typeId) return resetFilters();
    const type = TYPE_FILTERS.find((t) => t.id === typeId);
    if (!type) return;
    setCategories(type.categories);
    setCatOnly(Boolean(type.catOnly));
    setActiveChip(type.id);
  };

  const resetFilters = () => {
    setDetour(null);
    setStop(null);
    setCategories([]);
    setCatOnly(false);
    setActiveChip(null);
  };

  return (
    <main className="flex-1">
      <AppHeader
        title="Pred nami"
        subtitle={`${position.route.name} · ${Math.round(position.progressKm)} km za nami`}
      />

      <div className="px-4 py-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {QUICK_FILTERS.map((q) => (
            <Chip key={q.id} tone="signal" active={activeChip === q.id} onClick={() => applyQuick(q.id)}>
              {q.label}
            </Chip>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-muted">
            <span className="tnum font-semibold text-ink">{list.length}</span> zastávok pred nami
          </p>
          <div className="flex items-center gap-2">
            {detour !== null || stop !== null || activeChip !== null ? (
              <button onClick={resetFilters} className="text-sm text-muted underline">
                Zrušiť filtre
              </button>
            ) : null}
            <Button
              size="sm"
              variant="secondary"
              icon={<SlidersHorizontal size={15} />}
              onClick={() => setShowFilters((v) => !v)}
            >
              Filtre
            </Button>
          </div>
        </div>

        {showFilters ? (
          <Card className="mt-3 space-y-4 p-4">
            <FilterRow label="Maximálna zachádzka">
              {DETOUR_OPTIONS.map((o) => (
                <Chip key={o.id} active={detour === o.value} onClick={() => setDetour(o.value)}>
                  {o.label}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="Dĺžka zastávky">
              {STOP_OPTIONS.map((o) => (
                <Chip key={o.id} active={stop === o.value} onClick={() => setStop(o.value)}>
                  {o.label}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="Typ zastávky">
              {TYPE_FILTERS.map((t) => (
                <Chip key={t.id} active={activeChip === t.id} onClick={() => applyType(t.id)}>
                  {t.label}
                </Chip>
              ))}
            </FilterRow>
          </Card>
        ) : null}
      </div>

      <div className="px-4 pb-6">
        {list.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="font-medium">Pre tieto filtre nič pred nami nie je.</p>
            <p className="mt-1 text-sm text-muted">
              Skús povoliť dlhšiu zachádzku alebo iný typ zastávky. Ak si už na konci trasy, prepni
              smer na obrazovke Mapa.
            </p>
            <Button className="mt-4" variant="secondary" onClick={resetFilters}>
              Zrušiť filtre
            </Button>
          </Card>
        ) : (
          <ul className="space-y-3">
            {list.map((poi) => (
              <PoiCard
                key={poi.id}
                poi={poi}
                saved={state.savedPoiIds.includes(poi.id)}
                visited={state.visitedPoiIds.includes(poi.id)}
                onToggleSaved={() => toggleSavedPoi(poi.id)}
                onToggleVisited={() => toggleVisitedPoi(poi.id)}
              />
            ))}
          </ul>
        )}

        {state.visitedPoiIds.length > 0 ? (
          <p className="mt-4 text-center text-xs text-muted">
            {state.visitedPoiIds.length} miest je označených ako navštívené a v zozname sa
            nezobrazujú.
          </p>
        ) : null}

        <p className="mt-4 text-center text-xs text-muted">
          Vzdialenosti sú odhad: kilometre po trase plus odbočka k miestu
          {position.coords ? ` (aktuálne ${formatKm(position.distanceFromRouteKm)} od trasy)` : ''}.
        </p>
      </div>
    </main>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
