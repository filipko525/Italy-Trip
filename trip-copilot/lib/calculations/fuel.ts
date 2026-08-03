import type { FuelEntry, FuelStats, TankLevel } from '@/types';
import { CAR } from '@/data/trip';

export const TANK_LEVELS: { id: TankLevel; label: string; fraction: number }[] = [
  { id: 'plna', label: 'Plná nádrž', fraction: 1 },
  { id: 'tri-stvrtiny', label: '3/4', fraction: 0.75 },
  { id: 'polovica', label: 'Polovica', fraction: 0.5 },
  { id: 'stvrtina', label: '1/4', fraction: 0.25 },
  { id: 'rezerva', label: 'Rezerva', fraction: 0.1 },
];

/**
 * Spotreba od plnej po plnú:
 *   dotankované litre / prejdené kilometre × 100  =>  l/100 km
 *
 * Počíta sa len medzi dvomi tankovaniami do plna. Prvé tankovanie do plna
 * slúži ako referenčný bod, spotrebu k nemu vypočítať nevieme.
 */
export function consumptionBetween(previousFull: FuelEntry, currentFull: FuelEntry): number | null {
  const km = currentFull.odometerKm - previousFull.odometerKm;
  if (km <= 0 || currentFull.liters <= 0) return null;
  return (currentFull.liters / km) * 100;
}

export function computeFuelStats(entries: FuelEntry[]): FuelStats {
  const sorted = [...entries].sort((a, b) => a.odometerKm - b.odometerKm);

  const totalLiters = sorted.reduce((sum, e) => sum + e.liters, 0);
  const totalPrice = sorted.reduce((sum, e) => sum + e.totalPrice, 0);
  const averagePricePerLiter = totalLiters > 0 ? totalPrice / totalLiters : 0;

  const fulls = sorted.filter((e) => e.fullTank);
  const consumptions: number[] = [];
  for (let i = 1; i < fulls.length; i += 1) {
    const c = consumptionBetween(fulls[i - 1], fulls[i]);
    if (c !== null && Number.isFinite(c)) consumptions.push(c);
  }

  const averageConsumption =
    consumptions.length > 0
      ? consumptions.reduce((a, b) => a + b, 0) / consumptions.length
      : null;
  const lastConsumption = consumptions.length > 0 ? consumptions[consumptions.length - 1] : null;

  const usedConsumption = averageConsumption ?? CAR.assumedConsumption;
  const estimatedRangeKm = usedConsumption > 0 ? (CAR.tankLiters / usedConsumption) * 100 : null;

  return {
    totalLiters,
    totalPrice,
    averagePricePerLiter,
    averageConsumption,
    lastConsumption,
    estimatedRangeKm,
  };
}

/** Odhad spotrebovaného paliva a ceny na daný počet kilometrov. */
export function estimateFuelForDistance(km: number, consumption: number, pricePerLiter: number) {
  const liters = (km / 100) * consumption;
  return { liters, price: liters * pricePerLiter };
}

export const FUEL_RESERVE_WARNING =
  'Tankuj najneskôr na štvrtine nádrže. Na rezerve už nevyberáš pumpu, vyberá ona teba.';
