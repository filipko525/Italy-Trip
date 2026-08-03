'use client';

import { useMemo } from 'react';
import type { CountryCode, Route } from '@/types';

/* =========================================================
   KILOMETROVÁ STUHA
   ---------------------------------------------------------
   Hlavný orientačný prvok aplikácie. Celá trasa ako meracia
   páska: pásma podľa krajín, značky každých 50 km, hranice
   a poloha auta. Funguje na domovskej obrazovke, v mape aj
   v cestovnom režime a je jediné miesto, kde si dovolíme
   vizuálny efekt – zvyšok UI je pokojný.
   ========================================================= */

const COUNTRY_STYLE: Record<CountryCode, { fill: string; label: string }> = {
  SK: { fill: 'rgb(var(--c-sand))', label: 'SK' },
  AT: { fill: 'rgb(var(--c-sea))', label: 'AT' },
  IT: { fill: 'rgb(var(--c-lagoon))', label: 'IT' },
};

interface Mark {
  km: number;
  name: string;
  country: CountryCode;
  border?: boolean;
}

export function KilometerRibbon({
  route,
  progressKm,
  showLabels = true,
}: {
  route: Route;
  progressKm: number;
  showLabels?: boolean;
}) {
  const { marks, bands } = useMemo(() => {
    const all: Mark[] = [];
    let offset = 0;
    route.segments.forEach((seg) => {
      seg.waypoints.forEach((wp) => {
        all.push({
          km: offset + wp.kmFromStart,
          name: wp.name,
          country: wp.country,
          border: wp.isBorderCrossing,
        });
      });
      offset += seg.distanceKm;
    });

    const result: { country: CountryCode; from: number; to: number }[] = [];
    let currentCountry = all[0]?.country ?? 'SK';
    let from = 0;

    all.forEach((mark, i) => {
      if (mark.border) {
        const nextCountry = all[i + 1]?.country ?? mark.country;
        result.push({ country: currentCountry, from, to: mark.km });
        currentCountry = nextCountry;
        from = mark.km;
      }
    });
    result.push({ country: currentCountry, from, to: route.distanceKm });

    return { marks: all, bands: result };
  }, [route]);

  const pct = (km: number) => `${Math.max(0, Math.min(100, (km / route.distanceKm) * 100))}%`;
  const ticks = Array.from({ length: Math.floor(route.distanceKm / 50) }, (_, i) => (i + 1) * 50);
  const labelled = marks.filter((m) => m.border || m.name.length < 22);

  return (
    <div className="select-none">
      <div className="relative h-9 rounded-pill overflow-hidden bg-raised">
        {bands.map((band) => (
          <div
            key={`${band.country}-${band.from}`}
            className="absolute inset-y-0 opacity-90"
            style={{
              left: pct(band.from),
              width: `${((band.to - band.from) / route.distanceKm) * 100}%`,
              background: COUNTRY_STYLE[band.country].fill,
            }}
          >
            <span className="absolute left-2 top-1/2 -translate-y-1/2 font-condensed text-[11px] font-bold uppercase tracking-widest text-white/85">
              {COUNTRY_STYLE[band.country].label}
            </span>
          </div>
        ))}

        {ticks.map((km) => (
          <div
            key={km}
            className="absolute top-0 h-2 w-px bg-white/45"
            style={{ left: pct(km) }}
            aria-hidden
          />
        ))}

        {/* Prejdená časť stmavíme, aby bolo hneď vidieť, koľko je za nami. */}
        <div
          className="absolute inset-y-0 left-0 bg-black/35"
          style={{ width: pct(progressKm) }}
          aria-hidden
        />

        {/* Poloha auta */}
        <div
          className="absolute inset-y-0 w-[3px] bg-signal shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
          style={{ left: pct(progressKm) }}
          role="img"
          aria-label={`Prejdených ${Math.round(progressKm)} kilometrov z ${route.distanceKm}`}
        />
      </div>

      {showLabels ? (
        <div className="relative mt-1.5 h-8">
          {labelled.map((mark) => (
            <span
              key={`${mark.name}-${mark.km}`}
              className="absolute -translate-x-1/2 font-condensed text-[10px] uppercase tracking-wider text-muted"
              style={{ left: pct(mark.km) }}
            >
              <span className="block h-2 w-px bg-line mx-auto mb-0.5" />
              {mark.border ? '⌁ ' : ''}
              {mark.name.split(' ')[0].replace(/[,–]/g, '')}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-1 flex items-baseline justify-between font-condensed text-xs uppercase tracking-wider text-muted">
        <span className="tnum">{Math.round(progressKm)} km za nami</span>
        <span className="tnum">{Math.round(route.distanceKm - progressKm)} km pred nami</span>
      </div>
    </div>
  );
}
