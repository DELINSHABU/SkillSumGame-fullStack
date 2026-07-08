import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { QuestionAttempt } from '@skillsum/shared';
import { createApp } from '../app';
import { cookieHeader, json, migrateTestDb, signup, truncateAll } from './helpers';

const app = createApp();

beforeAll(async () => {
  await migrateTestDb();
});

beforeEach(async () => {
  await truncateAll();
});

function makeAttempts(correct: number, responseMs = 2000): QuestionAttempt[] {
  return Array.from({ length: correct }, () => ({
    question: '2 + 3',
    correctAnswer: 5,
    userAnswer: 5,
    isCorrect: true,
    responseMs,
    skill: 'random',
    operator: '+' as const,
  }));
}

async function postSession(sid: string, body: object): Promise<Response> {
  return app.request('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cookieHeader(sid) },
    body: JSON.stringify(body),
  });
}

interface SessionResponse {
  sessionId: string;
  xpBreakdown: { total: number };
  profile: { xp: number };
}

describe('POST /api/sessions — clientSessionId idempotency', () => {
  const CLIENT_ID = '7d5c3e51-9a4b-4f2c-8d1e-2b3a4c5d6e7f';

  it('replaying the same clientSessionId returns the original result without double credit', async () => {
    const { sid } = await signup(app);
    const body = {
      mode: 'learn',
      levelId: 1,
      attempts: makeAttempts(5),
      durationMs: 15000,
      clientSessionId: CLIENT_ID,
      playedAt: new Date().toISOString(),
    };

    const first = await json<SessionResponse>(await postSession(sid, body));
    const replay = await postSession(sid, body);
    expect(replay.status).toBe(200);
    const second = await json<SessionResponse>(replay);

    expect(second.sessionId).toBe(first.sessionId);
    expect(second.xpBreakdown.total).toBe(first.xpBreakdown.total);
    // Profile XP unchanged by the replay.
    expect(second.profile.xp).toBe(first.profile.xp);

    const history = await json<Array<{ id: string }>>(
      await app.request('/api/sessions', { headers: cookieHeader(sid) })
    );
    expect(history).toHaveLength(1);
  });

  it('different clientSessionIds save separately', async () => {
    const { sid } = await signup(app);
    const base = { mode: 'learn', levelId: 1, attempts: makeAttempts(5), durationMs: 15000 };

    await postSession(sid, { ...base, clientSessionId: CLIENT_ID });
    await postSession(sid, { ...base, clientSessionId: '11111111-2222-4333-8444-555555555555' });

    const history = await json<Array<{ id: string }>>(
      await app.request('/api/sessions', { headers: cookieHeader(sid) })
    );
    expect(history).toHaveLength(2);
  });

  it('sessions without clientSessionId are never deduped', async () => {
    const { sid } = await signup(app);
    const base = { mode: 'learn', levelId: 1, attempts: makeAttempts(5), durationMs: 15000 };

    await postSession(sid, base);
    await postSession(sid, base);

    const history = await json<Array<{ id: string }>>(
      await app.request('/api/sessions', { headers: cookieHeader(sid) })
    );
    expect(history).toHaveLength(2);
  });

  it('rejects a malformed clientSessionId', async () => {
    const { sid } = await signup(app);
    const res = await postSession(sid, {
      mode: 'learn',
      levelId: 1,
      attempts: makeAttempts(5),
      durationMs: 15000,
      clientSessionId: 'not-a-uuid',
    });
    expect(res.status).toBe(400);
  });
});
