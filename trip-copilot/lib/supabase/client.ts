import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/*
  Supabase je v Etape 1 VOLITEĽNÝ.
  Bez premenných v .env.local vráti getSupabase() null a aplikácia
  ďalej beží na lokálnom úložisku (lib/storage/app-state.tsx).
*/

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) client = createClient(url, anonKey);
  return client;
}

export const isSupabaseConfigured = () => Boolean(url && anonKey);

/**
 * Demo profil pre prvú verziu bez prihlásenia.
 * Keď neskôr pridáš Supabase Auth, stačí toto ID nahradiť user.id.
 */
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
