'use client';

// IndexedDB persistence for offline-first play. Three kinds of data:
//  - snapshots: last successful server payload per cache key (read fallback)
//  - mastery:   per-level best rows, merged max(local, server)
//  - pendingSessions: completed games awaiting server sync (drained by sync.ts)
// The server remains the trust authority — everything here is either a cached
// copy of a server response or an optimistic result the server later recomputes.

import { getLevelById } from '@skillsum/shared';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { MasteryRow, Me, SessionSaveResult, SessionSubmit } from './api';

export interface PendingSession {
  clientSessionId: string;
  body: SessionSubmit;
  playedAt: string; // ISO timestamp on this device
  optimistic: SessionSaveResult;
}

/** Locally maintained aggregates that feed offline achievement checks. */
export interface LocalCounters {
  totalCorrect: number;
  sessionCount: number;
}

interface SkillSumDB extends DBSchema {
  snapshots: { key: string; value: unknown };
  mastery: { key: number; value: MasteryRow };
  pendingSessions: { key: string; value: PendingSession };
  meta: { key: string; value: unknown };
}

let dbPromise: Promise<IDBPDatabase<SkillSumDB>> | null = null;

function db(): Promise<IDBPDatabase<SkillSumDB>> {
  dbPromise ??= openDB<SkillSumDB>('skillsum-local', 1, {
    upgrade(database) {
      database.createObjectStore('snapshots');
      database.createObjectStore('mastery');
      database.createObjectStore('pendingSessions');
      database.createObjectStore('meta');
    },
  });
  return dbPromise;
}

// ---------- snapshots (generic read fallback) ----------

export async function readSnapshot<T>(key: string): Promise<T | undefined> {
  return (await (await db()).get('snapshots', key)) as T | undefined;
}

export async function writeSnapshot(key: string, value: unknown): Promise<void> {
  await (await db()).put('snapshots', value, key);
}

// ---------- mastery ----------

export async function readMastery(worldId?: number): Promise<MasteryRow[]> {
  const rows = await (await db()).getAll('mastery');
  return worldId === undefined
    ? rows
    : rows.filter((r) => getLevelById(r.levelId)?.worldId === worldId);
}

/** Upsert keeping bests — same greatest() semantics as the API's mastery upsert. */
export async function mergeMastery(rows: MasteryRow[]): Promise<void> {
  const database = await db();
  const tx = database.transaction('mastery', 'readwrite');
  for (const row of rows) {
    const existing = await tx.store.get(row.levelId);
    const merged: MasteryRow = existing
      ? {
          levelId: row.levelId,
          stars: Math.max(existing.stars, row.stars) as MasteryRow['stars'],
          bestScore: Math.max(existing.bestScore, row.bestScore),
          bestAccuracy: String(Math.max(Number(existing.bestAccuracy), Number(row.bestAccuracy))),
          attempts: Math.max(existing.attempts, row.attempts),
          lastPlayedAt: row.lastPlayedAt ?? existing.lastPlayedAt,
        }
      : row;
    await tx.store.put(merged, row.levelId);
  }
  await tx.done;
}

// ---------- pending sessions ----------

export async function addPendingSession(session: PendingSession): Promise<void> {
  await (await db()).put('pendingSessions', session, session.clientSessionId);
}

export async function listPendingSessions(): Promise<PendingSession[]> {
  const sessions = await (await db()).getAll('pendingSessions');
  return sessions.sort((a, b) => a.playedAt.localeCompare(b.playedAt));
}

export async function removePendingSession(clientSessionId: string): Promise<void> {
  await (await db()).delete('pendingSessions', clientSessionId);
}

export async function countPendingSessions(): Promise<number> {
  return (await db()).count('pendingSessions');
}

// ---------- meta ----------

export async function readMeta<T>(key: string): Promise<T | undefined> {
  return (await (await db()).get('meta', key)) as T | undefined;
}

export async function writeMeta(key: string, value: unknown): Promise<void> {
  await (await db()).put('meta', value, key);
}

// ---------- profile snapshot helpers ----------

export async function readLocalMe(): Promise<Me | undefined> {
  return readMeta<Me>('me');
}

export async function writeLocalMe(me: Me): Promise<void> {
  await writeMeta('me', me);
}

/** Wipe everything local — called on explicit logout only, never on offline errors. */
export async function clearLocalData(): Promise<void> {
  const database = await db();
  await Promise.all(
    (['snapshots', 'mastery', 'pendingSessions', 'meta'] as const).map((store) =>
      database.clear(store)
    )
  );
}
