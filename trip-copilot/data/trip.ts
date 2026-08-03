import type { CountryCode } from '@/types';

/* Základné údaje o dovolenke. Odhady sú označené ako predbežné. */

export const TRIP = {
  id: 'lignano-2026',
  title: 'TRIP COPILOT',
  subtitle: 'Lignano 2026',
  travelers: 2,
  pet: 'Sumi',
  departureDate: '2026-08-15',    arrivalHomeDate: '2026-08-24',
  stayFrom: '2026-08-14',
  stayTo: '2026-08-23',
  checkoutTime: '10:00',
  homeCity: 'Trnava',
  destination: 'Lignano Sabbiadoro',
} as const;

export const CAR = {
  model: 'Seat Ibiza 2011',
  power: '63 kW',
  fuel: 'benzín',
  tankLiters: 45,
  cruiseSpeedKmh: 110,
  /** Predbežný odhad spotreby, kým nemáme reálne tankovania. */
  assumedConsumption: 6.5,
} as const;

export const BUDGET = {
  /** Predbežný celkový rozpočet – uprav v nastaveniach. */
  totalEur: 1200,
  fuelEurFrom: 180,
  fuelEurTo: 190,
  fuelLitersFrom: 90,
  fuelLitersTo: 100,
  austriaNightEur: 100,
} as const;

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  SK: 'Slovensko',
  AT: 'Rakúsko',
  IT: 'Taliansko',
};
