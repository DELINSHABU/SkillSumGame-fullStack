'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLevelById } from '@skillsum/shared';
import { GameScreen, type GameEndResult } from '@/components/game/GameScreen';
import { PostLesson } from '@/components/learn/PostLesson';
import { PreLesson } from '@/components/learn/PreLesson';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { api, type MasteryRow, type SessionSaveResult } from '@/lib/api';

type Phase = 'pre' | 'playing' | 'saving' | 'post';

export default function PlayLevelPage() {
  const params = useParams<{ levelId: string }>();
  const level = getLevelById(Number(params.levelId));

  const [phase, setPhase] = useState<Phase>('pre');
  const [mastery, setMastery] = useState<MasteryRow | undefined>();
  const [result, setResult] = useState<SessionSaveResult | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [pendingEnd, setPendingEnd] = useState<GameEndResult | null>(null);

  useEffect(() => {
    if (!level) return;
    void api.mastery
      .list(level.worldId)
      .then((rows) => setMastery(rows.find((m) => m.levelId === level.id)));
  }, [level]);

  if (!level) {
    return (
      <div className="text-center py-24">
        <p className="text-h2">Level not found</p>
        <Link href="/learn" className="font-bold" style={{ color: 'var(--pink-400)' }}>← Back to worlds</Link>
      </div>
    );
  }

  const save = async (end: GameEndResult) => {
    setPhase('saving');
    setPendingEnd(end);
    setSaveError(false);
    try {
      const saved = await api.sessions.submit({
        mode: 'learn',
        levelId: level.id,
        attempts: end.attempts,
        durationMs: end.durationMs,
        localHour: new Date().getHours(),
      });
      setResult(saved);
      setPhase('post');
    } catch {
      setSaveError(true);
    }
  };

  if (phase === 'pre') {
    return <PreLesson level={level} canSkip={(mastery?.attempts ?? 0) > 0} onReady={() => setPhase('playing')} />;
  }

  if (phase === 'playing') {
    return (
      <GameScreen
        title={level.title}
        generationParams={level.generationParams}
        timeLimit={level.timeLimit}
        targetCorrect={level.timeLimit === undefined ? level.targetScore : undefined}
        starThresholds={{ star1: level.star1Score, star2: level.star2Score, star3: level.star3Score }}
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

  if (phase === 'post' && result) {
    return (
      <PostLesson
        level={level}
        result={result}
        onRetry={() => {
          setResult(null);
          setPhase('playing');
        }}
      />
    );
  }

  return <LoadingScreen />;
}
