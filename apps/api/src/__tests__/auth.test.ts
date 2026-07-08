import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { cookieHeader, json, migrateTestDb, signup, TEST_USER, truncateAll } from './helpers';

const app = createApp();

beforeAll(async () => {
  await migrateTestDb();
});

beforeEach(async () => {
  await truncateAll();
});

describe('auth flow', () => {
  it('signup → 201, sets httpOnly sid cookie, creates profile', async () => {
    const { res } = await signup(app);
    expect(res.status).toBe(201);
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('sid=');
    expect(setCookie.toLowerCase()).toContain('httponly');
    const body = await json<{ username: string }>(res);
    expect(body.username).toBe(TEST_USER.username);
  });

  it('me returns user with fresh profile defaults', async () => {
    const { sid } = await signup(app);
    const res = await app.request('/api/auth/me', { headers: cookieHeader(sid) });
    expect(res.status).toBe(200);
    const body = await json<{
      email: string;
      xp: number;
      accountLevel: number;
      dailyStreak: number;
      theme: string;
    }>(res);
    expect(body.email).toBe(TEST_USER.email);
    expect(body.xp).toBe(0);
    expect(body.accountLevel).toBe(1);
    expect(body.dailyStreak).toBe(0);
    expect(body.theme).toBe('system');
  });

  it('theme preference: PATCH persists and is returned by /profile and /me; invalid → 400', async () => {
    const { sid } = await signup(app);

    const patched = await app.request('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...cookieHeader(sid) },
      body: JSON.stringify({ theme: 'nord' }),
    });
    expect(patched.status).toBe(200);
    expect((await json<{ theme: string }>(patched)).theme).toBe('nord');

    const profile = await app.request('/api/profile', { headers: cookieHeader(sid) });
    expect((await json<{ theme: string }>(profile)).theme).toBe('nord');

    const me = await app.request('/api/auth/me', { headers: cookieHeader(sid) });
    expect((await json<{ theme: string }>(me)).theme).toBe('nord');

    const bad = await app.request('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...cookieHeader(sid) },
      body: JSON.stringify({ theme: 'neon' }),
    });
    expect(bad.status).toBe(400);
  });

  it('duplicate email → 409; duplicate username → 409', async () => {
    await signup(app);
    const dupEmail = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...TEST_USER, username: 'OtherName' }),
    });
    expect(dupEmail.status).toBe(409);
    const dupName = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...TEST_USER, email: 'other@test.dev' }),
    });
    expect(dupName.status).toBe(409);
  });

  it('login works, is case-insensitive on email, rejects bad password', async () => {
    await signup(app);
    const good = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'PLAYER@test.dev', password: TEST_USER.password }),
    });
    expect(good.status).toBe(200);
    const bad = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_USER.email, password: 'wrongpassword' }),
    });
    expect(bad.status).toBe(401);
  });

  it('logout invalidates the session', async () => {
    const { sid } = await signup(app);
    const out = await app.request('/api/auth/logout', { method: 'POST', headers: cookieHeader(sid) });
    expect(out.status).toBe(200);
    const me = await app.request('/api/auth/me', { headers: cookieHeader(sid) });
    expect(me.status).toBe(401);
  });

  it('me without cookie → 401; garbage cookie → 401', async () => {
    expect((await app.request('/api/auth/me')).status).toBe(401);
    expect((await app.request('/api/auth/me', { headers: cookieHeader('garbage') })).status).toBe(401);
  });

  it('rejects malformed bodies via zod', async () => {
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', username: 'x', password: 'short' }),
    });
    expect(res.status).toBe(400);
  });
});
