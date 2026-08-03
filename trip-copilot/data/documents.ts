import type { TripDocument } from '@/types';

export const DOCUMENTS: TripDocument[] = [
  { id: 'doc-1', name: 'Občiansky preukaz – vodič', category: 'Osobné doklady' },
  { id: 'doc-2', name: 'Občiansky preukaz – spolujazdec', category: 'Osobné doklady' },
  { id: 'doc-3', name: 'Vodičský preukaz', category: 'Auto' },
  { id: 'doc-4', name: 'Technický preukaz', category: 'Auto' },
  { id: 'doc-5', name: 'Zelená karta', category: 'Auto', note: 'Skontroluj platnosť do 24. 8. 2026' },
  { id: 'doc-6', name: 'Cestovné poistenie', category: 'Poistenie', note: 'Vrátane asistenčných služieb' },
  { id: 'doc-7', name: 'Rezervácia ubytovania – Lignano', category: 'Rezervácie', note: 'Stiahnuť aj offline' },
  { id: 'doc-8', name: 'Voucher cestovnej kancelárie', category: 'Rezervácie', note: 'Ak sa cesta rezervovala cez CK' },
  { id: 'doc-9', name: 'Rezervácia ubytovania – Rakúsko', category: 'Rezervácie', note: 'Zatiaľ nevybrané' },
  { id: 'doc-10', name: 'Slovenská diaľničná známka', category: 'Cestné poplatky' },
  { id: 'doc-11', name: 'Rakúska diaľničná známka 10 dní', category: 'Cestné poplatky' },
  { id: 'doc-12', name: 'Rakúska diaľničná známka 1 deň', category: 'Cestné poplatky' },
  { id: 'doc-13', name: 'Európsky pas spoločenského zvieraťa – Sumi', category: 'Sumi' },
  { id: 'doc-14', name: 'Očkovanie proti besnote – Sumi', category: 'Sumi', note: 'Musí byť platné počas celej cesty' },
];
