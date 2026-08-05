import type { CountryCode, LngLat, PoiCategory, PointOfInterest, RouteDirection } from '@/types';

/* =========================================================
   BODY ZÁUJMU (POI)
   ---------------------------------------------------------
   Zámerne štíhly zoznam – žiadne testovacie výplne. Namiesto
   desiatok mock bodov na každom úseku sú tu len:
     1) miesto na dotankovanie pri Bratislave (lacnejšia nafta),
     2) reálne, overené ASFINAG/Autogrill odpočívadlá po celej
        trase cez Rakúsko a Taliansko – bezpečnostné prestávky
        po cca 1,5–2 h jazdy,
     3) čerpačka v Lignane na dotankovanie pred cestou domov.
   Súradnice a názvy sú overené (Google Places), nie vymyslené.
   Presné otváracie hodiny reštaurácií/obchodov v nich sa menia,
   samotné odpočívadlá a čerpačky sú ale nonstop.
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
  /* --- Dotankovanie pri Bratislave --- */
  poi({
    id: 'ba-pumpa',
    name: 'Jurki Kopčianska',
    category: 'pumpa',
    region: 'Bratislava',
    country: 'SK',
    coords: [17.0931402, 48.1097626],
    detourMinutes: 3,
    stopMinutes: 10,
    catFriendly: true,
    openingHours: '6:00 – 22:00',
    note: 'Podľa recenzií jedna z najlacnejších naft na Slovensku. Posledné tankovanie pred hranicou – natankuj tu naplno, malo by vydržať až po Taliansko.',
    directions: ['tam'],
  }),

  /* --- Rakúsko: A4 pri Parndorfe (len cesta tam, cez Burgenland) --- */
  poi({
    id: 'at-parndorf',
    name: 'ASFINAG Rastplatz Parndorf',
    category: 'odpocivadlo',
    region: 'Parndorf',
    country: 'AT',
    coords: [16.876542, 47.9705306],
    detourMinutes: 0,
    stopMinutes: 15,
    catFriendly: true,
    shade: false,
    quiet: false,
    openingHours: 'nonstop',
    note: 'Prvá rakúska zastávka na trase tam (cesta späť ide inadiaľ). Veľké parkovisko, sprchy aj WC zdarma.',
    directions: ['tam'],
  }),

  /* --- Rakúsko: A2 Wiener Neustadt --- */
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
  }),

  /* --- Rakúsko: Wechsel/Zöbern --- */
  poi({
    id: 'at-zobern',
    name: 'ASFINAG Raststation Zöbern',
    category: 'odpocivadlo',
    region: 'Semmering / Wechsel',
    country: 'AT',
    coords: [16.1167721, 47.5427097],
    detourMinutes: 0,
    stopMinutes: 15,
    catFriendly: true,
    shade: true,
    quiet: true,
    openingHours: 'nonstop',
    note: 'Čerpačka Shell priamo na mieste, pekný výhľad na hory. Podľa recenzií obľúbená prestávka na trase Viedeň–Graz.',
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
    note: 'Približne polovica trasy tam. Skvele hodnotené (reštaurácia, sprchy, WC zdarma, aj Tesla supercharger). Cesta späť ide inou vetvou, tadiaľto nejde.',
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
  }),

  /* --- Rakúsko: Arnoldstein, posledná zastávka pred hranicou --- */
  poi({
    id: 'at-arnoldstein',
    name: 'ASFINAG Raststation Dreiländereck',
    category: 'odpocivadlo',
    region: 'Arnoldstein',
    country: 'AT',
    coords: [13.6968706, 46.5708639],
    detourMinutes: 0,
    stopMinutes: 15,
    catFriendly: true,
    shade: true,
    quiet: true,
    openingHours: 'nonstop',
    note: 'Posledná rakúska zastávka pred vstupom do Talianska. Pokojné miesto pri rieke, podľa recenzií bezpečná a čisté.',
  }),

  /* --- Taliansko: hneď po hranici pri Tarvisiu --- */
  poi({
    id: 'it-tarvisio',
    name: 'Autogrill Fella Est',
    category: 'odpocivadlo',
    region: 'Tarvisio',
    country: 'IT',
    coords: [13.3756631, 46.4985707],
    detourMinutes: 0,
    stopMinutes: 15,
    catFriendly: true,
    shade: false,
    quiet: false,
    openingHours: 'nonstop',
    note: 'Prvý taliansky Autogrill po hranici, hneď za Tarvisiom (A23). Čerstvé pečivo, dobrá káva, aj drobný nákup talianskych vecí.',
  }),

  /* --- Taliansko: pri Udine --- */
  poi({
    id: 'it-udine',
    name: 'Sarni Ledra Ovest',
    category: 'odpocivadlo',
    region: 'Udine',
    country: 'IT',
    coords: [13.1192888, 46.1858914],
    detourMinutes: 0,
    stopMinutes: 15,
    catFriendly: true,
    shade: true,
    quiet: false,
    openingHours: 'nonstop',
    note: 'Poobede tu býva horúco – posledná bezpečná prestávka pred zjazdom na Latisanu/Lignano. WC aj sprchy.',
  }),

  /* --- Lignano: dotankovanie pred cestou domov --- */
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
    note: 'Priamo na ceste smer Latisana, teda presne v smere odchodu domov. Podľa recenzií ochotná obsluha. Natankuj tu 22. 8. pred odchodom.',
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
