/* =========================================================
   ZAUJÍMAVOSTI POČAS JAZDY
   ---------------------------------------------------------
   Krátke, overené fakty naviazané na konkrétny kilometer trasy.
   Zobrazia sa raz (v cestovnom režime), keď auto prejde okolo
   daného miesta – v oboch smeroch. Nič nevymyslené, len bežne
   známe/overiteľné fakty o miestach na trase.
   ========================================================= */

export interface Factoid {
  id: string;
  direction: 'tam' | 'spat';
  /** Kilometer na trase (v danom smere), pri ktorom sa fakt odomkne. */
  triggerKm: number;
  place: string;
  title: string;
  text: string;
}

export const FACTOIDS: Factoid[] = [
  // --- Cesta tam ---
  {
    id: 'tam-trnava',
    direction: 'tam',
    triggerKm: 15,
    place: 'Trnava',
    title: 'Malý Rím',
    text: 'Trnave sa prezývalo "malý Rím" – v historickom centre stálo naraz až 13 kostolov a kláštorov, viac než v akomkoľvek inom slovenskom meste.',
  },
  {
    id: 'tam-petrzalka',
    direction: 'tam',
    triggerKm: 69,
    place: 'Petržalka',
    title: 'Najväčšie sídlisko',
    text: 'Petržalka, cez ktorú práve prechádzate, patrí medzi najväčšie panelákové sídliská v strednej Európe – žije tu okolo 100-tisíc ľudí.',
  },
  {
    id: 'tam-semmering',
    direction: 'tam',
    triggerKm: 224,
    place: 'Semmering',
    title: 'Prvá horská železnica sveta',
    text: 'Semmeringská dráha, ktorú práve obchádzate, je zapísaná v UNESCO – bola to prvá horská železnica na svete postavená s normálnym rozchodom (dokončená 1854).',
  },
  {
    id: 'tam-zeltweg',
    direction: 'tam',
    triggerKm: 356,
    place: 'Zeltweg',
    title: 'Susedia s F1 okruhom',
    text: 'Kúsok odtiaľto, v neďalekom Spielbergu, sa nachádza Red Bull Ring – okruh, kde sa jazdí Veľká cena Rakúska F1.',
  },
  {
    id: 'tam-worthersee',
    direction: 'tam',
    triggerKm: 466,
    place: 'Wörthersee',
    title: 'Najteplejšie jazero v Alpách',
    text: 'Wörthersee patrí medzi najteplejšie alpské jazerá – v lete sa voda ohreje aj na 26–28 °C. Každoročne sem tiež smeruje slávne stretnutie fanúšikov VW ("GTI Treffen").',
  },
  {
    id: 'tam-tromeja',
    direction: 'tam',
    triggerKm: 520,
    place: 'Tarvisio',
    title: 'Tri hranice na jednom mieste',
    text: 'Neďaleko Tarvisia, ktorým prechádzate, sa na vrchu Tromeja stretávajú hranice troch krajín naraz – Talianska, Rakúska a Slovinska.',
  },
  {
    id: 'tam-friuli',
    direction: 'tam',
    triggerKm: 591,
    place: 'Friuli',
    title: 'Vlastná reč',
    text: 'V regióne Friuli-Venezia Giulia, ktorým teraz idete, sa popri taliančine bežne hovorí aj po furlansky – vlastným, úradne uznaným jazykom tohto kraja.',
  },
  {
    id: 'tam-lignano',
    direction: 'tam',
    triggerKm: 645,
    place: 'Lignano',
    title: 'Tvar morského koníka',
    text: 'Polostrov Lignano má z vtáčej perspektívy tvar morského koníka – dobre to vidno na mapách aj zo satelitu. Vitajte tesne pred cieľom!',
  },

  // --- Cesta späť ---
  {
    id: 'spat-lignano',
    direction: 'spat',
    triggerKm: 2,
    place: 'Lignano',
    title: 'Tvar morského koníka',
    text: 'Lignano, ktoré opúšťate, má z vtáčej perspektívy tvar morského koníka – jeden z dôvodov, prečo je na leteckých fotkách také rozpoznateľné.',
  },
  {
    id: 'spat-tarvisio',
    direction: 'spat',
    triggerKm: 100,
    place: 'Tarvisio',
    title: 'Jedno z najsnežnejších miest Talianska',
    text: 'Tarvisio, cez ktoré prechádzate, patrí medzi najsnežnejšie miesta v Taliansku – v zime tu bežne napadne cez 2 metre snehu.',
  },
  {
    id: 'spat-worthersee',
    direction: 'spat',
    triggerKm: 196,
    place: 'Wörthersee',
    title: 'Stretnutie tisícov áut',
    text: 'K jazeru Wörthersee, popri ktorom idete, každoročne mieri jedno z najväčších stretnutí fanúšikov áut v Európe – takzvaný "GTI Treffen".',
  },
  {
    id: 'spat-steiermark',
    direction: 'spat',
    triggerKm: 300,
    place: 'Štajersko',
    title: 'Zelené srdce Rakúska',
    text: 'Región, ktorým prechádzate, sa v Rakúsku prezýva "zelené srdce" – je známy tekvicovým olejom, jablkami a vínom.',
  },
  {
    id: 'spat-graz',
    direction: 'spat',
    triggerKm: 360,
    place: 'Graz',
    title: 'Mesto dizajnu UNESCO',
    text: 'Graz, kam práve prichádzate na nocľah, nesie od roku 2011 titul UNESCO City of Design – aj vďaka modernej budove Kunsthaus, ktorú miestni prezývajú "Priateľský mimozemšťan".',
  },
];
