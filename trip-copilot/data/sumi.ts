import type { Checklist, PetProfile } from '@/types';

export const SUMI: PetProfile = {
  id: 'pet-sumi',
  name: 'Sumi',
  species: 'mačka',
  chipNumber: undefined,
  passportNumber: undefined,
  rabiesValidUntil: undefined,
  vetPhone: undefined,
  notes: 'Údaje doplň z pasu spoločenského zvieraťa.',
};

export const SUMI_DOCS_CHECKLIST: Checklist = {
  id: 'cl-sumi-docs',
  title: 'Doklady pre Sumi',
  description: 'Bez týchto vecí nemá zmysel vyrážať.',
  items: [
    { id: 's-d-1', label: 'Európsky pas spoločenského zvieraťa' },
    { id: 's-d-2', label: 'Mikročip – funkčný a zapísaný v pase' },
    { id: 's-d-3', label: 'Platné očkovanie proti besnote', note: 'Musí platiť aj 23. 8. 2026' },
    { id: 's-d-4', label: 'Kontrola údajov v pase', note: 'Meno, číslo čipu, dátumy, pečiatky' },
    { id: 's-d-5', label: 'Písomné potvrdenie mačky v ubytovaní' },
  ],
};

export const SUMI_GEAR_CHECKLIST: Checklist = {
  id: 'cl-sumi-gear',
  title: 'Výbava pre Sumi',
  items: [
    { id: 's-g-1', label: 'Prepravka' },
    { id: 's-g-2', label: 'Postroj' },
    { id: 's-g-3', label: 'Vodítko' },
    { id: 's-g-4', label: 'Jedlo na celú dovolenku' },
    { id: 's-g-5', label: 'Voda z domu', note: 'Aspoň na prvé dni – menej žalúdočných problémov' },
    { id: 's-g-6', label: 'Misky' },
    { id: 's-g-7', label: 'Maškrty' },
    { id: 's-g-8', label: 'Toaleta' },
    { id: 's-g-9', label: 'Podstielka' },
    { id: 's-g-10', label: 'Lopatka' },
    { id: 's-g-11', label: 'Vrecká' },
    { id: 's-g-12', label: 'Podložka' },
    { id: 's-g-13', label: 'Deka' },
    { id: 's-g-14', label: 'Uterák' },
    { id: 's-g-15', label: 'Obľúbená hračka' },
    { id: 's-g-16', label: 'Hygienické potreby' },
    { id: 's-g-17', label: 'Prípadné lieky', note: 'Aj na cestovnú nevoľnosť, ak ich veterinár odporučí' },
  ],
};

export const SUMI_SAFETY_WARNING =
  'Nikdy nenechávajte Sumi samu v zaparkovanom aute počas teplého počasia.';

export const SUMI_TRAVEL_TIPS = [
  'Prepravku pripútaj bezpečnostným pásom, nie voľne na sedadle.',
  'Vodu ponúkaj pri každej prestávke, aj keď ju odmieta.',
  'Prepravku otváraj len v zatvorenom priestore – nikdy pri otvorených dverách auta.',
  'Klimatizáciu smeruj tak, aby nefúkala priamo do prepravky.',
  'Pri prestávke zaparkuj v tieni a nechaj auto vetrať.',
];
