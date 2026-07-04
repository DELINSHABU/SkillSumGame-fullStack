import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { calculateXP, getLevelById, type QuestionAttempt } from '@skillsum/shared';
import { createApp } from '../app';
import { cookieHeader, json, migrateTestDb, signup, truncateAll } from './helpers';

const app = createApp();

beforeAll(async () => {
  await migrateTestDb();
});

beforeEach(async () => {
  await truncateAll();
});

function makeAttempts(correct: number, wrong: number, responseMs = 2000): QuestionAttempt[] {
  const attempts: QuestionAttempt[] = [];
  for (let i = 0; i < correct; i++) {
    attempts.push({
      question: '2 + 3', correctAnswer: 5, userAnswer: 5, isCorrect: true,
      responseMs, skill: 'random', operator: '+',
    });
  }
  for (let i = 0; i < wrong; i++) {
    attempts.push({
      question: '2 + 3', correctAnswer: 5, userAnswer: 6, isCorrect: false,
      responseMs, skill: 'random', operator: '+',
    });
  }
  return attempts;
}

async function postSession(sid: string, body: object): Promise<Response> {
  return app.request('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cookieHeader(sid) },
    body: JSON.stringify(body),
  });
}

interface SessionResponse {
  recomputed: { correct: number; wrong: number; accuracy: number; maxStreak: number };
  starsEarned?: number;
  xpBreakdown: { total: number };
  newAchievements: string[];
  newPersonalBest: boolean;
  profile: { xp: number; accountLevel: number; dailyStreak: number };
}

describe('POST /api/sessions — learn mode', () => {
  it('saves session, computes stars server-side, upserts mastery', async () => {
    const { sid } = await signup(app);
    const level = getLevelById(1);
    if (!level) throw new Error('level 1 missing');

    // 5 correct = star3Score of level 1 → 3 stars
    const res = await postSession(sid, {
      mode: 'learn', levelId: 1, attempts: makeAttempts(5, 0), durationMs: 15000,
    });
    expect(res.status).toBe(200);
    const body = await json<SessionResponse>(res);
    expect(body.recomputed.correct).toBe(5);
    expect(body.starsEarned).toBe(3);
    expect(body.newAchievements).toContain('first_answer');
    expect(body.newAchievements).toContain('first_level');
    expect(body.profile.dailyStreak).toBe(1);

    const mastery = await json<Array<{ levelId: number; stars: number; attempts: number }>>(
      await app.request('/api/mastery?worldId=1', { headers: cookieHeader(sid) })
    );
    expect(mastery).toHaveLength(1);
    expect(mastery[0]?.stars).toBe(3);
  });

  it('forged client XP is ignored — server computes its own', async () => {
    const { sid } = await signup(app);
    const res = await postSession(sid, {
      mode: 'learn', levelId: 1, attempts: makeAttempts(5, 0), durationMs: 15000,
      xpEarned: 999999, starsEarned: 3, correct: 500, // forged extras
    });
    expect(res.status).toBe(200);
    const body = await json<SessionResponse>(res);
    const expected = calculateXP(
      { correct: 5, wrong: 0, accuracy: 100, maxStreak: 5, durationMs: 15000 },
      { isLevelComplete: true, isBossLevel: false, isPersonalBest: false, dailyStreakDays: 1 }
    );
    expect(body.xpBreakdown.total).toBe(expected.total);
    expect(body.profile.xp).toBe(expected.total);
  });

  it('forged isCorrect flags → 422', async () => {
    const { sid } = await signup(app);
    const forged = makeAttempts(1, 0).map((a) => ({ ...a, userAnswer: 999 })); // wrong answer, isCorrect: true
    const res = await postSession(sid, { mode: 'learn', levelId: 1, attempts: forged, durationMs: 5000 });
    expect(res.status).toBe(422);
  });

  it('impossibly fast session → 422', async () => {
    const { sid } = await signup(app);
    const res = await postSession(sid, {
      mode: 'learn', levelId: 1, attempts: makeAttempts(50, 0), durationMs: 1000,
    });
    expect(res.status).toBe(422);
  });

  it('mastery keeps best across attempts', async () => {
    const { sid } = await signup(app);
    await postSession(sid, { mode: 'learn', levelId: 1, attempts: makeAttempts(5, 0), durationMs: 15000 });
    // Worse second run: 3 correct 2 wrong → 1 star
    await postSession(sid, { mode: 'learn', levelId: 1, attempts: makeAttempts(3, 2), durationMs: 15000 });
    const mastery = await json<Array<{ stars: number; bestScore: number; attempts: number }>>(
      await app.request('/api/mastery?worldId=1', { headers: cookieHeader(sid) })
    );
    expect(mastery[0]?.stars).toBe(3); // kept best
    expect(mastery[0]?.bestScore).toBe(5);
    expect(mastery[0]?.attempts).toBe(2);
  });

  it('unknown level → 400', async () => {
    const { sid } = await signup(app);
    const res = await postSession(sid, { mode: 'learn', attempts: [], durationMs: 0 });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/sessions — practice mode', () => {
  const config = { mode: 'time', timeLimit: 60, operators: ['+'], numberRange: [1, 20] };

  it('first session sets a personal best; beating it flags newPersonalBest', async () => {
    const { sid } = await signup(app);
    const first = await json<SessionResponse>(
      await postSession(sid, { mode: 'practice', practiceConfig: config, attempts: makeAttempts(10, 0), durationMs: 30000 })
    );
    expect(first.newPersonalBest).toBe(true);

    const worse = await json<SessionResponse>(
      await postSession(sid, { mode: 'practice', practiceConfig: config, attempts: makeAttempts(5, 0), durationMs: 30000 })
    );
    expect(worse.newPersonalBest).toBe(false);

    const better = await json<SessionResponse>(
      await postSession(sid, { mode: 'practice', practiceConfig: config, attempts: makeAttempts(15, 0), durationMs: 40000 })
    );
    expect(better.newPersonalBest).toBe(true);

    const pbs = await json<Array<{ configKey: string; score: number }>>(
      await app.request('/api/sessions/personal-bests', { headers: cookieHeader(sid) })
    );
    expect(pbs).toHaveLength(1);
    expect(pbs[0]?.score).toBe(15);
  });
});

describe('daily challenges', () => {
  it('GET /api/daily returns 3 deterministic tasks with empty state', async () => {
    const { sid } = await signup(app);
    const daily = await json<{ tasks: unknown[]; completedAll: boolean; xpRewarded: boolean }>(
      await app.request('/api/daily', { headers: cookieHeader(sid) })
    );
    expect(daily.tasks).toHaveLength(3);
    expect(daily.completedAll).toBe(false);
  });

  it('claim before completion → 400; double claim → 409', async () => {
    const { sid } = await signup(app);
    const early = await app.request('/api/daily/claim', { method: 'POST', headers: cookieHeader(sid) });
    expect(early.status).toBe(400);

    // Complete all 3 tasks.
    const daily = await json<{ tasks: Array<{ id: string; type: string; target: number; practiceConfig?: { targetCount?: number } }> }>(
      await app.request('/api/daily', { headers: cookieHeader(sid) })
    );
    for (const task of daily.tasks) {
      if (task.type === 'streak') continue; // covered by streak in other sessions
      const answers = task.type === 'accuracy' ? Math.max(task.practiceConfig?.targetCount ?? 20, 20) : task.target + 2;
      await postSession(sid, {
        mode: 'daily',
        dailyTaskId: task.id,
        practiceConfig: task.practiceConfig,
        attempts: makeAttempts(answers, 0),
        durationMs: answers * 2000,
      });
    }
    // One long-streak session for the streak task.
    await postSession(sid, { mode: 'practice', practiceConfig: { mode: 'zen', operators: ['+'], numberRange: [1, 10] }, attempts: makeAttempts(20, 0), durationMs: 60000 });

    const state = await json<{ completedAll: boolean }>(await app.request('/api/daily', { headers: cookieHeader(sid) }));
    expect(state.completedAll).toBe(true);

    const claim = await app.request('/api/daily/claim', { method: 'POST', headers: cookieHeader(sid) });
    expect(claim.status).toBe(200);
    const claimBody = await json<{ xpAwarded: number }>(claim);
    expect(claimBody.xpAwarded).toBe(2000);

    const again = await app.request('/api/daily/claim', { method: 'POST', headers: cookieHeader(sid) });
    expect(again.status).toBe(409);
  });
});

describe('achievements route', () => {
  it('lists 50, hides secrets until unlocked', async () => {
    const { sid } = await signup(app);
    const list = await json<Array<{ id: string; name: string; unlockedAt: string | null }>>(
      await app.request('/api/achievements', { headers: cookieHeader(sid) })
    );
    expect(list).toHaveLength(50);
    const owl = list.find((a) => a.id === 'night_owl');
    expect(owl?.name).toBe('???');
    expect(list.every((a) => a.unlockedAt === null)).toBe(true);
  });
});

describe('profile route', () => {
  it('aggregates stats and xp thresholds', async () => {
    const { sid } = await signup(app);
    await postSession(sid, { mode: 'learn', levelId: 1, attempts: makeAttempts(5, 1), durationMs: 20000 });
    const profile = await json<{
      xp: number;
      stats: { totalSessions: number; totalCorrect: number; levelsCompleted: number };
      xpForNextLevel: number;
    }>(await app.request('/api/profile', { headers: cookieHeader(sid) }));
    expect(profile.stats.totalSessions).toBe(1);
    expect(profile.stats.totalCorrect).toBe(5);
    expect(profile.stats.levelsCompleted).toBe(1);
    expect(profile.xp).toBeGreaterThan(0);
    expect(profile.xpForNextLevel).toBe(500);
  });
});
