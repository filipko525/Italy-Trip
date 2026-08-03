import type { CountryCode, LngLat, Route, RouteSegment, Waypoint } from '@/types';
import { haversineKm } from '@/lib/calculations/geo';

/* =========================================================
   TRASY
   ---------------------------------------------------------
   POZOR – geometria trasy je ZJEDNODUŠENÁ (predbežné dáta).
   Ide o lomenú čiaru cez hlavné body diaľnic D1/D2/A4/A2/A23/A4,
   nie o presnú geometriu z Directions API. Slúži na:
     • zákres trasy do mapy,
     • výpočet poradia bodov na trase (čo je pred nami),
     • odhad vzdialenosti od trasy.
   Turn-by-turn navigáciu preberá Google Maps alebo Waze.

   TRASA NEVEDIE CEZ SLOVINSKO. Žiadny Maribor, žiadna Ľubľana,
   žiadna Postojna. Hlavný prejazd: Graz → Klagenfurt → Villach
   → Tarvisio.
   ========================================================= */

interface PointDef {
  coords: LngLat;
  country: CountryCode;
  /** Ak má bod názov, stane sa z neho waypoint. */
  name?: string;
  note?: string;
  border?: boolean;
}

const TAM_POINTS: PointDef[] = [
  { coords: [17.5872, 48.3774], country: 'SK', name: 'Trnava', note: 'Štart – 14. 8. 2026' },
  { coords: [17.3922, 48.3134], country: 'SK' },
  { coords: [17.2011, 48.2123], country: 'SK' },
  { coords: [17.1077, 48.1486], country: 'SK', name: 'Bratislava', note: 'Obchvat D4 / D2' },
  { coords: [17.0692, 48.0872], country: 'SK', name: 'Kittsee – hranica', note: 'Prechod SK → AT', border: true },
  { coords: [16.7833, 48.0167], country: 'AT', note: 'A4 Bruck an der Leitha' },
  { coords: [16.5, 48.11], country: 'AT' },
  { coords: [16.4009, 48.1573], country: 'AT', name: 'Viedeň', note: 'A4 → A23 → A2, južný obchvat' },
  { coords: [16.3, 47.99], country: 'AT' },
  { coords: [16.2469, 47.8154], country: 'AT', name: 'Wiener Neustadt', note: 'Pokračovanie po A2' },
  { coords: [16.09, 47.55], country: 'AT', name: 'Aspang / Wechsel', note: 'Región A2, stúpanie' },
  { coords: [15.98, 47.42], country: 'AT' },
  { coords: [15.97, 47.28], country: 'AT', name: 'Hartberg' },
  { coords: [15.71, 47.1], country: 'AT' },
  { coords: [15.4395, 47.0707], country: 'AT', name: 'Graz', note: 'Polovica trasy' },
  { coords: [15.23, 46.98], country: 'AT' },
  { coords: [15.03, 46.92], country: 'AT', name: 'Pack / Packsattel', note: 'Horský úsek A2' },
  { coords: [14.84, 46.84], country: 'AT', name: 'Wolfsberg' },
  { coords: [14.55, 46.7], country: 'AT' },
  { coords: [14.305, 46.6247], country: 'AT', name: 'Klagenfurt' },
  { coords: [14.15, 46.62], country: 'AT', name: 'Wörthersee', note: 'Odbočka k jazeru' },
  { coords: [13.8558, 46.6103], country: 'AT', name: 'Villach' },
  { coords: [13.7083, 46.5475], country: 'AT', name: 'Arnoldstein' },
  { coords: [13.58, 46.505], country: 'IT', name: 'Tarvisio – hranica', note: 'Prechod AT → IT, vstup na talianske mýto', border: true },
  { coords: [13.42, 46.35], country: 'IT' },
  { coords: [13.2346, 46.0711], country: 'IT', name: 'Udine' },
  { coords: [13.18, 45.9], country: 'IT', note: 'A23 → A4' },
  { coords: [13.0022, 45.7736], country: 'IT', name: 'Latisana', note: 'Výjazd z A4, platba mýta' },
  { coords: [13.06, 45.71], country: 'IT' },
  { coords: [13.13, 45.6789], country: 'IT', name: 'Lignano Sabbiadoro', note: 'Yachting Residence' },
];

const SPAT_1_POINTS: PointDef[] = [
  { coords: [13.13, 45.6789], country: 'IT', name: 'Lignano Sabbiadoro', note: 'Checkout 23. 8. 2026 o 10:00' },
  { coords: [13.06, 45.71], country: 'IT' },
  { coords: [13.0022, 45.7736], country: 'IT', name: 'Latisana', note: 'Nájazd na A4, lístok pri vstupe' },
  { coords: [13.18, 45.9], country: 'IT' },
  { coords: [13.2346, 46.0711], country: 'IT', name: 'Udine' },
  { coords: [13.42, 46.35], country: 'IT' },
  { coords: [13.58, 46.505], country: 'IT', name: 'Tarvisio – hranica', note: 'Prechod IT → AT', border: true },
  { coords: [13.7083, 46.5475], country: 'AT', name: 'Arnoldstein' },
  { coords: [13.8558, 46.6103], country: 'AT', name: 'Villach' },
  { coords: [14.15, 46.62], country: 'AT', name: 'Wörthersee' },
  { coords: [14.305, 46.6247], country: 'AT', name: 'Klagenfurt' },
  { coords: [14.55, 46.7], country: 'AT' },
  { coords: [14.84, 46.84], country: 'AT', name: 'Wolfsberg' },
  { coords: [15.03, 46.92], country: 'AT', name: 'Pack / Packsattel' },
  { coords: [15.23, 46.98], country: 'AT' },
  { coords: [15.4395, 47.0707], country: 'AT', name: 'Graz alebo okolie', note: 'Nocľah 23. – 24. 8. 2026' },
];

const SPAT_2_POINTS: PointDef[] = [
  { coords: [15.4395, 47.0707], country: 'AT', name: 'Graz alebo okolie', note: 'Odchod 24. 8. 2026' },
  { coords: [15.71, 47.1], country: 'AT' },
  { coords: [15.97, 47.28], country: 'AT', name: 'Hartberg' },
  { coords: [15.98, 47.42], country: 'AT' },
  { coords: [16.09, 47.55], country: 'AT', name: 'Aspang / Wechsel' },
  { coords: [16.2469, 47.8154], country: 'AT', name: 'Wiener Neustadt' },
  { coords: [16.3, 47.99], country: 'AT' },
  { coords: [16.4009, 48.1573], country: 'AT', name: 'Viedeň' },
  { coords: [16.5, 48.11], country: 'AT' },
  { coords: [16.7833, 48.0167], country: 'AT' },
  { coords: [17.0692, 48.0872], country: 'SK', name: 'Kittsee – hranica', note: 'Prechod AT → SK', border: true },
  { coords: [17.1077, 48.1486], country: 'SK', name: 'Bratislava' },
  { coords: [17.2011, 48.2123], country: 'SK' },
  { coords: [17.5872, 48.3774], country: 'SK', name: 'Trnava', note: 'Cieľ – doma' },
];

/**
 * Z bodov postaví segment: geometriu, waypointy a kilometre od štartu.
 * Kumulatívne kilometre sa počítajú haversinom a následne škálujú na
 * deklarovanú dĺžku segmentu (vzdušná čiara je kratšia než reálna cesta).
 */
function buildSegment(
  base: Omit<RouteSegment, 'geometry' | 'waypoints'>,
  points: PointDef[],
): RouteSegment {
  const geometry: LngLat[] = points.map((p) => p.coords);

  const cumulative: number[] = [0];
  for (let i = 1; i < geometry.length; i += 1) {
    cumulative.push(cumulative[i - 1] + haversineKm(geometry[i - 1], geometry[i]));
  }
  const raw = cumulative[cumulative.length - 1] || 1;
  const scale = base.distanceKm / raw;

  const waypoints: Waypoint[] = points
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => Boolean(p.name))
    .map(({ p, i }) => ({
      id: `${base.id}-wp-${i}`,
      name: p.name as string,
      country: p.country,
      coords: p.coords,
      kmFromStart: Math.round(cumulative[i] * scale),
      note: p.note,
      isBorderCrossing: p.border,
    }));

  return { ...base, geometry, waypoints };
}

/* ---------- CESTA TAM ---------- */

export const CESTA_TAM: Route = (() => {
  const segment = buildSegment(
    {
      id: 'tam-1',
      name: 'Trnava → Lignano Sabbiadoro',
      direction: 'tam',
      order: 1,
      from: 'Trnava',
      to: 'Lignano Sabbiadoro',
      distanceKm: 669,
      drivingMinutes: 415,
      description:
        'Trnava → Bratislava → Viedeň → Wiener Neustadt → A2 → Graz → Klagenfurt → Villach → Tarvisio → Udine → Latisana → Lignano. Trasa nevedie cez Slovinsko.',
    },
    TAM_POINTS,
  );

  return {
    id: 'cesta-tam',
    name: 'Cesta tam',
    direction: 'tam',
    distanceKm: 669,
    drivingMinutes: 415,
    segments: [segment],
    geometry: segment.geometry,
  };
})();

/* ---------- CESTA SPÄŤ (dva segmenty) ---------- */

export const CESTA_SPAT: Route = (() => {
  const s1 = buildSegment(
    {
      id: 'spat-1',
      name: 'Lignano → Rakúsko (nocľah)',
      direction: 'spat',
      order: 1,
      from: 'Lignano Sabbiadoro',
      to: 'Graz alebo okolie',
      distanceKm: 395,
      drivingMinutes: 250,
      description: 'Checkout o 10:00, prejazd cez Tarvisio a Klagenfurt do okolia Grazu na jednu noc.',
    },
    SPAT_1_POINTS,
  );

  const s2 = buildSegment(
    {
      id: 'spat-2',
      name: 'Rakúsko → Trnava',
      direction: 'spat',
      order: 2,
      from: 'Graz alebo okolie',
      to: 'Trnava',
      distanceKm: 285,
      drivingMinutes: 175,
      description: 'Posledný úsek 24. 8. 2026 cez Wiener Neustadt, Viedeň a Bratislavu domov.',
    },
    SPAT_2_POINTS,
  );

  return {
    id: 'cesta-spat',
    name: 'Cesta späť',
    direction: 'spat',
    distanceKm: s1.distanceKm + s2.distanceKm,
    drivingMinutes: s1.drivingMinutes + s2.drivingMinutes,
    segments: [s1, s2],
    geometry: [...s1.geometry, ...s2.geometry.slice(1)],
  };
})();

export const ROUTES: Record<'tam' | 'spat', Route> = {
  tam: CESTA_TAM,
  spat: CESTA_SPAT,
};

export function getRoute(direction: 'tam' | 'spat'): Route {
  return ROUTES[direction];
}
