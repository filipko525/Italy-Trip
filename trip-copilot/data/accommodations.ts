import type { Accommodation } from '@/types';

/*
  Ubytovanie. Yachting Residence je potvrdené (voucher CK Piešťany Tour, č. 2111126).
  Ubytovanie v Rakúsku ešte treba vybrať.
*/

export const ACCOMMODATIONS: Accommodation[] = [
  {
    id: 'acc-lignano',
    name: 'Yachting Residence',
    address: 'Viale Italia 70, 33054 Lignano Sabbiadoro, Taliansko',
    coords: [13.1448582, 45.6967665],
    checkIn: '2026-08-15',
    checkOut: '2026-08-22',
    reservationNumber: '2111126',
    phone: '+39 334 908 5534',
    email: undefined,
    parking: 'overiť pred cestou',
    petPolicy: 'potvrdenie od CK nespomína zvieratá výslovne – písomné potvrdenie, že mačka je povolená, si vyžiadaj priamo pri check-ine',
    petFee: 'doplniť',
    status: 'potvrdene',
    notes:
      'Voucher CK Piešťany Tour č. 2111126. Check-in cca 13:00, večera 18:00 v deň príchodu. ' +
      'Check-out s raňajkami, apartmán opustiť do 9:00. Delegátka Mária Matiščíková, tel. +39 334 908 5534. ' +
      'Apartmán má servis, chladničku, kuchynský kút, soc. zariadenie – treba si priniesť vlastný jar, utierku, ' +
      'zápalky, toaletný papier, uteráky, hygienické potreby a prípravky proti komárom. Miestna voda je pitná. ' +
      'Upratovanie počas pobytu je na klientovi, hotelové služby sa neposkytujú. ' +
      'Partner na mieste: Peruch e Lucchese, Viale dei Platani 54, Lignano Sabbiadoro.',
  },
  {
    id: 'acc-austria',
    name: 'Nevybrané ubytovanie',
    address: 'Graz alebo okolie, Rakúsko',
    checkIn: '2026-08-22',
    checkOut: '2026-08-23',
    parking: 'požiadavka: vlastné parkovanie',
    petPolicy: 'požiadavka: povolená mačka',
    budgetEur: 100,
    status: 'nevybrane',
    notes:
      '2 dospelí + 1 mačka, jedna noc, ideálne priamo pri trase A2. Jednoduché prespanie do 100 €. Vyber a doplň najneskôr v júli 2026.',
  },
];
