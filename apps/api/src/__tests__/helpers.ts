import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import { db } from '../db/client';
import type { createApp } from '../app';

export type TestApp = ReturnType<typeof createApp>;

/** Typed res.json() — undici types it as unknown. */
export async function json<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

export async function migrateTestDb(): Promise<void> {
  await migrate(db, { migrationsFolder: './drizzle' });
}

export async function truncateAll(): Promise<void> {
  await db.execute(sql`
    truncate users, auth_sessions, profiles, level_mastery, game_sessions,
      personal_bests, user_achievements, daily_progress
    restart identity cascade
  `);
}

/** Extract sid cookie value from a signup/login response. */
export function sidFrom(res: Response): string {
  const setCookie = res.headers.get('set-cookie') ?? '';
  const match = setCookie.match(/sid=([^;]+)/);
  if (!match?.[1]) throw new Error(`No sid cookie in response: ${setCookie}`);
  return match[1];
}

export function cookieHeader(sid: string): Record<string, string> {
  return { Cookie: `sid=${sid}` };
}

export const TEST_USER = {
  email: 'player@test.dev',
  username: 'TestPlayer',
  password: 'hunter2hunter2',
};

export async function signup(app: TestApp, user = TEST_USER): Promise<{ res: Response; sid: string }> {
  const res = await app.request('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  return { res, sid: sidFrom(res) };
}
