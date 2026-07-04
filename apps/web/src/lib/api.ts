import type {
  Achievement,
  ChallengeTask,
  PracticeConfig,
  QuestionAttempt,
  StarCount,
} from '@skillsum/shared';
import type { XPBreakdown } from '@skillsum/shared';

// Single typed API client. ALL frontend HTTP goes through here.
// Paths are same-origin /api/* — Next.js rewrites proxy to the Hono server.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: object) =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
const patch = <T>(path: string, body: object) =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

// ---------- Types mirrored from API responses ----------

export interface Me {
  id: string;
  email: string;
  username: string;
  avatarEmoji: string;
  xp: number;
  accountLevel: number;
  dailyStreak: number;
  dailyXpEarned: number;
  dailyGoalMinutes: number;
  onboardingComplete: boolean;
  mathLevel: string;
}

export interface ProfileStats {
  totalSessions: number;
  totalCorrect: number;
  totalWrong: number;
  totalTimeMs: number;
  bestStreak: number;
  levelsCompleted: number;
  totalStars: number;
}

export interface FullProfile extends Me {
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  stats: ProfileStats;
}

export interface MasteryRow {
  levelId: number;
  stars: StarCount;
  bestScore: number;
  bestAccuracy: string;
  attempts: number;
  lastPlayedAt: string | null;
}

export interface SessionSubmit {
  mode: 'learn' | 'practice' | 'daily';
  levelId?: number;
  practiceConfig?: PracticeConfig;
  dailyTaskId?: string;
  attempts: QuestionAttempt[];
  durationMs: number;
  localHour?: number;
}

export interface TaskStateEntry {
  progress: number;
  completed: boolean;
}

export interface SessionSaveResult {
  sessionId: string;
  recomputed: { correct: number; wrong: number; accuracy: number; maxStreak: number };
  starsEarned?: StarCount;
  xpBreakdown: XPBreakdown;
  newAchievements: string[];
  newPersonalBest: boolean;
  dailyTaskState: Record<string, TaskStateEntry>;
  profile: {
    xp: number;
    accountLevel: number;
    leveledUp: boolean;
    dailyStreak: number;
    dailyXpEarned: number;
  };
}

export interface GameSessionRow {
  id: string;
  mode: 'learn' | 'practice' | 'daily';
  levelId: number | null;
  practiceConfig: PracticeConfig | null;
  correct: number;
  wrong: number;
  accuracy: string;
  maxStreak: number;
  durationMs: number;
  xpEarned: number;
  starsEarned: StarCount | null;
  isPersonalBest: boolean;
  attempts: QuestionAttempt[];
  startedAt: string;
}

export interface PersonalBestRow {
  configKey: string;
  score: number;
  accuracy: string;
  achievedAt: string;
}

export interface AchievementRow extends Achievement {
  unlockedAt: string | null;
}

export interface DailyState {
  id: string;
  date: string;
  tasks: ChallengeTask[];
  xpReward: number;
  taskState: Record<string, TaskStateEntry>;
  completedAll: boolean;
  xpRewarded: boolean;
}

// ---------- API surface ----------

export const api = {
  auth: {
    signup: (body: { email: string; username: string; password: string }) =>
      post<{ id: string; email: string; username: string }>('/api/auth/signup', body),
    login: (body: { email: string; password: string }) =>
      post<{ id: string; email: string; username: string }>('/api/auth/login', body),
    logout: () => post<{ ok: boolean }>('/api/auth/logout'),
    me: () => get<Me>('/api/auth/me'),
  },
  profile: {
    get: () => get<FullProfile>('/api/profile'),
    update: (body: Partial<Pick<Me, 'avatarEmoji' | 'dailyGoalMinutes' | 'mathLevel' | 'onboardingComplete'>>) =>
      patch<Me>('/api/profile', body),
  },
  mastery: {
    list: (worldId?: number) => get<MasteryRow[]>(worldId ? `/api/mastery?worldId=${worldId}` : '/api/mastery'),
  },
  sessions: {
    submit: (body: SessionSubmit) => post<SessionSaveResult>('/api/sessions', body),
    history: (opts?: { mode?: string; limit?: number }) => {
      const params = new URLSearchParams();
      if (opts?.mode) params.set('mode', opts.mode);
      if (opts?.limit) params.set('limit', String(opts.limit));
      const qs = params.toString();
      return get<GameSessionRow[]>(`/api/sessions${qs ? `?${qs}` : ''}`);
    },
    personalBests: () => get<PersonalBestRow[]>('/api/sessions/personal-bests'),
  },
  achievements: {
    list: () => get<AchievementRow[]>('/api/achievements'),
  },
  daily: {
    get: () => get<DailyState>('/api/daily'),
    claim: () => post<{ xpAwarded: number; xp: number }>('/api/daily/claim'),
  },
};
