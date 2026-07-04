import { createHash, randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Db } from '../db/client';
import { authSessions } from '../db/schema';

export const SESSION_COOKIE = 'sid';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// The cookie holds the raw token; the DB stores only its sha256 hash, so a
// leaked DB dump cannot forge sessions.

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(db: Db, userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(authSessions).values({ id: hashToken(token), userId, expiresAt });
  return { token, expiresAt };
}

export async function getSessionUserId(db: Db, token: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(authSessions)
    .where(eq(authSessions.id, hashToken(token)))
    .limit(1);
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(authSessions).where(eq(authSessions.id, row.id));
    return null;
  }
  return row.userId;
}

export async function deleteSession(db: Db, token: string): Promise<void> {
  await db.delete(authSessions).where(eq(authSessions.id, hashToken(token)));
}
