'use client';

// Foreground sync engine: drains the pendingSessions queue (oldest first)
// whenever the app starts, comes back online, or returns to the foreground.
// No Background Sync API — iOS Safari doesn't support it, and the game is
// only playable with the app open anyway.

import { api, ApiError } from './api';
import { invalidate } from './cache';
import { isGuest } from './data';
import {
  countPendingSessions,
  listPendingSessions,
  readLocalMe,
  removePendingSession,
  writeLocalMe,
} from './localStore';

type Listener = () => void;

const listeners = new Set<Listener>();
let pendingCount = 0;
let inFlight: Promise<void> | null = null;

function notify(): void {
  for (const listener of listeners) listener();
}

async function refreshCount(): Promise<void> {
  const next = await countPendingSessions();
  if (next !== pendingCount) {
    pendingCount = next;
    notify();
  }
}

// useSyncExternalStore surface for the AppShell pill.
export function subscribePendingCount(cb: Listener): () => void {
  listeners.add(cb);
  void refreshCount();
  return () => listeners.delete(cb);
}

export function getPendingCount(): number {
  return pendingCount;
}

/**
 * Replay queued sessions serially (streak/XP math stays ordered). Single
 * in-flight drain; concurrent calls share it. Guests keep their queue until
 * they sign up — `drainQueue` is what replays it into the new account.
 */
export function drainQueue(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = drain().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function drain(): Promise<void> {
  await refreshCount();
  if (isGuest() || pendingCount === 0) return;

  let synced = 0;
  for (const pending of await listPendingSessions()) {
    try {
      const saved = await api.sessions.submit({
        ...pending.body,
        clientSessionId: pending.clientSessionId,
        playedAt: pending.playedAt,
      });
      // Server is the truth — its profile numbers replace the optimistic ones.
      const local = await readLocalMe();
      if (local) {
        await writeLocalMe({
          ...local,
          xp: saved.profile.xp,
          accountLevel: saved.profile.accountLevel,
          dailyStreak: saved.profile.dailyStreak,
          dailyXpEarned: saved.profile.dailyXpEarned,
        });
      }
      await removePendingSession(pending.clientSessionId);
      synced++;
      await refreshCount();
    } catch (err) {
      if (err instanceof ApiError && err.status !== 401 && err.status < 500) {
        // Server explicitly rejected it (validation/implausible) — replaying
        // will never succeed. Drop it; optimistic local progress stays.
        console.warn('Dropping unsyncable session', pending.clientSessionId, err.message);
        await removePendingSession(pending.clientSessionId);
        await refreshCount();
        continue;
      }
      // Offline, server error, or logged out — stop and retry on the next trigger.
      break;
    }
  }

  if (synced > 0) {
    invalidate('mastery');
    invalidate('profile');
    invalidate('auth/me');
    invalidate('sessions');
    invalidate('daily');
  }
}

let triggersInstalled = false;

/** Idempotent: wire app-start / online / foreground triggers once. */
export function installSyncTriggers(): void {
  if (triggersInstalled || typeof window === 'undefined') return;
  triggersInstalled = true;

  void drainQueue();
  window.addEventListener('online', () => void drainQueue());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void drainQueue();
  });
}
