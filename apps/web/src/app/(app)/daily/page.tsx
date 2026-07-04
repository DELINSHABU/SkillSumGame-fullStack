'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ChallengeTask } from '@skillsum/shared';
import { GameScreen, type GameEndResult } from '@/components/game/GameScreen';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { api, type DailyState } from '@/lib/api';

export default function DailyPage() {
  const [daily, setDaily] = useState<DailyState | null>(null);
  const [activeTask, setActiveTask] = useState<ChallengeTask | null>(null);
  const [saving, setSaving] = useState(false);
  const [claimed, setClaimed] = useState<number | null>(null);

  const reload = useCallback(() => api.daily.get().then(setDaily), []);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (!daily) return <LoadingScreen message="Loading challenges…" />;

  const doneCount = daily.tasks.filter((t) => daily.taskState[t.id]?.completed).length;

  const finishTask = async (task: ChallengeTask, end: GameEndResult) => {
    setSaving(true);
    try {
      await api.sessions.submit({
        mode: 'daily',
        dailyTaskId: task.id,
        practiceConfig: task.practiceConfig,
        attempts: end.attempts,
        durationMs: end.durationMs,
        localHour: new Date().getHours(),
      });
    } finally {
      setActiveTask(null);
      setSaving(false);
      await reload();
    }
  };

  const claim = async () => {
    const res = await api.daily.claim();
    setClaimed(res.xpAwarded);
    await reload();
  };

  if (activeTask?.practiceConfig) {
    const config = activeTask.practiceConfig;
    return (
      <GameScreen
        title={`Daily · ${activeTask.type}`}
        generationParams={{ operators: config.operators, numberRange: config.numberRange, skill: 'random' }}
        timeLimit={config.mode === 'time' ? config.timeLimit : undefined}
        targetCorrect={config.mode === 'count' ? config.targetCount : undefined}
        onEnd={(end) => void finishTask(activeTask, end)}
      />
    );
  }

  if (saving) return <LoadingScreen message="Saving…" />;

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div>
        <h1 className="text-h1">Daily Challenges</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{daily.date} · same challenges for everyone!</p>
      </div>

      {/* Reward banner */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between"
        style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--xp-gold)', boxShadow: 'var(--shadow-md)' }}
      >
        <div>
          <div className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Complete all 3 → {daily.xpReward.toLocaleString()} XP
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{doneCount}/3 done</div>
        </div>
        {daily.xpRewarded || claimed !== null ? (
          <span className="text-2xl">✅</span>
        ) : daily.completedAll ? (
          <PrimaryButton onClick={() => void claim()}>Claim 🎁</PrimaryButton>
        ) : (
          <span className="text-stat" style={{ color: 'var(--xp-gold)' }}>{doneCount}/3</span>
        )}
      </div>

      {claimed !== null && (
        <div className="rounded-2xl p-4 text-center animate-scale-in font-bold" style={{ backgroundColor: 'var(--pink-50)', color: 'var(--pink-500)', fontFamily: 'var(--font-display)' }}>
          +{claimed.toLocaleString()} XP claimed! 🎉
        </div>
      )}

      {daily.tasks.map((task, index) => {
        const state = daily.taskState[task.id];
        const completed = state?.completed ?? false;
        return (
          <div
            key={task.id}
            className="rounded-2xl p-4 animate-fade-up"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: 'var(--shadow-md)',
              animationDelay: `${index * 0.07}s`,
              opacity: completed ? 0.7 : 1,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{completed ? '✅' : ['🥇', '🥈', '🥉'][index]}</span>
                <div>
                  <div className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>{task.description}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {completed
                      ? 'Complete!'
                      : task.type === 'streak'
                        ? `Best so far: ${state?.progress ?? 0}/${task.target} — any mode counts`
                        : `Progress: ${state?.progress ?? 0}/${task.target}`}
                  </div>
                </div>
              </div>
              {!completed && task.practiceConfig && (
                <PrimaryButton onClick={() => setActiveTask(task)}>Go</PrimaryButton>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
