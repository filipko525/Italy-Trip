/* =========================================================
   TIPY NA VÝLETY
   ---------------------------------------------------------
   Reálne, overené miesta (Google Places) – nie vymyslené.
   Graz: čo pozrieť večer pri nocľahu cestou späť.
   Taliansko: výlety autom z Lignana počas pobytu.
   ========================================================= */

export interface DiscoverTip {
  id: string;
  name: string;
  category: string;
  note: string;
  mapsQuery: string;
}

export const GRAZ_TIPS: DiscoverTip[] = [
  {
    id: 'graz-schlossberg',
    name: 'Schlossberg',
    category: 'Vyhliadka',
    note: 'Kopec priamo nad centrom, výhľad na celé mesto. Hore sa dá pešo, výťahom alebo lanovkou. Dole vedie aj tobogan (najdlhší podzemný na svete).',
    mapsQuery: 'Schlossberg Graz',
  },
  {
    id: 'graz-uhrturm',
    name: 'Uhrturm (Hodinová veža)',
    category: 'Vyhliadka',
    note: 'Symbol Grazu priamo na Schlossbergu. Vstup zadarmo, výťah na vyhliadku 2,50 €.',
    mapsQuery: 'Uhrturm Graz',
  },
  {
    id: 'graz-hauptplatz',
    name: 'Hauptplatz a staré mesto',
    category: 'Prechádzka',
    note: 'Historické centrum (UNESCO), farebné fasády, kaviarne. Dobré na krátku večernú prechádzku po dlhej jazde.',
    mapsQuery: 'Hauptplatz Graz',
  },
  {
    id: 'graz-eggenberg',
    name: 'Schloss Eggenberg',
    category: 'Zámok',
    note: 'Barokový zámok s parkom, kde voľne behajú pávy. Park je prístupný aj keď je zámok zatvorený.',
    mapsQuery: 'Schloss Eggenberg Graz',
  },
];

export const TALIANSKO_TIPS: DiscoverTip[] = [
  {
    id: 'it-aquileia',
    name: 'Aquileia – bazilika a rímske ruiny',
    category: 'UNESCO pamiatka',
    note: 'Jedny z najzachovalejších rímskych mozaík na svete, cca 40 min autom od Lignana.',
    mapsQuery: 'Basilica di Aquileia',
  },
  {
    id: 'it-grado',
    name: 'Grado – Ostrov slnka',
    category: 'Mestečko pri mori',
    note: 'Benátske uličky (calli), pekná pláž, cca 35 min autom. Príjemná zmena oproti Lignanu.',
    mapsQuery: 'Grado Isola del Sole',
  },
  {
    id: 'it-palmanova',
    name: 'Palmanova – hviezdicová pevnosť',
    category: 'Historické mesto',
    note: 'Celé mesto postavené v tvare hviezdy (16. storočie), zaujímavá prechádzka po hradbách. Cca 45 min autom.',
    mapsQuery: 'Palmanova Fortezza',
  },
  {
    id: 'it-udine',
    name: 'Udine – historické centrum',
    category: 'Mesto',
    note: 'Piazza della Libertà a hrad na kopci s výhľadom. Cca 1 hodina autom.',
    mapsQuery: 'Piazza della Liberta Udine',
  },
];
