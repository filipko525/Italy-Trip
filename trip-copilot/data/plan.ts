import type { PlanItem } from '@/types';

/* Časová os dovolenky. Časy príchodov sú predbežné odhady. */

export const PLAN: PlanItem[] = [
  {
    id: 'p-1',
    date: '2026-08-15',    time: '05:00',
    title: 'Odchod z Trnavy',
    detail: 'Predbežný čas – uprav podľa toho, kedy naozaj vyrazíte. Skoré ráno = chladnejšie pre Sumi.',
    kind: 'odchod',
    tentative: true,
  },
  {
    id: 'p-2',
    date: '2026-08-15',    title: 'Cesta do Lignana',
    detail: '669 km, čistý čas jazdy približne 6 h 55 min. S prestávkami počítaj skôr s 9 hodinami.',
    kind: 'jazda',
  },
  {
    id: 'p-3',
    date: '2026-08-15',    time: '15:00',
    title: 'Príchod – Yachting Residence',
    detail: 'Lignano Sabbiadoro. Presný čas check-inu zatiaľ nevieme – pokyny prídu podľa zmluvy 7 dní pred odchodom. Doplniť, keď prídu.',    kind: 'prichod',
    tentative: true,
  },
  {
    id: 'p-4',
    date: '2026-08-15',    title: 'Check-in a ubytovanie Sumi',
    detail: 'Prepravku otvárať až v zatvorenej izbe. Najprv toaleta, voda, potom jedlo.',
    kind: 'checkin',
  },
  {
    id: 'p-5',
    date: '2026-08-16',    title: 'Pobyt v Lignano Sabbiadoro',
    detail: '16. – 22. 8. 2026. Program si dopĺňajte počas dovolenky. Pozor: potvrdenie od CK uvádza pobyt 14.–23.8. (7 nocí by malo vychádzať na 16.–23.8.) – over si to s CK, nech vieš, či prvá noc prepadá alebo je posun v poriadku.',    kind: 'pobyt',
  },
  {
    id: 'p-6',
    date: '2026-08-23',
    time: '10:00',
    title: 'Checkout z Yachting Residence',
    detail: 'Kontrola izby, kľúče, doklady, Sumi a jej veci.',
    kind: 'checkout',
  },
  {
    id: 'p-7',
    date: '2026-08-23',
    title: 'Cesta smer Rakúsko',
    detail: 'Lignano → Latisana → Udine → Tarvisio → Villach → Klagenfurt → Graz alebo okolie. Približne 395 km.',
    kind: 'jazda',
  },
  {
    id: 'p-8',
    date: '2026-08-23',
    time: '16:30',
    title: 'Príchod na nocľah v Rakúsku',
    detail: 'Ubytovanie zatiaľ nie je vybrané. Rozpočet približne 100 €, s mačkou a parkovaním.',
    kind: 'nocl',
    tentative: true,
  },
  {
    id: 'p-9',
    date: '2026-08-23',
    time: '19:00',
    title: 'Večera a prespanie',
    detail: 'Sumi má vlastný pokojný kút, toaletu a vodu.',
    kind: 'nocl',
    tentative: true,
  },
  {
    id: 'p-10',
    date: '2026-08-24',
    time: '09:00',
    title: 'Odchod z Rakúska',
    detail: 'Graz alebo okolie → Wiener Neustadt → Viedeň → Bratislava → Trnava. Približne 285 km.',
    kind: 'jazda',
    tentative: true,
  },
  {
    id: 'p-11',
    date: '2026-08-24',
    time: '12:30',
    title: 'Príchod do Trnavy',
    detail: 'Doma. Skontrolovať Sumi, vybaliť, doplniť náklady v aplikácii.',
    kind: 'domov',
    tentative: true,
  },
];
