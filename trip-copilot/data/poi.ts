import type { CountryCode, LngLat, PoiCategory, PointOfInterest, RouteDirection } from '@/types';

/* =========================================================
   BODY ZÁUJMU (POI)
   ---------------------------------------------------------
   Hlavné zastávky sú priamo z reálnej, používateľom naplánovanej
   trasy v Google Maps (nie naše odhady). K nim je doplnených
   pár overených ASFINAG odpočívadiel na trase pre bezpečnostné
   prestávky. Súradnice a názvy sú overené (Google Places/Maps),
   nie vymyslené. Presné otváracie hodiny reštaurácií/obchodov
   v nich sa menia, samotné odpočívadlá a čerpačky sú ale nonstop.
   ========================================================= */

export const POI_CATEGORY_LABELS: Record<PoiCategory, string> = {
  pumpa: 'Čerpacia stanica',
  wc: 'WC',
  odpocivadlo: 'Odpočívadlo',
  jedlo: 'Jedlo',
  kava: 'Káva',
  vyhliadka: 'Vyhliadka',
  prechadzka: 'Krátka prechádzka',
  zaujimave: 'Zaujímavé miesto',
  nakup: 'Nákup',
  veterina: 'Veterina',
  pet: 'Pet-friendly zastávka',
  pokoj: 'Pokojné miesto so Sumi',
  noclah: 'Nocľah',
};

interface PoiInput {
  id: string;
  name: string;
  category: PoiCategory;
  region: string;
  country: CountryCode;
  coords: LngLat;
  detourMinutes: number;
  stopMinutes: number;
  catFriendly: boolean;
  parking?: boolean;
  shade?: boolean;
  quiet?: boolean;
  openingHours?: string;
  note?: string;
  /** Pre ktorý smer bod platí. Bez hodnoty = platí pre oba (cesta tam aj späť). */
  directions?: RouteDirection[];
}

const poi = (input: PoiInput): PointOfInterest => ({
  parking: true,
  isMockData: false,
  ...input,
});

export const POINTS_OF_INTEREST: PointOfInterest[] = [
  /* --- Dotankovanie pri Bratislave (len cesta tam) --- */
  poi({
    id: 'ba-pumpa',
    name: 'Jurki Kopčianska',
    category: 'pumpa',
    region: 'Bratislava',
    country: 'SK',
    coords: [17.0932238, 48.1097319],
    detourMinutes: 3,
    stopMinutes: 10,
    catFriendly: true,
    openingHours: '6:00 – 22:00',
    note: 'Podľa recenzií jedna z najlacnejších naft na Slovensku. Posledné tankovanie pred hranicou – natankuj tu naplno, malo by vydržať až po Taliansko.',
    directions: ['tam'],
  }),

  /* --- Rakúsko: A2 Wiener Neustadt (len cesta tam) --- */
  poi({
    id: 'at-wn',
    name: 'ASFINAG Rastplatz Wiener Neustadt',
    category: 'odpocivadlo',
    region: 'Wiener Neustadt',
    country: 'AT',
    coords: [16.1878412, 47.7471286],
    detourMinutes: 0,
    stopMinutes: 15,
    catFriendly: true,
    shade: true,
    quiet: false,
    openingHours: 'nonstop',
    note: 'Prvá bezpečná prestávka po cca hodine jazdy. WC zdarma, pitná voda, veľké parkovisko.',
    directions: ['tam'],
  }),

  /* --- Rakúsko: vyhliadka na starej ceste cez Semmering (len cesta tam) --- */
  poi({
    id: 'at-semmering',
    name: 'Alte Reichsstraße (Semmering)',
    category: 'vyhliadka',
    region: 'Steinhaus am Semmering',
    country: 'AT',
    coords: [15.802547, 47.6236802],
    detourMinutes: 2,
    stopMinutes: 15,
    catFriendly: true,
    shade: false,
    quiet: true,
    note: 'Vyhliadkový bod na historickej ceste cez Semmering – náš vlastný, overený bod z reálnej trasy. Pekné miesto na krátke pretiahnutie nôh a fotku.',
    directions: ['tam'],
  }),

  /* --- Rakúsko: Judenburg/Zeltweg, S36 obchádza Graz (len cesta tam) --- */
  poi({
    id: 'at-zeltweg',
    name: 'M-Rast Zeltweg',
    category: 'odpocivadlo',
    region: 'Judenburg',
    country: 'AT',
    coords: [14.722053, 47.1941494],
    detourMinutes: 0,
    stopMinutes: 20,
    catFriendly: true,
    shade: true,
    quiet: false,
    openingHours: 'nonstop',
    note: 'Približne polovica trasy tam. Skvele hodnotené (reštaurácia, sprchy, WC zdarma, aj Tesla supercharger).',
    directions: ['tam'],
  }),

  /* --- Rakúsko: Wörthersee --- */
  poi({
    id: 'at-worthersee',
    name: 'ASFINAG Raststation Wörthersee',
    category: 'vyhliadka',
    region: 'Wörthersee',
    country: 'AT',
    coords: [14.0950087, 46.6297031],
    detourMinutes: 0,
    stopMinutes: 20,
    catFriendly: false,
    shade: false,
    quiet: false,
    openingHours: 'nonstop',
    note: 'Najkrajší výhľad na trase – priamo nad jazerom Wörthersee. WC je tu spoplatnené (v cene je bloček na nákup). Cez deň býva plno.',
    directions: ['tam'],
  }),

  /* --- Taliansko: Roccolo pri Pagnacco, posledná zastávka pred Lignanom (len cesta tam) --- */
  poi({
    id: 'it-pagnacco',
    name: 'Roccolo (Pagnacco)',
    category: 'odpocivadlo',
    region: 'Pagnacco (Udine)',
    country: 'IT',
    coords: [13.1869931, 46.1327421],
    detourMinutes: 2,
    stopMinutes: 15,
    catFriendly: true,
    note: 'Náš vlastný, overený bod z reálnej trasy – posledná zastávka pred Lignanom, tesne za Vami.',
    directions: ['tam'],
  }),

  /* --- Lignano: dotankovanie pred cestou domov (len cesta späť) --- */
  poi({
    id: 'li-pumpa',
    name: 'Cardillo Vincenzo',
    category: 'pumpa',
    region: 'Lignano Sabbiadoro',
    country: 'IT',
    coords: [13.139766, 45.6900363],
    detourMinutes: 5,
    stopMinutes: 15,
    catFriendly: true,
    note: 'Priamo na ceste smer Tarvisio, teda presne v smere odchodu domov. Podľa recenzií ochotná obsluha. Natankuj tu 22. 8. pred odchodom.',
    directions: ['spat'],
  }),

  /* --- Rakúsko: Techelsberg am Wörthersee (len cesta späť) --- */
  poi({
    id: 'at-techelsberg',
    name: 'Techelsberg am Wörthersee',
    category: 'vyhliadka',
    region: 'Wörthersee',
    country: 'AT',
    coords: [14.0953451, 46.6296179],
    detourMinutes: 2,
    stopMinutes: 30,
    catFriendly: true,
    shade: true,
    quiet: true,
    note: 'Náš vlastný bod z reálnej trasy späť – pekné miesto pri jazere na dlhšiu prestávku, kým sa cestou pokračuje na nocľah do Grazu.',
    directions: ['spat'],
  }),
];

/** Rýchle filtre na obrazovke Pred nami. */
export const QUICK_FILTERS: { id: string; label: string; categories: PoiCategory[]; maxDetour?: number; maxStop?: number }[] = [
  { id: 'wc', label: 'Potrebujeme WC', categories: ['wc', 'odpocivadlo', 'pumpa'], maxDetour: 5 },
  { id: 'tank', label: 'Potrebujeme tankovať', categories: ['pumpa'], maxDetour: 15 },
  { id: 'jedlo', label: 'Chceme jesť', categories: ['jedlo', 'odpocivadlo'], maxDetour: 15 },
  { id: '15', label: 'Máme 15 minút', categories: ['wc', 'kava', 'odpocivadlo', 'pumpa'], maxStop: 15 },
  { id: '30', label: 'Máme 30 minút', categories: ['odpocivadlo', 'jedlo', 'kava', 'prechadzka', 'vyhliadka'], maxStop: 30 },
  { id: 'vidiet', label: 'Chceme niečo vidieť', categories: ['vyhliadka', 'zaujimave', 'prechadzka'] },
  { id: 'sumi', label: 'Prestávka pre Sumi', categories: ['pokoj', 'pet', 'odpocivadlo', 'prechadzka'], maxDetour: 15 },
];
