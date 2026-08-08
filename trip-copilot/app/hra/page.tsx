'use client';

import { useMemo, useState } from 'react';
import { AppHeader } from '@/components/navigation/AppHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { GAME_QUESTIONS, CATEGORY_LABELS, type GameQuestion } from '@/data/game-questions';
import {
  pickSessionQuestions,
  pickDailyQuestion,
  shuffleAnswers,
  getRank,
  todayKey,
  type ShuffledAnswers,
} from '@/lib/game/engine';
import { useItalyGameStats } from '@/hooks/useItalyGame';

const QUICK_GAME_LENGTH = 10;

const WRONG_REACTIONS = [
  'Skoro! Ale skús to ešte raz nabudúce. 😅',
  'Google Translate by ti tu vedel pomôcť.',
  'Aj Filip sa občas pomýli.',
  'Taliani ti to odpustia. Asi.',
  'Nič sa nedeje, veď si na dovolenke.',
  'Sumi sa na túto odpoveď radšej nepozerala.',
];

type Mode = 'quick' | 'endless' | 'daily';
type Screen = 'start' | 'playing' | 'end';

export default function ItalyGamePage() {
  const { stats, recordSession, recordDaily } = useItalyGameStats();

  const [screen, setScreen] = useState<Screen>('start');
  const [mode, setMode] = useState<Mode>('quick');
  const [queue, setQueue] = useState<GameQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongReaction, setWrongReaction] = useState('');
  const [showSumiEasterEgg, setShowSumiEasterEgg] = useState(false);
  const [mamaMode, setMamaMode] = useState(false);

  const currentQuestion = queue[index] ?? null;
  const shuffled: ShuffledAnswers = useMemo(
    () => (currentQuestion ? shuffleAnswers(currentQuestion) : { answers: [], correctIndex: -1 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQuestion?.id],
  );

  const today = todayKey();
  const dailyAvailable = stats.dailyDate !== today;

  function resetSessionState() {
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setSessionXp(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setWrongReaction('');
    setShowSumiEasterEgg(false);
    setMamaMode(false);
  }

  function startQuick() {
    resetSessionState();
    setMode('quick');
    setQueue(pickSessionQuestions(GAME_QUESTIONS, QUICK_GAME_LENGTH));
    setScreen('playing');
  }

  function startEndless() {
    resetSessionState();
    setMode('endless');
    setQueue(pickSessionQuestions(GAME_QUESTIONS, GAME_QUESTIONS.length));
    setScreen('playing');
  }

  function startDaily() {
    resetSessionState();
    setMode('daily');
    setQueue([pickDailyQuestion(GAME_QUESTIONS, today)]);
    setScreen('playing');
  }

  function handleAnswer(i: number) {
    if (answered || !currentQuestion) return;
    setSelected(i);
    setAnswered(true);

    const isCorrect = i === shuffled.correctIndex;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setSessionXp((xp) => xp + currentQuestion.points);
      setCorrectCount((c) => c + 1);
      setShowSumiEasterEgg(Math.random() < 0.04);
      setMamaMode(newStreak === 10);
    } else {
      setStreak(0);
      setWrongReaction(WRONG_REACTIONS[Math.floor(Math.random() * WRONG_REACTIONS.length)]);
    }
  }

  function handleFunFactContinue() {
    if (!currentQuestion) return;
    setSessionXp((xp) => xp + currentQuestion.points);
    goNext();
  }

  function goNext() {
    if (mode === 'daily') {
      recordDaily(today, currentQuestion?.points ?? 20);
      setScreen('end');
      return;
    }

    const nextIndex = index + 1;
    if (nextIndex >= queue.length) {
      if (mode === 'endless') {
        // Nekonečný režim – po vyčerpaní zoznamu zamiešame nový a pokračujeme.
        setQueue(pickSessionQuestions(GAME_QUESTIONS, GAME_QUESTIONS.length));
        setIndex(0);
        setSelected(null);
        setAnswered(false);
        setWrongReaction('');
        setShowSumiEasterEgg(false);
        setMamaMode(false);
        return;
      }
      recordSession(sessionXp, bestStreak);
      setScreen('end');
      return;
    }
    setIndex(nextIndex);
    setSelected(null);
    setAnswered(false);
    setWrongReaction('');
    setShowSumiEasterEgg(false);
    setMamaMode(false);
  }

  function quitEndless() {
    recordSession(sessionXp, bestStreak);
    setScreen('end');
  }

  const rank = getRank(stats.totalXp);

  return (
    <main className="flex-1">
      <AppHeader
        title="🇮🇹 Prežiješ dovolenku?"
        subtitle={
          screen === 'playing'
            ? mode === 'daily'
              ? 'Denná otázka'
              : mode === 'endless'
                ? 'Nekonečný režim'
                : `Otázka ${index + 1} / ${queue.length}`
            : 'Minihra pre chvíle nudy v aute'
        }
      />

      <div className="space-y-4 px-4 py-4">
        {screen === 'start' ? (
          <StartScreen
            stats={stats}
            rank={rank}
            dailyAvailable={dailyAvailable}
            onStartQuick={startQuick}
            onStartEndless={startEndless}
            onStartDaily={startDaily}
          />
        ) : null}

        {screen === 'playing' && currentQuestion ? (
          <PlayingScreen
            question={currentQuestion}
            shuffled={shuffled}
            selected={selected}
            answered={answered}
            sessionXp={sessionXp}
            streak={streak}
            wrongReaction={wrongReaction}
            showSumiEasterEgg={showSumiEasterEgg}
            mamaMode={mamaMode}
            mode={mode}
            onAnswer={handleAnswer}
            onFunFactContinue={handleFunFactContinue}
            onNext={goNext}
            onQuit={mode === 'endless' ? quitEndless : undefined}
          />
        ) : null}

        {screen === 'end' ? (
          <EndScreen
            mode={mode}
            correctCount={correctCount}
            totalQuestions={mode === 'daily' ? 1 : mode === 'quick' ? QUICK_GAME_LENGTH : index + 1}
            sessionXp={sessionXp}
            bestStreak={bestStreak}
            rank={getRank(stats.totalXp)}
            onPlayAgain={mode === 'daily' ? startQuick : mode === 'endless' ? startEndless : startQuick}
            onBackToStart={() => setScreen('start')}
          />
        ) : null}
      </div>
    </main>
  );
}

/* ---------- START SCREEN ---------- */

function StartScreen({
  stats,
  rank,
  dailyAvailable,
  onStartQuick,
  onStartEndless,
  onStartDaily,
}: {
  stats: ReturnType<typeof useItalyGameStats>['stats'];
  rank: ReturnType<typeof getRank>;
  dailyAvailable: boolean;
  onStartQuick: () => void;
  onStartEndless: () => void;
  onStartDaily: () => void;
}) {
  return (
    <>
      <Card className="p-5 text-center">
        <p className="text-5xl">🇮🇹</p>
        <h2 className="font-condensed mt-2 text-2xl font-bold uppercase leading-tight">
          Prežiješ dovolenku v Taliansku?
        </h2>
        <p className="mt-2 text-sm text-muted">
          Otestuj, či si pripravená na pizzu, autostradu a taliansky chaos. 🍕
        </p>

        <Button size="lg" full className="mt-5 bg-signal hover:bg-signal/90" onClick={onStartQuick}>
          ▶ ZAČAŤ HRU
        </Button>
        <Button variant="secondary" full className="mt-2" onClick={onStartEndless}>
          ♾️ Nekonečný režim
        </Button>

        {stats.gamesPlayed > 0 ? (
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-raised/60 p-2">
              <p className="tnum text-lg font-bold">🍕 {stats.highScoreQuick}</p>
              <p className="text-muted">High score</p>
            </div>
            <div className="rounded-2xl bg-raised/60 p-2">
              <p className="tnum text-lg font-bold">🔥 {stats.bestStreak}</p>
              <p className="text-muted">Best streak</p>
            </div>
            <div className="rounded-2xl bg-raised/60 p-2">
              <p className="text-lg font-bold">{rank.emoji}</p>
              <p className="text-muted">{rank.label}</p>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">🇮🇹 Italian Daily</p>
            <p className="mt-0.5 font-semibold">
              {dailyAvailable ? 'Jedna otázka na dnes čaká' : 'Dnešná otázka už splnená ✅'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {dailyAvailable ? '+20 XP, vráť sa zajtra na ďalšiu' : 'Vráť sa zajtra na novú otázku'}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onStartDaily}
            disabled={!dailyAvailable}
          >
            {dailyAvailable ? 'Hrať' : 'Hotovo'}
          </Button>
        </div>
      </Card>

      <p className="px-1 text-xs text-muted">
        🍕 {stats.totalXp} celkových Italy Points · {stats.gamesPlayed} odohraných hier
      </p>
    </>
  );
}

/* ---------- PLAYING SCREEN ---------- */

function PlayingScreen({
  question,
  shuffled,
  selected,
  answered,
  sessionXp,
  streak,
  wrongReaction,
  showSumiEasterEgg,
  mamaMode,
  mode,
  onAnswer,
  onFunFactContinue,
  onNext,
  onQuit,
}: {
  question: GameQuestion;
  shuffled: ShuffledAnswers;
  selected: number | null;
  answered: boolean;
  sessionXp: number;
  streak: number;
  wrongReaction: string;
  showSumiEasterEgg: boolean;
  mamaMode: boolean;
  mode: Mode;
  onAnswer: (i: number) => void;
  onFunFactContinue: () => void;
  onNext: () => void;
  onQuit?: () => void;
}) {
  const isFunFact = question.category === 'fun-fact';
  const isCorrectSelected = answered && selected === shuffled.correctIndex;

  return (
    <>
      <div className="flex items-center justify-between">
        <Tag tone="sea">{CATEGORY_LABELS[question.category]}</Tag>
        <div className="flex items-center gap-2">
          {streak >= 3 ? <Tag tone="signal">🔥 ×{streak}</Tag> : null}
          <Tag>🍕 {sessionXp}</Tag>
        </div>
      </div>

      <Card className="p-5">
        {isFunFact ? (
          <>
            <p className="eyebrow text-sea">💡 VEDELA SI, ŽE...</p>
            <p className="mt-3 text-lg leading-relaxed">{question.explanation}</p>
            <Button full className="mt-5" onClick={onFunFactContinue}>
              {question.reaction}
            </Button>
          </>
        ) : (
          <>
            <p className="text-xl font-semibold leading-snug">{question.question}</p>

            <div className="mt-4 space-y-2">
              {shuffled.answers.map((answer, i) => {
                const isThisCorrect = i === shuffled.correctIndex;
                const isThisSelected = i === selected;
                let tone = 'bg-raised border-line text-ink';
                if (answered && isThisCorrect) tone = 'bg-sea/15 border-sea text-sea';
                else if (answered && isThisSelected && !isThisCorrect) tone = 'bg-danger/15 border-danger text-danger';

                return (
                  <button
                    key={answer}
                    type="button"
                    disabled={answered}
                    onClick={() => onAnswer(i)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-[15px] font-medium transition-colors disabled:cursor-default ${tone}`}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>

            {answered ? (
              <div className="mt-4 space-y-2 rounded-2xl bg-raised/60 p-3">
                <p className={`font-semibold ${isCorrectSelected ? 'text-sea' : 'text-danger'}`}>
                  {isCorrectSelected ? '✅ Správne!' : '❌ Nesprávne.'}
                </p>
                {question.explanation ? (
                  <p className="text-sm text-muted">{question.explanation}</p>
                ) : null}
                <p className="text-sm font-medium">
                  {isCorrectSelected ? question.reaction : wrongReaction}
                </p>
                {isCorrectSelected && showSumiEasterEgg ? (
                  <p className="text-sm text-sea">Sumi secretly approves this answer. 🐱</p>
                ) : null}
                {streak === 7 ? (
                  <p className="text-sm text-signal">
                    🔥 ×7 Kika officially speaks fluent Italian.*
                    <br />
                    <span className="text-xs text-muted">*Zdroj: táto aplikácia.</span>
                  </p>
                ) : null}
                {mamaMode ? (
                  <p className="text-sm font-bold text-signal">🤌 MAMMA MIA MODE ACTIVATED</p>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </Card>

      {answered && !isFunFact ? (
        <Button full onClick={onNext}>
          Ďalšia otázka →
        </Button>
      ) : null}

      {mode === 'endless' && onQuit ? (
        <Button variant="ghost" full onClick={onQuit}>
          Skončiť a uložiť výsledok
        </Button>
      ) : null}
    </>
  );
}

/* ---------- END SCREEN ---------- */

function EndScreen({
  mode,
  correctCount,
  totalQuestions,
  sessionXp,
  bestStreak,
  rank,
  onPlayAgain,
  onBackToStart,
}: {
  mode: Mode;
  correctCount: number;
  totalQuestions: number;
  sessionXp: number;
  bestStreak: number;
  rank: ReturnType<typeof getRank>;
  onPlayAgain: () => void;
  onBackToStart: () => void;
}) {
  const ratio = totalQuestions > 0 ? correctCount / totalQuestions : 0;
  const message =
    mode === 'daily'
      ? 'Denná porcia Talianska splnená. Do zajtra! 🇮🇹'
      : ratio >= 0.7
        ? 'Kika je pripravená. Taliansko možno nie.'
        : ratio >= 0.4
          ? 'Slušný pokus. Google Translate zatiaľ ostáva v zálohe.'
          : 'Google Translate ide s nami. Vlastne aj tak by šiel.';

  return (
    <Card className="p-5 text-center">
      <p className="text-4xl">🇮🇹</p>
      <h2 className="font-condensed mt-2 text-2xl font-bold uppercase">Hotovo!</h2>

      {mode !== 'daily' ? (
        <p className="mt-2 text-lg font-semibold">
          {correctCount} / {totalQuestions} správne
        </p>
      ) : null}

      <p className="tnum mt-3 text-2xl font-bold text-signal">🍕 +{sessionXp} Italy Points</p>

      {mode !== 'daily' ? <p className="mt-1 text-sm text-muted">🔥 Best streak: {bestStreak}</p> : null}

      <div className="mt-4 inline-flex items-center gap-2 rounded-pill bg-raised/60 px-4 py-2">
        <span className="text-xl">{rank.emoji}</span>
        <span className="text-sm font-medium">{rank.label}</span>
      </div>

      <p className="mt-4 text-sm text-muted">{message}</p>

      <Button size="lg" full className="mt-5" onClick={onPlayAgain}>
        Hrať znova
      </Button>
      <Button variant="secondary" full className="mt-2" onClick={onBackToStart}>
        Späť na úvod hry
      </Button>
    </Card>
  );
}
