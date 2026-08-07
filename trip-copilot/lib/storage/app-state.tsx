'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppState,
  BreakEntry,
  DocumentStatus,
  Expense,
  FuelEntry,
  PetLog,
  TravelState,
} from '@/types';
import { BUDGET } from '@/data/trip';

/* =========================================================
   STAV APLIKÁCIE
   ---------------------------------------------------------
   Etapa 1 beží kompletne na lokálnom úložisku prehliadača.
   Supabase je pripravené (lib/supabase + SQL migrácia), ale
   nie je potrebné na to, aby aplikácia fungovala.
   Vďaka tomu funguje appka aj offline v aute.
   ========================================================= */

const STORAGE_KEY = 'trip-copilot:lignano-2026';
const STATE_VERSION = 1;

export const INITIAL_STATE: AppState = {
  version: STATE_VERSION,
  settings: {
    theme: 'system',
    budgetEur: BUDGET.totalEur,
    useMockLocation: true,
    mockProgressKm: 0,
    direction: 'tam',
    odometerStartKm: 0,
  },
  expenses: [],
  fuelEntries: [],
  breaks: [],
  checkedItems: {},
  documents: {},
  tolls: {},
  savedPoiIds: [],
  visitedPoiIds: [],
  petLog: { notes: '' },
  travel: { active: false, status: 'jazda' },
  accommodationNotes: {},
  planOverrides: {},
  petProfileOverrides: {},
  insuranceOverrides: {},
  accommodationOverrides: {},
};

interface AppStateContextValue {
  state: AppState;
  ready: boolean;
  update: (updater: (prev: AppState) => AppState) => void;
  reset: () => void;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  removeExpense: (id: string) => void;
  addFuelEntry: (entry: Omit<FuelEntry, 'id' | 'createdAt'>) => void;
  removeFuelEntry: (id: string) => void;
  startBreak: (entry: Omit<BreakEntry, 'id' | 'startedAt'>) => void;
  endBreak: (id: string) => void;
  removeBreak: (id: string) => void;
  toggleChecklistItem: (id: string) => void;
  setDocumentStatus: (id: string, status: Partial<DocumentStatus>) => void;
  toggleToll: (id: string, purchased: boolean) => void;
  setTollDetail: (id: string, detail: { priceEur?: number; note?: string }) => void;
  toggleSavedPoi: (id: string) => void;
  toggleVisitedPoi: (id: string) => void;
  updatePetLog: (patch: Partial<PetLog>) => void;
  setTravel: (patch: Partial<TravelState>) => void;
  setSettings: (patch: Partial<AppState['settings']>) => void;
  setPlanOverride: (id: string, patch: { date?: string; time?: string }) => void;
  clearPlanOverride: (id: string) => void;
  setPetProfile: (patch: Partial<AppState['petProfileOverrides']>) => void;
  setInsurance: (patch: Partial<AppState['insuranceOverrides']>) => void;
  setAccommodation: (id: string, patch: AppState['accommodationOverrides'][string]) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

function loadState(): AppState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== STATE_VERSION) return INITIAL_STATE;
    return {
      ...INITIAL_STATE,
      ...parsed,
      settings: { ...INITIAL_STATE.settings, ...parsed.settings },
      petLog: { ...INITIAL_STATE.petLog, ...parsed.petLog },
      travel: { ...INITIAL_STATE.travel, ...parsed.travel },
      planOverrides: { ...INITIAL_STATE.planOverrides, ...parsed.planOverrides },
      petProfileOverrides: { ...INITIAL_STATE.petProfileOverrides, ...parsed.petProfileOverrides },
      insuranceOverrides: { ...INITIAL_STATE.insuranceOverrides, ...parsed.insuranceOverrides },
      accommodationOverrides: {
        ...INITIAL_STATE.accommodationOverrides,
        ...parsed.accommodationOverrides,
      },
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Súkromný režim alebo plné úložisko – appka beží ďalej, len sa nič neuloží. */
    }
  }, [state, ready]);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev));
  }, []);

  const value = useMemo<AppStateContextValue>(() => {
    return {
      state,
      ready,
      update,
      reset: () => setState(INITIAL_STATE),

      addExpense: (expense) =>
        update((prev) => ({
          ...prev,
          expenses: [
            { ...expense, id: uid(), createdAt: new Date().toISOString() },
            ...prev.expenses,
          ],
        })),

      removeExpense: (id) =>
        update((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) })),

      addFuelEntry: (entry) =>
        update((prev) => ({
          ...prev,
          fuelEntries: [
            { ...entry, id: uid(), createdAt: new Date().toISOString() },
            ...prev.fuelEntries,
          ],
          expenses: [
            {
              id: uid(),
              createdAt: new Date().toISOString(),
              date: entry.date,
              category: 'benzin',
              title: `Tankovanie – ${entry.place}`,
              amount: entry.totalPrice,
              currency: 'EUR',
              country: entry.country,
              note: `${entry.liters.toFixed(2)} l`,
            },
            ...prev.expenses,
          ],
        })),

      removeFuelEntry: (id) =>
        update((prev) => ({ ...prev, fuelEntries: prev.fuelEntries.filter((e) => e.id !== id) })),

      startBreak: (entry) =>
        update((prev) => ({
          ...prev,
          breaks: [{ ...entry, id: uid(), startedAt: new Date().toISOString() }, ...prev.breaks],
          travel: { ...prev.travel, status: 'prestavka' },
        })),

      endBreak: (id) =>
        update((prev) => ({
          ...prev,
          breaks: prev.breaks.map((b) =>
            b.id === id && !b.endedAt ? { ...b, endedAt: new Date().toISOString() } : b,
          ),
          travel: { ...prev.travel, status: 'jazda', drivingSinceAt: new Date().toISOString() },
        })),

      removeBreak: (id) =>
        update((prev) => ({ ...prev, breaks: prev.breaks.filter((b) => b.id !== id) })),

      toggleChecklistItem: (id) =>
        update((prev) => ({
          ...prev,
          checkedItems: { ...prev.checkedItems, [id]: !prev.checkedItems[id] },
        })),

      setDocumentStatus: (id, status) =>
        update((prev) => ({
          ...prev,
          documents: {
            ...prev.documents,
            [id]: { ...(prev.documents[id] ?? { ready: false }), ...status },
          },
        })),

      toggleToll: (id, purchased) =>
        update((prev) => ({
          ...prev,
          tolls: { ...prev.tolls, [id]: { ...prev.tolls[id], purchased } },
        })),

      setTollDetail: (id, detail) =>
        update((prev) => ({
          ...prev,
          tolls: {
            ...prev.tolls,
            [id]: { ...(prev.tolls[id] ?? { purchased: false }), ...detail },
          },
        })),

      toggleSavedPoi: (id) =>
        update((prev) => ({
          ...prev,
          savedPoiIds: prev.savedPoiIds.includes(id)
            ? prev.savedPoiIds.filter((x) => x !== id)
            : [...prev.savedPoiIds, id],
        })),

      toggleVisitedPoi: (id) =>
        update((prev) => ({
          ...prev,
          visitedPoiIds: prev.visitedPoiIds.includes(id)
            ? prev.visitedPoiIds.filter((x) => x !== id)
            : [...prev.visitedPoiIds, id],
        })),

      updatePetLog: (patch) =>
        update((prev) => ({ ...prev, petLog: { ...prev.petLog, ...patch } })),

      setTravel: (patch) => update((prev) => ({ ...prev, travel: { ...prev.travel, ...patch } })),

      setSettings: (patch) =>
        update((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } })),

      setPlanOverride: (id, patch) =>
        update((prev) => ({
          ...prev,
          planOverrides: {
            ...prev.planOverrides,
            [id]: { ...prev.planOverrides[id], ...patch },
          },
        })),

      clearPlanOverride: (id) =>
        update((prev) => {
          const next = { ...prev.planOverrides };
          delete next[id];
          return { ...prev, planOverrides: next };
        }),

      setPetProfile: (patch) =>
        update((prev) => ({
          ...prev,
          petProfileOverrides: { ...prev.petProfileOverrides, ...patch },
        })),

      setInsurance: (patch) =>
        update((prev) => ({
          ...prev,
          insuranceOverrides: { ...prev.insuranceOverrides, ...patch },
        })),

      setAccommodation: (id, patch) =>
        update((prev) => ({
          ...prev,
          accommodationOverrides: {
            ...prev.accommodationOverrides,
            [id]: { ...prev.accommodationOverrides[id], ...patch },
          },
        })),
    };
  }, [state, ready, update]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState musí byť použité vnútri AppStateProvider.');
  return ctx;
}
