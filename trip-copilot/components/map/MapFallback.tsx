'use client';

import { useMemo } from 'react';
import { WifiOff } from 'lucide-react';
import type { LngLat, Route } from '@/types';

/**
 * Náhrada mapy, keď nie je Mapbox token alebo internet.
 * Nie je to „prázdna obrazovka s chybou“ – je to zjednodušený zákres
 * skutočnej geometrie trasy s hranicami a polohou. Offline teda stále
 * vidíš, kde na trase si.
 */
export function MapFallback({
  route,
  position,
  reason,
}: {
  route: Route;
  position: LngLat | null;
  reason: string;
}) {
  const { path, points, project } = useMemo(() => {
    const lngs = route.geometry.map((c) => c[0]);
    const lats = route.geometry.map((c) => c[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const W = 320;
    const H = 240;
    const pad = 26;

    const proj = ([lng, lat]: LngLat): [number, number] => [
      pad + ((lng - minLng) / (maxLng - minLng || 1)) * (W - pad * 2),
      H - pad - ((lat - minLat) / (maxLat - minLat || 1)) * (H - pad * 2),
    ];

    const d = route.geometry
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${proj(c)[0].toFixed(1)} ${proj(c)[1].toFixed(1)}`)
      .join(' ');

    const wps = route.segments.flatMap((s) => s.waypoints).filter((w) => w.isBorderCrossing || w.note);

    return { path: d, points: wps, project: proj };
  }, [route]);

  return (
    <div className="relative h-full w-full bg-raised">
      <svg viewBox="0 0 320 240" className="h-full w-full" role="img" aria-label="Schéma trasy">
        <path d={path} fill="none" stroke="rgb(var(--c-line))" strokeWidth="6" strokeLinecap="round" />
        <path
          d={path}
          fill="none"
          stroke="rgb(var(--c-signal))"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {points.map((wp) => {
          const [x, y] = project(wp.coords);
          return (
            <g key={wp.id}>
              <circle cx={x} cy={y} r={wp.isBorderCrossing ? 4 : 2.6} fill="rgb(var(--c-sea))" />
              <text
                x={x + 6}
                y={y + 3}
                fontSize="7"
                fill="rgb(var(--c-muted))"
                fontFamily="var(--font-barlow-condensed)"
              >
                {wp.name}
              </text>
            </g>
          );
        })}
        {position ? (
          <circle
            cx={project(position)[0]}
            cy={project(position)[1]}
            r="6"
            fill="rgb(var(--c-signal))"
            stroke="#fff"
            strokeWidth="2.5"
          />
        ) : null}
      </svg>

      <div className="absolute inset-x-3 bottom-3 flex items-start gap-2 rounded-2xl border border-line bg-surface/95 p-3 text-xs text-muted">
        <WifiOff size={16} className="mt-0.5 shrink-0" />
        <p>{reason}</p>
      </div>
    </div>
  );
}
