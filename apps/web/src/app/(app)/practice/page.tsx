'use client';

import { useEffect, useState } from 'react';
import { configKey, type PracticeConfig, type QuestionAttempt } from '@skillsum/shared';
import { GameScreen, type GameEndResult } from '@/components/game/GameScreen';
import { PracticeConfigurator } from '@/components/practice/PracticeConfigurator';
import { PracticeResults } from '@/components/practice/PracticeResults';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { api, type PersonalBestRow, type SessionSaveResult } from '@/lib/api';

type Phase = 'configure' | 'playing' | 'saving' | 'results';

const DEFAULT_CONFIG: PracticeConfig = {
  mode: 'time',
  timeLimit: 60,
  operators: ['+'],
  numberRange: [1, 15],
};

export default function PracticePage() {
  const [phase, setPhase] = useState<Phase>('configure');
  const [config, setConfig] = useState<PracticeConfig>(DEFAULT_CONFIG);
  const [personalBests, setPersonalBests] = useState<PersonalBestRow[]>([]);
  const [result, setResult] = useState<SessionSaveResult | null>(null);
  const [lastAttempts, setLastAttempts] = useState<QuestionAttempt[]>([]);
  const [lastDuration, setLastDuration] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const [pendingEnd, setPendingEnd] = useState<GameEndResult | null>(null);

  useEffect(() => {
    void api.sessions.personalBests().then(setPersonalBests);
  }, []);

  const currentPb = personalBests.find((pb) => pb.configKey === configKey(config))?.score ?? null;

  const save = async (end: GameEndResult) => {
    setPhase('saving');
    setPendingEnd(end);
    setSaveError(false);
    try {
      const saved = await api.sessions.submit({
        mode: 'practice',
        practiceConfig: config,
        attempts: end.attempts,
        durationMs: end.durationMs,
        localHour: new Date().getHours(),
      });
      setResult(saved);
      setLastAttempts(end.attempts);
      setLastDuration(end.durationMs);
      setPhase('results');
      void api.sessions.personalBests().then(setPersonalBests);
    } catch {
      setSaveError(true);
    }
  };

  if (phase === 'configure') {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-h1">Practice</h1>
        <PracticeConfigurator
          config={config}
          onChange={setConfig}
          personalBest={currentPb}
          onStart={() => setPhase('playing')}
        />
      </div>
    );
  }

  if (phase === 'playing') {
    return (
      <GameScreen
        title={`Practice · ${config.operators.join(' ')}`}
        generationParams={{ operators: config.operators, numberRange: config.numberRange, skill: 'random' }}
        timeLimit={config.mode === 'time' ? config.timeLimit : undefined}
        targetCorrect={config.mode === 'count' ? config.targetCount : undefined}
        showEndButton={config.mode === 'zen'}
        onEnd={(end) => void save(end)}
      />
    );
  }

  if (phase === 'saving') {
    if (saveError && pendingEnd) {
      return (
        <div className="text-center py-24 flex flex-col gap-4 items-center">
          <p className="text-h2">Could not save your session 😔</p>
          <button
            type="button"
            className="min-h-[48px] rounded-xl px-8 font-bold active:translate-y-1"
            style={{ backgroundColor: 'var(--pink-300)', color: 'var(--text-on-pink)', boxShadow: 'var(--shadow-btn-primary)', fontFamily: 'var(--font-display)' }}
            onClick={() => void save(pendingEnd)}
          >
            Try again
          </button>
        </div>
      );
    }
    return <LoadingScreen message="Saving your results…" />;
  }

  if (phase === 'results' && result) {
    return (
      <PracticeResults
        result={result}
        attempts={lastAttempts}
        durationMs={lastDuration}
        onRetry={() => setPhase('playing')}
        onReconfigure={() => setPhase('configure')}
      />
    );
  }

  return <LoadingScreen />;
}
