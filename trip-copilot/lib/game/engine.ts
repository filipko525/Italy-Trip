/* =========================================================
   PREŽIJEŠ DOVOLENKU V TALIANSKU? – herná logika
   ---------------------------------------------------------
   Čisté, bezstavové funkcie. Žiadny prístup k React stavu ani
   k localStorage – to rieši hook useItalyGame.
   ========================================================= */

import type { GameQuestion } from '@/data/game-questions';

/** Fisher-Yates shuffle – nemutuje pôvodné pole. */
export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Vyberie `count` otázok bez opakovania v rámci jednej session. */
export function pickSessionQuestions(all: GameQuestion[], count: number): GameQuestion[] {
  return shuffle(all).slice(0, Math.min(count, all.length));
}

/** Vyberie 1 náhodnú otázku pre "Denná talianska otázka" (nesmie byť fun-fact). */
export function pickDailyQuestion(all: GameQuestion[], seed: string): GameQuestion {
  const eligible = all.filter((q) => q.category !== 'fun-fact');
  // Jednoduchý deterministický "náhodný" výber podľa dátumu, nech sa dá zmysluplne otestovať.
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return eligible[hash % eligible.length];
}

export interface ShuffledAnswers {
  answers: string[];
  correctIndex: number;
}

/** Zamieša poradie odpovedí, nech správna odpoveď nie je vždy na rovnakej pozícii. */
export function shuffleAnswers(q: GameQuestion): ShuffledAnswers {
  if (q.answers.length === 0) return { answers: [], correctIndex: -1 };
  const order = shuffle(q.answers.map((_, i) => i));
  return {
    answers: order.map((i) => q.answers[i]),
    correctIndex: order.indexOf(q.correctIndex),
  };
}

export interface Rank {
  emoji: string;
  label: string;
  minXp: number;
}

export const RANKS: Rank[] = [
  { emoji: '🩴', label: 'Turista v ponožkách a sandáloch', minXp: 0 },
  { emoji: '🧳', label: 'Profesionálny dovolenkár', minXp: 50 },
  { emoji: '🍕', label: 'Polovičný Talian', minXp: 100 },
  { emoji: '🤌', label: 'Mamma Mia Master', minXp: 200 },
  { emoji: '🇮🇹', label: 'Kika', minXp: 350 },
];

export function getRank(totalXp: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (totalXp >= r.minXp) current = r;
  }
  return current;
}

/** Dnešný dátum vo formáte YYYY-MM-DD, na porovnávanie "už si dnes hrala Daily". */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
