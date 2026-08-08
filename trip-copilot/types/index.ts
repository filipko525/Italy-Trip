/* =========================================================
   TRIP COPILOT – LIGNANO 2026
   Centrálne typy. Držíme ich na jednom mieste, aby dátové
   súbory (data/) aj výpočty (lib/calculations/) používali
   rovnaký kontrakt.
   ========================================================= */

/** [lng, lat] – poradie ako v GeoJSON a Mapboxe. */
export type LngLat = [number, number];

export type CountryCode = 'SK' | 'AT' | 'IT';

export type RouteDirection = 'tam' | 'spat';

/* ---------- Trasa ---------- */

export interface Waypoint {
  id: string;
  name: string;
  country: CountryCode;
  coords: LngLat;
  /** Kumulatívna vzdialenosť od začiatku segmentu (km, približná). */
  kmFromStart: number;
  note?: string;
  isBorderCrossing?: boolean;
}

export interface RouteSegment {
  id: string;
  name: string;
  direction: RouteDirection;
  order: number;
  from: string;
  to: string;
  distanceKm: number;
  drivingMinutes: number;
  waypoints: Waypoint[];
  /** Zjednodušená geometria trasy (approx). Označené ako predbežné dáta. */
  geometry: LngLat[];
  description?: string;
}

export interface Route {
  id: string;
  name: string;
  direction: RouteDirection;
  distanceKm: number;
  drivingMinutes: number;
  segments: RouteSegment[];
  /** Spojená geometria všetkých segmentov. */
  geometry: LngLat[];
}

/* ---------- Body záujmu ---------- */

export type PoiCategory =
  | 'pumpa'
  | 'wc'
  | 'odpocivadlo'
  | 'jedlo'
  | 'kava'
  | 'vyhliadka'
  | 'prechadzka'
  | 'zaujimave'
  | 'nakup'
  | 'veterina'
  | 'pet'
  | 'pokoj'
  | 'noclah';

export interface PointOfInterest {
  id: string;
  name: string;
  category: PoiCategory;
  region: string;
  country: CountryCode;
  coords: LngLat;
  /** Odhad zachádzky z hlavnej trasy v minútach (jeden smer + návrat). */
  detourMinutes: number;
  /** Odporúčaná dĺžka zastávky v minútach. */
  stopMinutes: number;
  catFriendly: boolean;
  parking: boolean;
  shade?: boolean;
  quiet?: boolean;
  openingHours?: string;
  note?: string;
  /** TRUE = testovacie dáta, miesto nie je overené. */
  isMockData: boolean;
  /** Pre ktorý smer bod platí. Bez hodnoty = platí pre oba (cesta tam aj späť). */
  directions?: RouteDirection[];
}

/** POI obohatené o výpočty voči aktuálnej polohe. */
export interface PoiWithGeoContext extends PointOfInterest {
  distanceToUserKm: number;
  distanceFromRouteKm: number;
  routeProgressKm: number;
  isAhead: boolean;
  etaMinutes: number;
  estimatedDetourMinutes: number;
}

/* ---------- Plán a checklisty ---------- */

export type PlanItemKind =
  | 'odchod'
  | 'jazda'
  | 'prichod'
  | 'checkin'
  | 'pobyt'
  | 'checkout'
  | 'nocl'
  | 'domov';

export interface PlanItem {
  id: string;
  date: string; // ISO dátum
  time?: string; // HH:MM
  title: string;
  detail?: string;
  kind: PlanItemKind;
  tentative?: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  note?: string;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
}

/* ---------- Ubytovanie ---------- */

export interface Accommodation {
  id: string;
  name: string;
  address: string;
  coords?: LngLat;
  checkIn: string;
  checkOut: string;
  reservationNumber?: string;
  phone?: string;
  email?: string;
  parking?: string;
  petPolicy?: string;
  petFee?: string;
  bookingUrl?: string;
  budgetEur?: number;
  status: 'potvrdene' | 'nevybrane' | 'overit';
  notes?: string;
}

/* ---------- Poplatky ---------- */

export interface TollItem {
  id: string;
  country: CountryCode;
  name: string;
  type: 'znamka' | 'myto' | 'tunel';
  description: string;
  validFrom?: string;
  validTo?: string;
  priceEur?: number;
  purchased: boolean;
  note?: string;
}

/* ---------- Náklady ---------- */

export type ExpenseCategory =
  | 'benzin'
  | 'znamky'
  | 'myto'
  | 'parkovanie'
  | 'ubytovanie'
  | 'jedlo'
  | 'nakupy'
  | 'sumi'
  | 'vylet'
  | 'ostatne';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  currency: string;
  country: CountryCode;
  note?: string;
  createdAt: string;
}

/* ---------- Tankovanie ---------- */

export type TankLevel = 'plna' | 'tri-stvrtiny' | 'polovica' | 'stvrtina' | 'rezerva';

export interface FuelEntry {
  id: string;
  date: string;
  place: string;
  country: CountryCode;
  odometerKm: number;
  liters: number;
  pricePerLiter: number;
  totalPrice: number;
  fullTank: boolean;
  note?: string;
  createdAt: string;
}

export interface FuelStats {
  totalLiters: number;
  totalPrice: number;
  averagePricePerLiter: number;
  averageConsumption: number | null;
  lastConsumption: number | null;
  estimatedRangeKm: number | null;
}

/* ---------- Prestávky a cestovný režim ---------- */

export type BreakType = 'wc' | 'jedlo' | 'tankovanie' | 'sumi' | 'oddych' | 'zaujimave';

export interface BreakEntry {
  id: string;
  startedAt: string;
  endedAt?: string;
  place: string;
  type: BreakType;
  note?: string;
}

export type TravelStatus =
  | 'jazda'
  | 'prestavka'
  | 'tankovanie'
  | 'jedlo'
  | 'ubytovanie'
  | 'ciel';

export interface TravelState {
  active: boolean;
  startedAt?: string;
  status: TravelStatus;
  drivingSinceAt?: string;
}

/* ---------- Sumi ---------- */

export interface PetProfile {
  id: string;
  name: string;
  species: string;
  chipNumber?: string;
  passportNumber?: string;
  rabiesValidUntil?: string;
  vetPhone?: string;
  notes?: string;
}

export interface PetLog {
  lastBreakAt?: string;
  lastWaterAt?: string;
  lastFoodAt?: string;
  lastCheckAt?: string;
  notes: string;
}

/* ---------- Dokumenty ---------- */

export interface TripDocument {
  id: string;
  name: string;
  category: string;
  validUntil?: string;
  note?: string;
  link?: string;
}

export interface DocumentStatus {
  ready: boolean;
  validUntil?: string;
  note?: string;
}

/* ---------- Poistenie ---------- */

/** Jeden nahraný doklad (fotka alebo PDF), uložený len lokálne ako base64. */
export interface InsuranceDocument {
  id: string;
  name: string;
  dataUrl: string;
  isPdf: boolean;
}

/** Všetko ručne dopĺňané používateľom priamo v appke (lokálne úložisko, nikdy v kóde). */
export interface InsuranceProfile {
  insurer?: string;
  policyNumber?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehicleVin?: string;
  validUntil?: string;
  coverageNote?: string;
  assistancePhone?: string;
  emergencyNote?: string;
  /** Nahraté doklady (fotky, PDF) – zmluva, PZP, prílohy a pod. */
  documents?: InsuranceDocument[];
}

/* ---------- Stav aplikácie (lokálne úložisko) ---------- */

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  budgetEur: number;
  /** Testovacia poloha: posun po trase v km. Slúži na vývoj bez reálnej GPS. */
  useMockLocation: boolean;
  mockProgressKm: number;
  direction: RouteDirection;
  odometerStartKm: number;
}

export interface AppState {
  version: number;
  settings: AppSettings;
  expenses: Expense[];
  fuelEntries: FuelEntry[];
  breaks: BreakEntry[];
  checkedItems: Record<string, boolean>;
  documents: Record<string, DocumentStatus>;
  tolls: Record<string, { purchased: boolean; priceEur?: number; note?: string }>;
  savedPoiIds: string[];
  visitedPoiIds: string[];
  /** ID zaujímavostí (Factoid), ktoré appka už počas jazdy ukázala. */
  shownFactoidIds: string[];
  petLog: PetLog;
  travel: TravelState;
  accommodationNotes: Record<string, string>;
  /** Ručné úpravy dátumu/času položiek plánu – kľúč je PlanItem.id. */
  planOverrides: Record<string, { date?: string; time?: string }>;
  /** Ručne doplnené údaje o Sumi (číslo čipu, pasu...) a jej fotka (base64). */
  petProfileOverrides: {
    chipNumber?: string;
    passportNumber?: string;
    rabiesValidUntil?: string;
    vetPhone?: string;
    photoDataUrl?: string;
  };
  /** Ručne doplnené údaje o poistení (zmluva, vozidlo, asistencia) a fotka dokladu. */
  insuranceOverrides: InsuranceProfile;
  /** Ručné úpravy ubytovania (najmä ešte nevybraný nocľah v Rakúsku) – kľúč je Accommodation.id. */
  accommodationOverrides: Record<
    string,
    Partial<Pick<Accommodation, 'name' | 'address' | 'checkIn' | 'notes' | 'status' | 'phone'>>
  >;
}
