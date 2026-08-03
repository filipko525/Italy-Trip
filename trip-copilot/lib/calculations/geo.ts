import type { LngLat } from '@/types';

const EARTH_RADIUS_KM = 6371.0088;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Vzdušná vzdialenosť dvoch bodov v kilometroch. */
export function haversineKm(a: LngLat, b: LngLat): number {
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(a[0] - b[0]) * -1;
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Kumulatívne kilometre pozdĺž lomenej čiary. */
export function cumulativeDistances(line: LngLat[]): number[] {
  const out = [0];
  for (let i = 1; i < line.length; i += 1) {
    out.push(out[i - 1] + haversineKm(line[i - 1], line[i]));
  }
  return out;
}

interface Projection {
  /** Index úseku (segmentu lomenej čiary), na ktorý bod padol. */
  index: number;
  /** Najbližší bod na trase. */
  point: LngLat;
  /** Kolmá vzdialenosť bodu od trasy v km. */
  distanceFromRouteKm: number;
  /** Kumulatívna vzdialenosť od začiatku trasy k priemetu, v km. */
  progressKm: number;
}

/**
 * Priemet bodu na lomenú čiaru trasy.
 *
 * Nepoužívame len vzdušnú vzdialenosť k cieľu – najprv nájdeme, KDE na trase
 * sa bod nachádza. Vďaka tomu vieme povedať, či je bod pred nami alebo za nami,
 * a aká je jeho zachádzka z trasy.
 *
 * Výpočet beží v rovinnej aproximácii (lokálne skreslenie je na 700 km trase
 * zanedbateľné pre naše rozhodovanie).
 */
export function projectOntoRoute(line: LngLat[], point: LngLat, cumulative?: number[]): Projection {
  const cum = cumulative ?? cumulativeDistances(line);
  const latScale = Math.cos(toRad(point[1]));

  let best: Projection = {
    index: 0,
    point: line[0],
    distanceFromRouteKm: Number.POSITIVE_INFINITY,
    progressKm: 0,
  };

  for (let i = 0; i < line.length - 1; i += 1) {
    const a = line[i];
    const b = line[i + 1];

    const ax = a[0] * latScale;
    const ay = a[1];
    const bx = b[0] * latScale;
    const by = b[1];
    const px = point[0] * latScale;
    const py = point[1];

    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));

    const proj: LngLat = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const dist = haversineKm(point, proj);

    if (dist < best.distanceFromRouteKm) {
      best = {
        index: i,
        point: proj,
        distanceFromRouteKm: dist,
        progressKm: cum[i] + (cum[i + 1] - cum[i]) * t,
      };
    }
  }

  return best;
}

/**
 * Prepočíta progres na lomenej čiare (vzdušný) na kilometre reálnej cesty.
 * Deklarovaná dĺžka trasy je vždy väčšia než vzdušná dĺžka lomenej čiary.
 */
export function makeRouteScaler(line: LngLat[], declaredKm: number) {
  const cum = cumulativeDistances(line);
  const raw = cum[cum.length - 1] || 1;
  const scale = declaredKm / raw;
  return {
    cumulative: cum,
    rawLengthKm: raw,
    scale,
    toRouteKm: (rawKm: number) => rawKm * scale,
  };
}

/** Kurz (bearing) z bodu A do bodu B v stupňoch. */
export function bearing(a: LngLat, b: LngLat): number {
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const dLng = toRad(b[0] - a[0]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** Bod na trase vo vzdialenosti X km (v škále trasy) od štartu. */
export function pointAtRouteKm(line: LngLat[], declaredKm: number, routeKm: number): LngLat {
  const { cumulative, scale } = makeRouteScaler(line, declaredKm);
  const target = Math.max(0, Math.min(declaredKm, routeKm)) / scale;

  for (let i = 1; i < cumulative.length; i += 1) {
    if (cumulative[i] >= target) {
      const span = cumulative[i] - cumulative[i - 1] || 1;
      const t = (target - cumulative[i - 1]) / span;
      const a = line[i - 1];
      const b = line[i];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
  }
  return line[line.length - 1];
}

/* ---------- Formátovanie ---------- */

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km)} km`;
}

export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} h` : `${h} h ${rest} min`;
}

/** Priemerná cestovná rýchlosť pre odhady (km/h). Auto ide väčšinou 110 km/h. */
export const CRUISE_SPEED_KMH = 105;

export function etaMinutesForKm(km: number, speedKmh = CRUISE_SPEED_KMH): number {
  return (km / speedKmh) * 60;
}
