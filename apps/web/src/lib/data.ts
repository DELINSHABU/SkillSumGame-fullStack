'use client';

// Offline-first data layer between pages and api.ts. Reads try the network
// and fall back to IndexedDB; session submits compute an optimistic result
// with the same @skillsum/shared math the server runs, persist locally, and
// queue for sync when the network is away. All HTTP still originates in
// api.ts (frontend-feature rule 1); the server stays the trust authority —
// its response always overwrites the optimistic one.

import {
  ACHIEVEMENTS_LIST,
  DAILY_XP_REWARD,
  calculateXP,
  checkAchievements,
  generateDailyChallenge,
  getAccountLevel,
  getLevelXPThreshold,
  getLevelById,
  getLevelsByWorld,
  getStarsFromScore,
  getTodayDate,
  isBossLevel,
  recomputeSession,
  configKey,
  type PracticeConfig,
  type StarCount,
} from '@skillsum/shared';
import {
  api,
  ApiError,
  type AchievementRow,
  type DailyState,
  type FullProfile,
  type GameSessionRow,
  type MasteryRow,
  type Me,
  type PersonalBestRow,
  type SessionSaveResult,
  type SessionSubmit,
} from './api';
import {
  addPendingSession,
  mergeMastery,
  readLocalMe,
  readMastery,
  readMeta,
  readSnapshot,
  writeLocalMe,
  writeMeta,
  writeSnapshot,
  type LocalCounters,
} from './localStore';

export function isGuest(): boolean {
  return typeof document !== 'undefined' && document.cookie.includes('skillsum-guest=');
}

/** Network-level failure (offline, DNS, aborted) — the server never answered. */
function isNetworkError(err: unknown): boolean {
  return !(err instanceof ApiError);
}

// ---------- reads: network first, IndexedDB fallback ----------

async function snapshotting<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    const fresh = await fetcher();
    await writeSnapshot(key, fresh);
    return fresh;
  } catch (err) {
    const cached = await readSnapshot<T>(key);
    if (cached !== undefined) return cached;
    throw err;
  }
}

export async function me(): Promise<Me> {
  if (isGuest()) {
    const local = await readLocalMe();
    if (local) return local;
  }
  try {
    const fresh = await api.auth.me();
    await writeLocalMe(fresh);
    return fresh;
  } catch (err) {
    const local = await readLocalMe();
    if (local) return local;
    throw err;
  }
}

export async function profileGet(): Promise<FullProfile> {
  if (isGuest()) return guestProfile();
  try {
    const fresh = await api.profile.get();
    await writeSnapshot('profile', fresh);
    await writeLocalMe(fresh);
    await writeMeta('counters', {
      totalCorrect: fresh.stats.totalCorrect,
      sessionCount: fresh.stats.totalSessions,
    } satisfies LocalCounters);
    return fresh;
  } catch (err) {
    const cached = await readSnapshot<FullProfile>('profile');
    if (cached) return cached;
    return guestProfile(err);
  }
}

/** Build a FullProfile from the local Me snapshot (guest, or offline pre-cache). */
async function guestProfile(rethrow?: unknown): Promise<FullProfile> {
  const local = await readLocalMe();
  if (!local) {
    if (rethrow !== undefined) throw rethrow;
    throw new ApiError(401, 'No local profile');
  }
  const counters = (await readMeta<LocalCounters>('counters')) ?? { totalCorrect: 0, sessionCount: 0 };
  const mastery = await readMastery();
  return {
    ...local,
    xpForCurrentLevel: getLevelXPThreshold(local.accountLevel),
    xpForNextLevel: getLevelXPThreshold(local.accountLevel + 1),
    stats: {
      totalSessions: counters.sessionCount,
      totalCorrect: counters.totalCorrect,
      totalWrong: 0,
      totalTimeMs: 0,
      bestStreak: 0,
      levelsCompleted: mastery.filter((m) => m.stars > 0).length,
      totalStars: mastery.reduce((sum, m) => sum + m.stars, 0),
    },
  };
}

export async function masteryList(worldId?: number): Promise<MasteryRow[]> {
  if (!isGuest()) {
    try {
      const fresh = await api.mastery.list(worldId);
      await mergeMastery(fresh);
    } catch (err) {
      if (!isNetworkError(err)) throw err;
      // Offline — serve local bests below.
    }
  }
  // Local rows already include server data (merged above when online) plus
  // any unsynced offline sessions, so local is always the most complete view.
  return readMastery(worldId);
}

export async function achievementsList(): Promise<AchievementRow[]> {
  try {
    if (isGuest()) throw new ApiError(401, 'guest');
    const fresh = await api.achievements.list();
    await writeSnapshot('achievements', fresh);
    return fresh;
  } catch {
    const cached = await readSnapshot<AchievementRow[]>('achievements');
    const localUnlocked = (await readMeta<Record<string, string>>('localUnlocked')) ?? {};
    const base = cached ?? ACHIEVEMENTS_LIST.map((a) => ({ ...a, unlockedAt: null }));
    return base.map((row) =>
      row.unlockedAt ? row : { ...row, unlockedAt: localUnlocked[row.id] ?? null }
    );
  }
}

export async function sessionsHistory(opts?: { mode?: string; limit?: number }): Promise<GameSessionRow[]> {
  if (isGuest()) return [];
  try {
    return await snapshotting(`sessions-history:${opts?.mode ?? ''}:${opts?.limit ?? ''}`, () =>
      api.sessions.history(opts)
    );
  } catch (err) {
    if (isNetworkError(err)) return [];
    throw err;
  }
}

export async function personalBests(): Promise<PersonalBestRow[]> {
  if (isGuest()) return readSnapshot<PersonalBestRow[]>('personal-bests').then((c) => c ?? []);
  try {
    return await snapshotting('personal-bests', () => api.sessions.personalBests());
  } catch (err) {
    if (isNetworkError(err)) return [];
    throw err;
  }
}

export async function dailyGet(): Promise<DailyState> {
  try {
    if (isGuest()) throw new ApiError(401, 'guest');
    return await snapshotting('daily', () => api.daily.get());
  } catch (err) {
    if (!isNetworkError(err) && !isGuest()) throw err;
    // Same date seed the server uses, so the offline challenge is identical.
    // Task progress/claim stay server-authoritative and apply after sync.
    const today = getTodayDate();
    const cached = await readSnapshot<DailyState>('daily');
    if (cached?.date === today) return cached;
    const challenge = generateDailyChallenge(today);
    return {
      id: `local-${today}`,
      date: today,
      tasks: challenge.tasks,
      xpReward: DAILY_XP_REWARD,
      taskState: {},
      completedAll: false,
      xpRewarded: false,
    };
  }
}

// ---------- session submit: optimistic + queue ----------

export interface SubmitOutcome {
  result: SessionSaveResult;
  /** false = saved on device only; sync.ts will replay it later. */
  synced: boolean;
}

export async function submitSession(body: SessionSubmit): Promise<SubmitOutcome> {
  const clientSessionId = crypto.randomUUID();
  const playedAt = new Date().toISOString();
  const optimistic = await computeOptimisticResult(body, clientSessionId);

  if (!isGuest()) {
    try {
      const saved = await api.sessions.submit({ ...body, clientSessionId, playedAt });
      await applyServerResult(body, saved);
      return { result: saved, synced: true };
    } catch (err) {
      // Real rejections (validation, implausible session) surface to the page;
      // only unanswered requests and auth expiry queue for later.
      if (err instanceof ApiError && err.status < 500 && err.status !== 401) throw err;
    }
  }

  await applyOptimisticResult(body, optimistic);
  await addPendingSession({ clientSessionId, body, playedAt, optimistic });
  return { result: optimistic, synced: false };
}

async function computeOptimisticResult(
  body: SessionSubmit,
  clientSessionId: string
): Promise<SessionSaveResult> {
  const recomputed = recomputeSession(body.attempts, body.durationMs);
  const local = await readLocalMe();
  const dailyStreak = local?.dailyStreak ?? 1;

  const level = body.mode === 'learn' ? getLevelById(body.levelId ?? -1) : undefined;
  let starsEarned: StarCount | undefined;
  let isLevelComplete = false;
  if (level) {
    starsEarned = getStarsFromScore(recomputed.correct, level);
    isLevelComplete = starsEarned > 0;
  }

  let newPersonalBest = false;
  if (body.mode === 'practice' && body.practiceConfig) {
    const key = configKey(body.practiceConfig as PracticeConfig);
    const bests = (await readSnapshot<PersonalBestRow[]>('personal-bests')) ?? [];
    const pb = bests.find((b) => b.configKey === key);
    newPersonalBest = !pb || recomputed.correct > pb.score;
  }

  const xpBreakdown = calculateXP(
    { ...recomputed, durationMs: body.durationMs },
    {
      isLevelComplete,
      isBossLevel: level !== undefined && isBossLevel(level.id) && isLevelComplete,
      isPersonalBest: newPersonalBest,
      dailyStreakDays: dailyStreak,
    }
  );

  const newXp = (local?.xp ?? 0) + xpBreakdown.total;
  const newAccountLevel = getAccountLevel(newXp);

  const counters = (await readMeta<LocalCounters>('counters')) ?? { totalCorrect: 0, sessionCount: 0 };
  const localUnlocked = (await readMeta<Record<string, string>>('localUnlocked')) ?? {};
  const serverUnlocked = ((await readSnapshot<AchievementRow[]>('achievements')) ?? [])
    .filter((a) => a.unlockedAt)
    .map((a) => a.id);

  let completedWorldId: number | undefined;
  let completedWorldIds: number[] = [];
  if (isLevelComplete && level) {
    const mastery = await readMastery();
    const done = new Set(mastery.filter((m) => m.stars > 0).map((m) => m.levelId));
    done.add(level.id);
    completedWorldIds = [1, 2, 3, 4, 5, 6, 7, 8].filter((wid) =>
      getLevelsByWorld(wid).every((l) => done.has(l.id))
    );
    if (completedWorldIds.includes(level.worldId)) completedWorldId = level.worldId;
  }

  const totalAnswers = recomputed.correct + recomputed.wrong;
  const newAchievements = checkAchievements({
    totalCorrect: counters.totalCorrect + recomputed.correct,
    sessionCount: counters.sessionCount + 1,
    sessionAccuracy: totalAnswers > 0 ? recomputed.accuracy : 0,
    sessionMaxStreak: recomputed.maxStreak,
    sessionAvgMs: totalAnswers >= 5 ? body.durationMs / totalAnswers : 0,
    accountLevel: newAccountLevel,
    dailyStreak,
    completedLevelId: isLevelComplete ? level?.id : undefined,
    completedWorldId,
    completedWorldIds,
    localHour: body.localHour,
    alreadyUnlocked: new Set([...serverUnlocked, ...Object.keys(localUnlocked)]),
  });

  const cachedDaily = await readSnapshot<DailyState>('daily');

  return {
    sessionId: clientSessionId,
    recomputed,
    starsEarned,
    xpBreakdown,
    newAchievements,
    newPersonalBest,
    dailyTaskState: cachedDaily?.date === getTodayDate() ? cachedDaily.taskState : {},
    profile: {
      xp: newXp,
      accountLevel: newAccountLevel,
      leveledUp: newAccountLevel > (local?.accountLevel ?? 1),
      // Streaks are server-decided (AGENTS rule 11); offline shows the last known value.
      dailyStreak,
      dailyXpEarned: (local?.dailyXpEarned ?? 0) + xpBreakdown.total,
    },
  };
}

/** Persist an optimistic result so it survives app restarts while unsynced. */
async function applyOptimisticResult(body: SessionSubmit, result: SessionSaveResult): Promise<void> {
  await persistCommon(body, result);
}

/** Server response is the truth — overwrite local state with it. */
async function applyServerResult(body: SessionSubmit, result: SessionSaveResult): Promise<void> {
  await persistCommon(body, result);
}

async function persistCommon(body: SessionSubmit, result: SessionSaveResult): Promise<void> {
  const local = await readLocalMe();
  if (local) {
    await writeLocalMe({
      ...local,
      xp: result.profile.xp,
      accountLevel: result.profile.accountLevel,
      dailyStreak: result.profile.dailyStreak,
      dailyXpEarned: result.profile.dailyXpEarned,
    });
  }

  const counters = (await readMeta<LocalCounters>('counters')) ?? { totalCorrect: 0, sessionCount: 0 };
  await writeMeta('counters', {
    totalCorrect: counters.totalCorrect + result.recomputed.correct,
    sessionCount: counters.sessionCount + 1,
  } satisfies LocalCounters);

  if (result.newAchievements.length > 0) {
    const localUnlocked = (await readMeta<Record<string, string>>('localUnlocked')) ?? {};
    const now = new Date().toISOString();
    for (const id of result.newAchievements) localUnlocked[id] ??= now;
    await writeMeta('localUnlocked', localUnlocked);
  }

  if (body.mode === 'learn' && body.levelId !== undefined && result.starsEarned !== undefined) {
    await mergeMastery([
      {
        levelId: body.levelId,
        stars: result.starsEarned,
        bestScore: result.recomputed.correct,
        bestAccuracy: String(result.recomputed.accuracy),
        attempts: 1,
        lastPlayedAt: new Date().toISOString(),
      },
    ]);
  }
}
