'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, LocateFixed, Navigation, TriangleAlert } from 'lucide-react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { RouteMap } from '@/components/map/RouteMap';
import { MapFallback } from '@/components/map/MapFallback';
import { KilometerRibbon } from '@/components/trip/KilometerRibbon';
import { TravelModePanel } from '@/components/trip/TravelModePanel';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { useAppState } from '@/lib/storage/app-state';
import { usePoisAhead } from '@/hooks/usePoisAhead';
import { hasMapbox } from '@/lib/mapbox/config';
import { formatKm, formatMinutes } from '@/lib/calculations/geo';
import { googleMapsUrl, wazeUrl } from '@/lib/geolocation/navigation-links';
import { ACCOMMODATIONS } from '@/data/accommodations';
import { POI_CATEGORY_LABELS } from '@/data/poi';

export default function MapaPage() {
  const { state, setSettings, setTravel } = useAppState();
  const { position, ahead } = usePoisAhead();
  const [dark, setDark] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const read = () => setDark(document.documentElement.dataset.theme === 'dark');
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const { route, direction } = useMemo(
    () => ({ route: position.route, direction: state.settings.direction }),
    [position.route, state.settings.direction],
  );

  const nextStop = ahead[0] ?? null;
  const finalTarget =
    direction === 'tam' ? ACCOMMODATIONS[0].coords ?? route.geometry[route.geometry.length - 1] : route.geometry[route.geometry.length - 1];
  const navTarget = nextStop?.coords ?? finalTarget;
  const navLabel = nextStop ? nextStop.name : direction === 'tam' ? 'Lignano Sabbiadoro' : 'Trnava';

  const showMap = hasMapbox() && online;

  return (
    <main className="flex-1">
      <AppHeader title="Mapa" subtitle={route.name} />

      <div className="flex gap-2 px-4 py-3">
        <Chip
          active={direction === 'tam'}
          onClick={() => setSettings({ direction: 'tam', mockProgressKm: 0 })}
        >
          Cesta tam
        </Chip>
        <Chip
          active={direction === 'spat'}
          onClick={() => setSettings({ direction: 'spat', mockProgressKm: 0 })}
        >
          Cesta späť
        </Chip>
      </div>

      <div className="relative mx-4 h-[46vh] min-h-[280px] overflow-hidden rounded-card border border-line">
        {showMap ? (
          <RouteMap
            key={dark ? 'dark' : 'light'}
            route={route}
            position={position.coords}
            pois={ahead}
            dark={dark}
          />
        ) : (
          <MapFallback
            route={route}
            position={position.coords}
            reason={
              !online
                ? 'Si offline, mapové dlaždice sa nedajú načítať. Toto je zjednodušený zákres trasy – plán, checklisty a zastávky fungujú ďalej.'
                : 'Chýba Mapbox token. Doplň NEXT_PUBLIC_MAPBOX_TOKEN do .env.local a mapa sa načíta. Zatiaľ vidíš schému trasy.'
            }
          />
        )}
      </div>

      <div className="space-y-4 px-4 py-4">
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="eyebrow">Zostáva</p>
              <p className="tnum text-3xl font-bold leading-none">
                {Math.round(position.remainingKm)} km
              </p>
            </div>
            <div>
              <p className="eyebrow">Približný čas</p>
              <p className="tnum text-3xl font-bold leading-none">
                {formatMinutes(position.remainingMinutes)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <KilometerRibbon route={route} progressKm={position.progressKm} />
          </div>

          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Úsek</dt>
              <dd className="text-right font-medium">{position.currentSegment?.name ?? '–'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Ďalší bod trasy</dt>
              <dd className="text-right font-medium">
                {position.nextWaypoint
                  ? `${position.nextWaypoint.name} · ${formatKm(position.distanceToNextWaypointKm ?? 0)}`
                  : 'cieľ'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Najbližšia zastávka</dt>
              <dd className="text-right font-medium">
                {nextStop
                  ? `${nextStop.name} · ${formatKm(nextStop.distanceToUserKm)}`
                  : 'žiadna pred nami'}
              </dd>
            </div>
            {nextStop ? (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Kategória</dt>
                <dd className="text-right font-medium">{POI_CATEGORY_LABELS[nextStop.category]}</dd>
              </div>
            ) : null}
          </dl>
        </Card>

        <div className="grid grid-cols-1 gap-2">
          <a href={googleMapsUrl(navTarget, navLabel)} target="_blank" rel="noreferrer">
            <Button size="lg" full icon={<Navigation size={20} />}>
              Otvoriť v Google Maps
            </Button>
          </a>
          <a href={wazeUrl(navTarget)} target="_blank" rel="noreferrer">
            <Button size="lg" full variant="secondary" icon={<ExternalLink size={18} />}>
              Otvoriť vo Waze
            </Button>
          </a>
          <p className="px-1 text-xs text-muted">
            Cieľ navigácie: {navLabel}. Turn-by-turn navigáciu robí Google Maps alebo Waze, táto
            aplikácia ju nenahrádza.
          </p>
        </div>

        {!state.travel.active ? (
          <Button
            size="lg"
            full
            variant="secondary"
            onClick={() =>
              setTravel({
                active: true,
                status: 'jazda',
                startedAt: new Date().toISOString(),
                drivingSinceAt: new Date().toISOString(),
              })
            }
          >
            Spustiť cestovný režim
          </Button>
        ) : (
          <TravelModePanel />
        )}

        <Card className="p-4">
          <p className="eyebrow mb-2">Poloha</p>

          {state.settings.useMockLocation ? (
            <>
              <p className="text-sm text-muted">
                Zapnutá je <strong>testovacia poloha</strong>. Posuvníkom sa presúvaš po trase a vieš
                si vyskúšať, čo appka ukáže napríklad pri Grazi.
              </p>
              <label className="mt-3 block">
                <span className="tnum font-condensed text-sm uppercase tracking-wide text-muted">
                  Poloha na trase: {Math.round(state.settings.mockProgressKm)} km z {route.distanceKm} km
                </span>
                <input
                  type="range"
                  min={0}
                  max={route.distanceKm}
                  step={5}
                  value={state.settings.mockProgressKm}
                  onChange={(e) => setSettings({ mockProgressKm: Number(e.target.value) })}
                  className="mt-2 w-full accent-[rgb(var(--c-signal))]"
                  aria-label="Testovacia poloha na trase"
                />
              </label>
              <Button
                className="mt-3"
                full
                variant="secondary"
                icon={<LocateFixed size={18} />}
                onClick={() => setSettings({ useMockLocation: false })}
              >
                Prepnúť na skutočnú GPS
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm">
                {position.geo.permission === 'granted'
                  ? `Poloha aktívna, presnosť ${Math.round(position.geo.accuracyM ?? 0)} m.`
                  : 'Čakám na povolenie polohy.'}
              </p>
              {position.geo.message ? (
                <p className="mt-2 flex items-start gap-2 rounded-2xl bg-signal/12 p-3 text-sm text-signal">
                  <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                  {position.geo.message}
                </p>
              ) : null}
              {!position.onRoute && position.coords ? (
                <p className="mt-2 text-sm text-muted">
                  Si {formatKm(position.distanceFromRouteKm)} od trasy. Body pred nami sa počítajú
                  podľa najbližšieho miesta na trase.
                </p>
              ) : null}
              <Button
                className="mt-3"
                full
                variant="secondary"
                onClick={() => setSettings({ useMockLocation: true })}
              >
                Späť na testovaciu polohu
              </Button>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
