import type { Expense, FuelEntry } from '@/types';
import { DEMO_USER_ID, getSupabase } from './client';

/*
  Pripravené funkcie na neskoršiu synchronizáciu.
  V Etape 1 sa nevolajú – dáta žijú lokálne. Nechávam ich tu, aby bolo
  jasné, ako sa lokálny stav napojí na tabuľky zo SQL migrácie.
*/

export async function pushExpenses(tripId: string, expenses: Expense[]) {
  const supabase = getSupabase();
  if (!supabase) return { synced: false as const, reason: 'Supabase nie je nakonfigurované.' };

  const rows = expenses.map((e) => ({
    id: e.id,
    trip_id: tripId,
    user_id: DEMO_USER_ID,
    date: e.date,
    category: e.category,
    title: e.title,
    amount: e.amount,
    currency: e.currency,
    country: e.country,
    note: e.note ?? null,
  }));

  const { error } = await supabase.from('expenses').upsert(rows);
  return error ? { synced: false as const, reason: error.message } : { synced: true as const };
}

export async function pushFuelEntries(tripId: string, entries: FuelEntry[]) {
  const supabase = getSupabase();
  if (!supabase) return { synced: false as const, reason: 'Supabase nie je nakonfigurované.' };

  const rows = entries.map((e) => ({
    id: e.id,
    trip_id: tripId,
    user_id: DEMO_USER_ID,
    date: e.date,
    place: e.place,
    country: e.country,
    odometer_km: e.odometerKm,
    liters: e.liters,
    price_per_liter: e.pricePerLiter,
    total_price: e.totalPrice,
    full_tank: e.fullTank,
    note: e.note ?? null,
  }));

  const { error } = await supabase.from('fuel_entries').upsert(rows);
  return error ? { synced: false as const, reason: error.message } : { synced: true as const };
}
