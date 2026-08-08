'use client';

import { useCallback, useEffect, useState } from 'react';

/* =========================================================
   Perzistencia štatistík minihry "Prežiješ dovolenku v Taliansku?"
   ---------------------------------------------------------
   Zámerne vlastný, samostatný localStorage kľúč – nezávislý od
   hlavného app-state.tsx. Minihra je samostatná funkcia, takže
   takto sa nedotýka existujúcej appky ani jej verzie stavu.
   ========================================================= */

const STORAGE_KEY = 'trip-copilot:italy-game';

export interface ItalyGameStats {
  totalXp: number;
  highScoreQuick: number;
  bestStreak: number;
  gamesPlayed: number;
  /** YYYY-MM-DD dátum poslednej odohratej Dennej otázky. */
  dailyDate: string | null;
  dailyDone: boolean;
}

const INITIAL_STATS: ItalyGameStats = {
  totalXp: 0,
  highScoreQuick: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  dailyDate: null,
  dailyDone: false,
};

function loadStats(): ItalyGameStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STATS, ...parsed };
  } catch {
    return INITIAL_STATS;
  }
}

export function useItalyGameStats() {
  const [stats, setStats] = useState<ItalyGameStats>(INITIAL_STATS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStats(loadStats());
    setReady(true);
  }, []);

  const persist = useCallback((next: ItalyGameStats) => {
    setStats(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage plné/nedostupné – hra funguje ďalej, len sa neuloží.
    }
  }, []);

  /** Zapíše výsledok jednej odohratej session (Quick/Endless) do trvalých štatistík. */
  const recordSession = useCallback(
    (sessionXp: number, sessionBestStreak: number) => {
      setStats((prev) => {
        const next: ItalyGameStats = {
          ...prev,
          totalXp: prev.totalXp + sessionXp,
          highScoreQuick: Math.max(prev.highScoreQuick, sessionXp),
          bestStreak: Math.max(prev.bestStreak, sessionBestStreak),
          gamesPlayed: prev.gamesPlayed + 1,
        };
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignorované
        }
        return next;
      });
    },
    [],
  );

  /** Označí dnešnú Dennú otázku ako splnenú a pripočíta jej bonus XP. */
  const recordDaily = useCallback((dateKey: string, bonusXp: number) => {
    setStats((prev) => {
      const next: ItalyGameStats = {
        ...prev,
        totalXp: prev.totalXp + bonusXp,
        dailyDate: dateKey,
        dailyDone: true,
      };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignorované
      }
      return next;
    });
  }, []);

  return { stats, ready, persist, recordSession, recordDaily };
}
