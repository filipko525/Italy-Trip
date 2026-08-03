-- =========================================================
-- TRIP COPILOT – LIGNANO 2026
-- Počiatočná schéma pre Supabase (PostgreSQL).
--
-- Spustenie: Supabase → SQL Editor → vlož obsah → Run.
--
-- Prvá verzia beží bez prihlásenia cez demo user_id. Stĺpec user_id
-- je pripravený na neskoršie napojenie na auth.users, aby sa dalo
-- prihlásenie pridať bez migrácie dát.
-- =========================================================

create extension if not exists "pgcrypto";

-- Spoločný trigger na updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- trips ----------
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  home_city text,
  destination text,
  travelers smallint not null default 2,
  budget_eur numeric(10, 2),
  car_model text,
  car_tank_liters numeric(5, 1),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- routes ----------
create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  name text not null,
  direction text not null check (direction in ('tam', 'spat')),
  distance_km numeric(7, 1) not null,
  driving_minutes integer not null,
  geometry jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- route_segments ----------
create table if not exists public.route_segments (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes (id) on delete cascade,
  name text not null,
  position smallint not null,
  from_place text not null,
  to_place text not null,
  distance_km numeric(7, 1) not null,
  driving_minutes integer not null,
  description text,
  geometry jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (route_id, position)
);

-- ---------- waypoints ----------
create table if not exists public.waypoints (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null references public.route_segments (id) on delete cascade,
  name text not null,
  country char(2) not null,
  lng double precision not null,
  lat double precision not null,
  km_from_start numeric(7, 1) not null,
  is_border_crossing boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- points_of_interest ----------
create table if not exists public.points_of_interest (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips (id) on delete cascade,
  name text not null,
  category text not null,
  region text,
  country char(2) not null,
  lng double precision not null,
  lat double precision not null,
  detour_minutes smallint not null default 0,
  stop_minutes smallint not null default 15,
  cat_friendly boolean not null default false,
  parking boolean not null default true,
  shade boolean,
  quiet boolean,
  opening_hours text,
  note text,
  -- Testovacie dáta musia byť rozoznateľné aj v databáze.
  is_mock_data boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists poi_trip_idx on public.points_of_interest (trip_id);
create index if not exists poi_category_idx on public.points_of_interest (category);

-- ---------- accommodations ----------
create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  name text not null,
  address text,
  lng double precision,
  lat double precision,
  check_in date not null,
  check_out date not null,
  reservation_number text,
  phone text,
  email text,
  parking text,
  pet_policy text,
  pet_fee text,
  booking_url text,
  budget_eur numeric(10, 2),
  status text not null default 'nevybrane' check (status in ('potvrdene', 'nevybrane', 'overit')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- expenses ----------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null,
  date date not null,
  category text not null,
  title text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  currency char(3) not null default 'EUR',
  country char(2) not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_trip_date_idx on public.expenses (trip_id, date);

-- ---------- fuel_entries ----------
create table if not exists public.fuel_entries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null,
  date date not null,
  place text,
  country char(2) not null,
  odometer_km integer not null,
  liters numeric(6, 2) not null check (liters > 0),
  price_per_liter numeric(6, 3) not null check (price_per_liter > 0),
  total_price numeric(10, 2) not null,
  full_tank boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fuel_trip_odo_idx on public.fuel_entries (trip_id, odometer_km);

-- ---------- checklists ----------
create table if not exists public.checklists (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  title text not null,
  description text,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- checklist_items ----------
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists (id) on delete cascade,
  label text not null,
  note text,
  position smallint not null default 0,
  is_done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checklist_items_list_idx on public.checklist_items (checklist_id);

-- ---------- pet_profiles ----------
create table if not exists public.pet_profiles (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  name text not null,
  species text not null default 'mačka',
  chip_number text,
  passport_number text,
  rabies_valid_until date,
  vet_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- pet_logs ----------
create table if not exists public.pet_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pet_profiles (id) on delete cascade,
  kind text not null check (kind in ('prestavka', 'voda', 'jedlo', 'kontrola', 'poznamka')),
  happened_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pet_logs_pet_idx on public.pet_logs (pet_id, happened_at desc);

-- ---------- breaks ----------
create table if not exists public.breaks (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  poi_id uuid references public.points_of_interest (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  place text,
  type text not null check (type in ('wc', 'jedlo', 'tankovanie', 'sumi', 'oddych', 'zaujimave')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- documents ----------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  name text not null,
  category text not null,
  is_ready boolean not null default false,
  valid_until date,
  note text,
  link text,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- tolls ----------
create table if not exists public.tolls (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  country char(2) not null,
  name text not null,
  type text not null check (type in ('znamka', 'myto', 'tunel')),
  description text,
  valid_from date,
  valid_to date,
  price_eur numeric(10, 2),
  purchased boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- user_settings ----------
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  trip_id uuid references public.trips (id) on delete set null,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  budget_eur numeric(10, 2),
  direction text not null default 'tam' check (direction in ('tam', 'spat')),
  use_mock_location boolean not null default true,
  mock_progress_km numeric(7, 1) not null default 0,
  odometer_start_km integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- triggery na updated_at ----------
do $$
declare
  t text;
begin
  foreach t in array array[
    'trips', 'routes', 'route_segments', 'waypoints', 'points_of_interest',
    'accommodations', 'expenses', 'fuel_entries', 'checklists', 'checklist_items',
    'pet_profiles', 'pet_logs', 'breaks', 'documents', 'tolls', 'user_settings'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;
end;
$$;

-- ---------- Row Level Security ----------
-- Zapneme RLS a zatiaľ povolíme prístup len prihláseným používateľom
-- k vlastným záznamom. Kým appka beží bez prihlásenia na lokálnom
-- úložisku, tieto politiky nič neblokujú.
alter table public.trips enable row level security;
alter table public.expenses enable row level security;
alter table public.fuel_entries enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "vlastne tripy" on public.trips;
create policy "vlastne tripy" on public.trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "vlastne vydavky" on public.expenses;
create policy "vlastne vydavky" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "vlastne tankovania" on public.fuel_entries;
create policy "vlastne tankovania" on public.fuel_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "vlastne nastavenia" on public.user_settings;
create policy "vlastne nastavenia" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
