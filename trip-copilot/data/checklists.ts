import type { Checklist } from '@/types';

export const CHECKLISTS: Checklist[] = [
  {
    id: 'cl-departure',
    title: 'Checklist pred odchodom',
    description: 'Prejdi večer pred cestou, nie ráno o piatej.',
    items: [
      { id: 'd-1', label: 'Natankovaná plná nádrž' },
      { id: 'd-2', label: 'Tlak v pneumatikách a stav oleja' },
      { id: 'd-3', label: 'Chladiaca kvapalina a ostrekovače' },
      { id: 'd-4', label: 'Slovenská diaľničná známka platná' },
      { id: 'd-5', label: 'Rakúska 10-dňová známka kúpená' },
      { id: 'd-6', label: 'Doklady: OP, vodičák, technický, zelená karta' },
      { id: 'd-7', label: 'Cestovné poistenie' },
      { id: 'd-8', label: 'Rezervácia Yachting Residence stiahnutá offline' },
      { id: 'd-9', label: 'Pas a očkovanie Sumi skontrolované' },
      { id: 'd-10', label: 'Prepravka pripravená v aute' },
      { id: 'd-11', label: 'Voda a misky na dosah, nie v kufri' },
      { id: 'd-12', label: 'Nabíjačky, držiak na telefón, powerbanka' },
      { id: 'd-13', label: 'Offline mapa Talianska stiahnutá v Google Maps' },
      { id: 'd-14', label: 'Hotovosť v eurách na mýto a parkovanie' },
      { id: 'd-15', label: 'Lieky, lekárnička, opaľovací krém' },
      { id: 'd-16', label: 'Byt: voda, plyn, okná, kľúče susedom' },
    ],
  },
  {
    id: 'cl-return',
    title: 'Checklist pred návratom',
    description: 'Ráno 22. 8. pred checkoutom o 9:00.',
    items: [
      { id: 'r-1', label: 'Prehľadané všetky zásuvky a skrine' },
      { id: 'r-2', label: 'Nabíjačky a adaptéry zbalené' },
      { id: 'r-3', label: 'Chladnička vyprázdnená' },
      { id: 'r-4', label: 'Sumi: toaleta, misky, hračky, deka' },
      { id: 'r-5', label: 'Balkón, kúpeľňa, terasa skontrolované' },
      { id: 'r-6', label: 'Kľúče odovzdané' },
      { id: 'r-7', label: 'Natankované pred cestou' },
      { id: 'r-8', label: 'Rakúska jednodňová známka na 23. 8. kúpená' },
      { id: 'r-9', label: 'Voda a jedlo do auta' },
      { id: 'r-10', label: 'Ubytovanie v Rakúsku potvrdené a adresa v telefóne' },
    ],
  },
  {
    id: 'cl-car',
    title: 'Výbava auta',
    items: [
      { id: 'c-1', label: 'Reflexné vesty pre oboch' },
      { id: 'c-2', label: 'Výstražný trojuholník' },
      { id: 'c-3', label: 'Lekárnička' },
      { id: 'c-4', label: 'Náhradné žiarovky a poistky' },
      { id: 'c-5', label: 'Rezerva alebo lepiaca sada' },
      { id: 'c-6', label: 'Slnečná clona na predné sklo' },
      { id: 'c-7', label: 'Tienidlá na bočné okná (kvôli Sumi)' },
      { id: 'c-8', label: 'Termoska s vodou' },
      { id: 'c-9', label: 'Papierové utierky a vrecká na odpad' },
    ],
  },
];

export const CONTACTS = [
  { id: 'k-1', label: 'Tiesňová linka (EU)', value: '112', note: 'Platí v SK, AT aj IT' },
  { id: 'k-2', label: 'Asistenčná služba poisťovne', value: '+420296339644', note: 'Union / Eurocross Assistance, 24/7, aj zo zahraničia' },
  { id: 'k-3', label: 'Yachting Residence', value: '+39 334 908 5534', note: 'Delegátka Mária Matiščíková' },
  { id: 'k-4', label: 'Ubytovanie v Rakúsku', value: 'doplniť', note: 'Po výbere ubytovania' },
  { id: 'k-5', label: 'Náš veterinár doma', value: 'doplniť' },
  { id: 'k-6', label: 'Veterina v Lignane', value: 'doplniť', note: 'Nájspť po príchode' },
  { id: 'k-7', label: 'Blokovanie kariet', value: 'doplniť', note: 'Číslo banky' },
];
