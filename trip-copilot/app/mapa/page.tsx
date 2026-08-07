'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Cat,
  Clock,
  CornerUpRight,
  LocateFixed,
  MapPin,
  Navigation,
  Pencil,
  TriangleAlert,
} from 'lucide-react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { RouteMap } from '@/components/map/RouteMap';
import { MapFallback } from '@/components/map/MapFallback';
import { TravelModePanel } from '@/components/trip/TravelModePanel';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip, Tag } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { TextField, TextAreaField } from '@/components/ui/Field';
import { useAppState } from '@/lib/storage/app-state';
import { usePoisAhead } from '@/hooks/usePoisAhead';
import { hasMapbox } from '@/lib/mapbox/config';
import { openFullRouteInGoogleMaps } from '@/lib/geolocation/navigation-links';
import { formatKm, formatMinutes } from '@/lib/calculations/geo';
import { POI_CATEGORY_LABELS } from '@/data/poi';
import { ACCOMMODATIONS } from '@/data/accommodations';
import type { PoiWithGeoContext } from '@/types';

/** Presné adresy pre Google Maps odkaz – nie súradnice z našej zjednodušenej
    geometrie, nech Google Maps nájde presne tú istú trasu ako v reálnom živote. */
const HOME_ADDRESS = 'Priečna 4, 917 01 Trnava';
const LIGNANO_ADDRESS = 'Viale Italia 70, 33054 Lignano Sabbiadoro, Taliansko';
/** Cesta späť má zatiaľ naplánovaný a overený len prvý deň (do Grazu na nocľah) –
    úsek Graz → domov ešte nie je finálny, preto ho do Google Maps odkazu nedávame. */
const GRAZ_ADDRESS = 'Graz, Rakúsko';

export default function MapaPage() {
  const { state, setSettings, setTravel, setAccommodation } = useAppState();
  const { position, all } = usePoisAhead();
  const [dark, setDark] = useState(false);
  const [online, setOnline] = useState(true);
  const [selectedPoi, setSelectedPoi] = useState<PoiWithGeoContext | null>(null);
  const [editingGraz, setEditingGraz] = useState(false);
  const [grazDraft, setGrazDraft] = useState({ name: '', address: '', phone: '', checkIn: '', notes: '' });
  const nextStop = all.find((p) => p.isAhead && !state.visitedPoiIds.includes(p.id)) ?? null;

  const austriaBase = ACCOMMODATIONS.find((a) => a.id === 'acc-austria');
  const austriaStay = austriaBase
    ? { ...austriaBase, ...state.accommodationOverrides['acc-austria'] }
    : null;

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

  /** Cesta späť má zatiaľ naplánovaný a overený len prvý deň (do Grazu na nocľah) –
      úsek Graz → domov ešte nie je finálny. Ako cieľ v Google Maps použijeme skutočnú
      adresu ubytovania, ak je už doplnená, inak len všeobecné "Graz, Rakúsko". */
  const { originAddress, destinationAddress } = useMemo(
    () =>
      direction === 'tam'
        ? { originAddress: HOME_ADDRESS, destinationAddress: LIGNANO_ADDRESS }
        : {
            originAddress: LIGNANO_ADDRESS,
            destinationAddress:
              austriaStay && austriaStay.status !== 'nevybrane' && austriaStay.address
                ? austriaStay.address
                : GRAZ_ADDRESS,
          },
    [direction, austriaStay],
  );

  /** Nocľah cestou (len smer späť) – nájdeme bod trasy s poznámkou o nocľahu, nech je
      vidno vždy, aj keď sme ešte ďaleko od Grazu. */
  const overnightWaypoint = useMemo(() => {
    if (direction !== 'spat') return null;
    for (const seg of route.segments) {
      const wp = seg.waypoints.find((w) => w.note?.includes('Nocľah'));
      if (wp) return wp;
    }
    return null;
  }, [route, direction]);

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

      <div className="px-4 pb-3">
        <Button
          size="lg"
          full
          icon={<Navigation size={20} />}
          onClick={() =>
            openFullRouteInGoogleMaps(
              originAddress,
              destinationAddress,
              route.segments[0].waypoints.slice(1, -1).map((wp) => wp.coords),
            )
          }
        >
          Otvoriť v Google Maps
        </Button>
        <p className="mt-1.5 px-1 text-xs text-muted">
          Spustí sa appka Google Maps s presne tvojou naplánovanou trasou ({route.name}). Ak appku
          nemáš, otvorí sa webová verzia.
        </p>
      </div>

      {overnightWaypoint ? (
        <button
          type="button"
          onClick={() => {
            setGrazDraft({
              name: austriaStay?.status !== 'nevybrane' ? austriaStay?.name ?? '' : '',
              address: austriaStay?.status !== 'nevybrane' ? austriaStay?.address ?? '' : '',
              phone: austriaStay?.phone ?? '',
              checkIn: austriaStay?.checkIn ?? '',
              notes: austriaStay?.notes ?? '',
            });
            setEditingGraz(true);
          }}
          className="mx-4 mb-3 block w-[calc(100%-2rem)] rounded-2xl bg-signal/12 p-3 text-left"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="eyebrow text-signal">Nocľah cestou</p>
            <Pencil size={13} className="shrink-0 text-signal" />
          </div>
          <p className="mt-0.5 font-semibold leading-snug">
            {austriaStay && austriaStay.status !== 'nevybrane' && austriaStay.name
              ? austriaStay.name
              : overnightWaypoint.name}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {austriaStay && austriaStay.status !== 'nevybrane' && austriaStay.address
              ? austriaStay.address
              : overnightWaypoint.note}
          </p>
          {austriaStay?.status === 'nevybrane' ? (
            <p className="mt-1 text-xs text-signal">Klikni sem a doplň, kedy a kam presne ideme</p>
          ) : null}
        </button>
      ) : null}

      <div className="relative mx-4 h-[46vh] min-h-[280px] overflow-hidden rounded-card border border-line">
        {showMap ? (
          <RouteMap
            key={dark ? 'dark' : 'light'}
            route={route}
            position={position.coords}
            pois={all}
            onSelectPoi={setSelectedPoi}
            dark={dark}
            highlight={
              overnightWaypoint
                ? { coords: overnightWaypoint.coords, label: overnightWaypoint.name }
                : null
            }
          />
        ) : (
          <MapFallback
            route={route}
            position={position.coords}
            reason={
              !online
                ? 'Si offline, mapové dlaždice sa nedajú načítať. Toto je zjednodušený zákres trasy – plán, checklisty a zastávky funguhú ďalej.'
                : 'Chýba Mapbox token. Doplň NEXT_PUBLIC_MAPBOX_TOKEN do .env.local a mapa sa načíta. Zatiaľ vidíš schému trasy.'
            }
          />
        )}
      </div>

      <div className="space-y-4 px-4 py-4">
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

          {nextStop ? (
            <div className="mt-4 rounded-2xl bg-raised/60 p-3">
              <p className="eyebrow">Nasleduje</p>
              <p className="mt-0.5 text-lg font-semibold leading-snug">{nextStop.name}</p>
              <p className="tnum mt-0.5 text-sm text-muted">
                {POI_CATEGORY_LABELS[nextStop.category]} · {formatKm(nextStop.distanceToUserKm)} ·
                o {formatMinutes(nextStop.etaMinutes)}
              </p>
              {nextStop.note ? (
                <p className="mt-1.5 text-sm text-muted">
                  <span className="font-medium text-ink">Dôvod: </span>
                  {nextStop.note}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-raised/60 p-3">
              <p className="eyebrow">Nasleduje</p>
              <p className="mt-0.5 text-lg font-semibold leading-snug">Žiadna zastávka pred nami</p>
            </div>
          )}

          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Úsek</dt>
              <dd className="text-right font-medium">{position.currentSegment?.name ?? '–'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Ďalší bod na trase</dt>
              <dd className="text-right font-medium">
                {position.nextWaypoint
                  ? `${position.nextWaypoint.name} · ${formatKm(position.distanceToNextWaypointKm ?? 0)}`
                  : 'cieľ'}
              </dd>
            </div>
          </dl>
        </Card>

        <p className="px-1 text-xs text-muted">
          Bodky na mape sú možné zastávky – klikni na ne pre podrobnosti. Navigáciu si spusti vo
          svojej vlastnej appke (Google Maps a pod.).
        </p>

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
      </div>

      <Sheet
        open={selectedPoi !== null}
        onClose={() => setSelectedPoi(null)}
        title={selectedPoi?.name ?? ''}
      >
        {selectedPoi ? (
          <div className="space-y-3">
            <p className="eyebrow">{POI_CATEGORY_LABELS[selectedPoi.category]}</p>
            {selectedPoi.region ? <p className="text-sm text-muted">{selectedPoi.region}</p> : null}

            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-muted" />
                <span>{formatKm(selectedPoi.distanceFromRouteKm)} od trasy</span>
              </div>
              <div className="flex items-center gap-2">
                <CornerUpRight size={15} className="text-muted" />
                <span>
                  zachádzka{' '}
                  <span className="tnum font-medium">
                    {selectedPoi.estimatedDetourMinutes === 0
                      ? 'žiadna'
                      : formatMinutes(selectedPoi.estimatedDetourMinutes)}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-muted" />
                <span>
                  zastávka <span className="tnum font-medium">{selectedPoi.stopMinutes} min</span>
                </span>
              </div>
            </dl>

            <div className="flex flex-wrap gap-1.5">
              {selectedPoi.catFriendly ? (
                <Tag tone="sea">
                  <Cat size={13} /> vhodné so Sumi
                </Tag>
              ) : null}
              {selectedPoi.openingHours ? <Tag>otvorené: {selectedPoi.openingHours}</Tag> : null}
              {selectedPoi.isMockData ? <Tag tone="danger">testovacie dáta</Tag> : null}
            </div>

            {selectedPoi.note ? <p className="text-sm text-muted">{selectedPoi.note}</p> : null}
          </div>
        ) : null}
      </Sheet>

      <Sheet open={editingGraz} onClose={() => setEditingGraz(false)} title="Nocľah v Rakúsku">
        <div className="space-y-4">
          <TextField
            label="Kde (názov ubytovania)"
            value={grazDraft.name}
            onChange={(e) => setGrazDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="napr. Hotel Weitzer, Graz"
          />
          <TextField
            label="Presná adresa"
            value={grazDraft.address}
            onChange={(e) => setGrazDraft((d) => ({ ...d, address: e.target.value }))}
            placeholder="Ulica, mesto, Rakúsko"
          />
          <TextField
            label="Telefón na recepciu"
            value={grazDraft.phone}
            onChange={(e) => setGrazDraft((d) => ({ ...d, phone: e.target.value }))}
            placeholder="+43 ..."
          />
          <TextField
            label="Kedy prichádzame"
            value={grazDraft.checkIn}
            onChange={(e) => setGrazDraft((d) => ({ ...d, checkIn: e.target.value }))}
            placeholder="napr. 22. 8. 2026 popoludní"
          />
          <TextAreaField
            label="Poznámka"
            value={grazDraft.notes}
            onChange={(e) => setGrazDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="parkovanie, kontakt, čokoľvek si treba zapamätať"
          />
          <Button
            full
            onClick={() => {
              setAccommodation('acc-austria', {
                name: grazDraft.name.trim() || undefined,
                address: grazDraft.address.trim() || undefined,
                phone: grazDraft.phone.trim() || undefined,
                checkIn: grazDraft.checkIn.trim() || undefined,
                notes: grazDraft.notes.trim() || undefined,
                status: grazDraft.name.trim() || grazDraft.address.trim() ? 'potvrdene' : 'nevybrane',
              });
              setEditingGraz(false);
            }}
          >
            Uložiť
          </Button>
          <p className="text-xs text-muted">
            Adresu potom appka použije aj ako cieľ v tlačidle &quot;Otvoriť v Google Maps&quot; pre
            cestu späť, telefón sa zobrazí aj v Dôležitých kontaktoch na Pláne.
          </p>
        </div>
      </Sheet>
    </main>
  );
}
