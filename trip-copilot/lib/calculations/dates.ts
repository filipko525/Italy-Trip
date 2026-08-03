const SK_MONTHS = [
  'januára', 'februára', 'marca', 'apríla', 'mája', 'júna',
  'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra',
];

const SK_DAYS = ['nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota'];

export function formatDateSk(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()}. ${SK_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDateSk(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getDate()}. ${d.getMonth() + 1}.`;
}

export function weekdaySk(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return SK_DAYS[d.getDay()];
}

/** Počet dní do dátumu. Záporné číslo = dátum je v minulosti. */
export function daysUntil(iso: string, from = new Date()): number {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  return Math.round((target - start) / 86_400_000);
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
}

/** Trvanie medzi dvomi ISO časmi v minútach. */
export function minutesBetween(startIso: string, endIso?: string): number {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  return Math.max(0, Math.round((end - start) / 60_000));
}

export function timeAgoSk(iso?: string): string {
  if (!iso) return 'zatiaľ nezapísané';
  const mins = minutesBetween(iso);
  if (mins < 1) return 'práve teraz';
  if (mins < 60) return `pred ${mins} min`;
  const h = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `pred ${h} h` : `pred ${h} h ${rest} min`;
}
