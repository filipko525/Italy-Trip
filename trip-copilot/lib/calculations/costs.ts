import type { CountryCode, Expense, ExpenseCategory } from '@/types';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  benzin: 'Benzín',
  znamky: 'Diaľničné známky',
  myto: 'Mýto',
  parkovanie: 'Parkovanie',
  ubytovanie: 'Ubytovanie',
  jedlo: 'Jedlo',
  nakupy: 'Nákupy',
  sumi: 'Sumi',
  vylet: 'Výlet',
  ostatne: 'Ostatné',
};

export const EXPENSE_CATEGORIES = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function byCategory(expenses: Expense[]): { category: ExpenseCategory; total: number }[] {
  const map = new Map<ExpenseCategory, number>();
  expenses.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function byCountry(expenses: Expense[]): { country: CountryCode; total: number }[] {
  const map = new Map<CountryCode, number>();
  expenses.forEach((e) => map.set(e.country, (map.get(e.country) ?? 0) + e.amount));
  return [...map.entries()].map(([country, total]) => ({ country, total }));
}

export function todaysExpenses(expenses: Expense[], today = new Date()): Expense[] {
  const iso = today.toISOString().slice(0, 10);
  return expenses.filter((e) => e.date === iso);
}

export function formatEur(amount: number): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat('sk-SK', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
