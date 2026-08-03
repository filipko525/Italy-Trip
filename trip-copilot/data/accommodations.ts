import type { Accommodation } from '@/types';

/*
  Ubytovanie. Rezervačné čísla, telefón a e-mail nie sú vyplnené zámerne –
  aplikácia nevytvára falošné potvrdené rezervácie. Doplň z e-mailu s rezerváciou.
*/

export const ACCOMMODATIONS: Accommodation[] = [
  {
    id: 'acc-lignano',
    name: 'Yachting Residence',
    address: 'Lignano Sabbiadoro, Taliansko',
    coords: [13.13, 45.6789],
    checkIn: '2026-08-14',
    checkOut: '2026-08-23',
    reservationNumber: undefined,
    phone: undefined,
    email: undefined,
    parking: 'overiť pred cestou',
    petPolicy: 'overiť – potrebujeme písomné potvrdenie, že mačka je povolená',
    petFee: 'doplniť',
    status: 'overit',
    notes: 'Súradnice sú približné (stred Lignana). Po potvrdení rezervácie doplň presnú adresu a GPS.',
  },
  {
    id: 'acc-austria',
    name: 'Nevybrané ubytovanie',
    address: 'Graz alebo okolie, Rakúsko',
    checkIn: '2026-08-23',
    checkOut: '2026-08-24',
    parking: 'požiadavka: vlastné parkovanie',
    petPolicy: 'požiadavka: povolená mačka',
    budgetEur: 100,
    status: 'nevybrane',
    notes:
      '2 dospelí + 1 mačka, jedna noc, ideálne priamo pri trase A2. Jednoduché prespanie do 100 €. Vyber a doplň najneskôr v júli 2026.',
  },
];
