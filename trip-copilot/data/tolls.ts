import type { TollItem } from '@/types';

/*
  Cestné poplatky. Ceny nie sú predvyplnené – tarify na rok 2026 treba overiť
  na oficiálnych stránkach (eznamka.sk, asfinag.at, autostrade.it).
*/

export const TOLLS: TollItem[] = [
  {
    id: 'toll-sk',
    country: 'SK',
    name: 'Slovenská elektronická diaľničná známka',
    type: 'znamka',
    description: 'Viazaná na ŠPZ. Ak máš ročnú, len over platnosť na termín cesty.',
    purchased: false,
    note: 'Označ ako kúpené, ak už známku máš.',
  },
  {
    id: 'toll-at-10',
    country: 'AT',
    name: 'Rakúska 10-dňová známka',
    type: 'znamka',
    description: 'Pokrýva cestu tam aj pobyt. Digitálnu známku kupuj s predstihom – platí až po odkladacej lehote.',
    validFrom: '2026-08-15',
    validTo: '2026-08-24',
    purchased: false,
  },
  {
    id: 'toll-at-1',
    country: 'AT',
    name: 'Rakúska jednodňová známka',
    type: 'znamka',
    description:
      'S posunutým odchodom (15. 8.) by 10-dňová známka (platná do 24. 8.) mala pokryť celú cestu ' +
      'tam aj späť – návrat cez Rakúsko je totiž už 22.–23. 8. Túto jednodňovú by ste nemali potrebovať, ' +
      'over si to ale pred cestou.',
    validFrom: '2026-08-24',
    validTo: '2026-08-24',
    purchased: false,
    note: 'Pravdepodobne netreba – ponechané len ako záloha, ak by sa plán ešte zmenil.',
  },
  {
    id: 'toll-at-tunnel',
    country: 'AT',
    name: 'Tunelové mýto',
    type: 'tunel',
    description: 'Na zvolenej trase cez A2 sa s dodatočným tunelovým mýtom nepočíta.',
    purchased: true,
    note: 'Netreba riešiť pri trase Graz – Klagenfurt – Villach – Tarvisio.',
  },
  {
    id: 'toll-it-tam',
    country: 'IT',
    name: 'Talianske mýto – cesta tam',
    type: 'myto',
    description: 'Vstup približne pri Tarvisiu, výjazd Latisana. Pri vstupe zober lístok, plať pri výjazde.',
    purchased: false,
    note: 'Cenu doplň po ceste do nákladov. Hotovosť aj karta fungujú, ale majte drobné.',
  },
  {
    id: 'toll-it-spat',
    country: 'IT',
    name: 'Talianske mýto – cesta späť',
    type: 'myto',
    description: 'Rovnaký systém opačne: nájazd Latisana, platba pri výjazde Tarvisio.',
    purchased: false,
  },
];

export const SLOVINSKO_NOTE =
  'Slovinská diaľničná známka nie je potrebná. Zvolená trasa nevedie cez Slovinsko – ani cez Maribor, ani cez Ľubľanu.';
