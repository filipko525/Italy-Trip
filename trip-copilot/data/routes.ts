import type { CountryCode, LngLat, Route, RouteSegment, Waypoint } from '@/types';
import { haversineKm } from '@/lib/calculations/geo';

/* =========================================================
   TRASY
   ---------------------------------------------------------
   Hlavné body (Trnava, Jurki Kopčianska, Alte Reichsstraße/
   Semmering, M-Rast Zeltweg, ASFINAG Wörthersee, Roccolo/
   Pagnacco, Lignano; pri ceste späť aj Cardillo Vincenzo a
   Techelsberg am Wörthersee) sú prevzaté priamo z reálnej,
   používateľom naplánovanej Google Maps trasy – nie sú to
   naše odhady. Medzi nimi sú len ľahké spájacie body pre
   plynulejšiu čiaru na mape, nie o presnú geometriu z
   Directions API. Slúži na:
     • zákres trasy do mapy,
     • výpočet poradia bodov na trase (čo je pred nami),
     • odhad vzdialenosti od trasy.
   Turn-by-turn navigáciu preberá Google Maps alebo Waze.

   TRASA NEVEDIE CEZ SLOVINSKO. Žiadny Maribor, žiadna Ľubľana,
   žiadna Postojna.
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
  { coords: [17.6057394, 48.3887804], country: 'SK', name: 'Trnava', note: 'Štart – 15. 8. 2026 (Priečna 4)' },
  { coords: [17.0932238, 48.1097319], country: 'SK', name: 'Jurki Kopčianska', note: 'Čerpacia stanica pred hranicou' },
  { coords: [17.0, 48.03], country: 'AT', name: 'Kittsee – hranica', note: 'Prechod SK → AT', border: true },
  { coords: [16.1878412, 47.7471286], country: 'AT', name: 'Wiener Neustadt', note: 'Napojenie na S6' },
  { coords: [15.802547, 47.6236802], country: 'AT', name: 'Alte Reichsstraße (Semmering)', note: 'Vyhliadka na starej ceste cez Semmering' },
  { coords: [14.7221784, 47.1941492], country: 'AT', name: 'M-Rast Zeltweg', note: 'Odpočívadlo, S36 obchádza Graz' },
  { coords: [14.3661, 46.7686], country: 'AT', name: 'St. Veit an der Glan', note: 'Koniec S37, napojenie na A2' },
  { coords: [14.305, 46.6247], country: 'AT', name: 'Klagenfurt', note: 'Hlavné mesto Korutánska, diaľničný uzol A2' },
  { coords: [14.0950087, 46.6297031], country: 'AT', name: 'ASFINAG Wörthersee', note: 'Výhľad na jazero' },
  { coords: [13.8558, 46.6103], country: 'AT', name: 'Villach', note: 'Križovatka A2 / A10' },
  { coords: [13.7083, 46.5475], country: 'AT', name: 'Arnoldstein', note: 'Posledné rakúske mesto pred hranicou' },
  { coords: [13.58, 46.505], country: 'IT', name: 'Tarvisio – hranica', note: 'Prechod AT → IT, vstup na talianske mýto', border: true },
  { coords: [13.1869931, 46.1327421], country: 'IT', name: 'Roccolo (Pagnacco)', note: 'Posledná zastávka pred Lignanom' },
  { coords: [13.1448582, 45.6967665], country: 'IT', name: 'Lignano Sabbiadoro', note: 'Yachting Residence' },
];

const SPAT_1_POINTS: PointDef[] = [
  { coords: [13.1448582, 45.6967665], country: 'IT', name: 'Lignano Sabbiadoro', note: 'Checkout 22. 8. 2026 o 9:00' },
  { coords: [13.139766, 45.6900363], country: 'IT', name: 'Cardillo Vincenzo', note: 'Tankovanie pred odchodom' },
  { coords: [13.58, 46.505], country: 'IT', name: 'Tarvisio – hranica', note: 'Prechod IT → AT', border: true },
  { coords: [13.8558, 46.6103], country: 'AT', name: 'Villach', note: 'Križovatka A2 / A10' },
  { coords: [14.0953451, 46.6296179], country: 'AT', name: 'Techelsberg am Wörthersee', note: 'Odpočinok pri jazere' },
  { coords: [14.305, 46.6247], country: 'AT', name: 'Klagenfurt', note: 'Hlavné mesto Korutánska, diaľničný uzol A2' },
  { coords: [15.4417305, 47.0678961], country: 'AT', name: 'Graz alebo okolie', note: 'Nocľah 22. – 23. 8. 2026' },
];

const SPAT_2_POINTS: PointDef[] = [
  { coords: [15.4417305, 47.0678961], country: 'AT', name: 'Graz alebo okolie', note: 'Odchod 23. 8. 2026' },
  { coords: [15.8, 47.05], country: 'AT' },
  { coords: [16.08, 47.05], country: 'AT', name: 'Fürstenfeld', note: 'Napojenie na S31' },
  { coords: [16.33, 47.28], country: 'AT', name: 'Oberwart', note: 'S31, Burgenland' },
  { coords: [16.42, 47.68], country: 'AT', note: 'Smer Mattersburg / Sopron' },
  { coords: [16.23, 48.0], country: 'AT', name: 'Baden bei Wien', note: 'Južne od Viedne, napojenie na A2/S1 (trasa nejde cez centrum Viedne)' },
  { coords: [16.7833, 48.0167], country: 'AT' },
  { coords: [17.0692, 48.0872], country: 'SK', name: 'Kittsee – hranica', note: 'Prechod AT → SK', border: true },
  { coords: [17.1077, 48.1486], country: 'SK', name: 'Bratislava', note: 'Obchvat D4 / D2' },
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
      distanceKm: 659,
      drivingMinutes: 442,
      description:
        'Trnava → Jurki Kopčianska (Bratislava) → Wiener Neustadt → Semmering (Alte Reichsstraße) → M-Rast Zeltweg → St. Veit → Klagenfurt → ASFINAG Wörthersee → Villach → Arnoldstein → Tarvisio → Roccolo (Pagnacco) → Lignano. Reálna trasa naplánovaná v Google Maps, nevedie cez Slovinsko.',
    },
    TAM_POINTS,
  );

  return {
    id: 'cesta-tam',
    name: 'Cesta tam',
    direction: 'tam',
    distanceKm: 659,
    drivingMinutes: 442,
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
      distanceKm: 368,
      drivingMinutes: 246,
      description:
        'Checkout o 9:00, tankovanie v Lignane, prejazd cez Tarvisio, Villach a Techelsberg am Wörthersee do okolia Grazu na jednu noc. Reálna trasa naplánovaná v Google Maps.',
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
      distanceKm: 272,
      drivingMinutes: 174,
      description: 'Posledný úsek 23. 8. 2026 cez Fürstenfeld a Oberwart (S31, Burgenland), južne popri Viedni (Baden) a cez Bratislavu domov.',
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
