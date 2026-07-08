'use client';

// Minimal stale-while-revalidate cache for API reads — no dependency, in-memory only.
//
// Why: every page is a client component that refetches the same payloads on each
// navigation (mastery.list on 5 routes, auth.me twice on home). This layer keeps the
// last response in memory so repeat visits render instantly, dedups concurrent
// requests for the same key, and revalidates in the background.
//
// Fetchers still call `src/lib/api.ts` — all HTTP originates there (frontend-feature
// rule 1). Durable offline persistence lives in `src/lib/localStore.ts` (IndexedDB),
// fed by the offline-first fetchers in `src/lib/data.ts`; this layer stays memory-only.

import { useCallback, useEffect, useSyncExternalStore } from 'react';

type Listener = () => void;

/** The immutable value a subscribed hook renders. New identity on every change so
 *  useSyncExternalStore's Object.is comparison detects updates. */
interface Snapshot<T> {
  data?: T;
  error?: unknown;
}

interface Entry<T> {
  snapshot: Snapshot<T>;
  ts: number; // Date.now() when `data` was last set; 0 = never / invalidated (stale).
  promise?: Promise<T>; // in-flight request, shared for dedup.
  listeners: Set<Listener>;
}

/** Data younger than this is served without a network round-trip. */
const FRESH_MS = 30_000;

const EMPTY: Snapshot<never> = Object.freeze({});
const store = new Map<string, Entry<unknown>>();

function getEntry<T>(key: string): Entry<T> {
  let entry = store.get(key) as Entry<T> | undefined;
  if (!entry) {
    entry = { snapshot: EMPTY as Snapshot<T>, ts: 0, listeners: new Set() };
    store.set(key, entry as Entry<unknown>);
  }
  return entry;
}

function notify(entry: Entry<unknown>): void {
  for (const listener of entry.listeners) listener();
}

function setData<T>(entry: Entry<T>, data: T): void {
  entry.snapshot = { data };
  entry.ts = Date.now();
  entry.promise = undefined;
  notify(entry as Entry<unknown>);
}

function setError<T>(entry: Entry<T>, error: unknown): void {
  // Keep any stale data visible; surface the error alongside it.
  entry.snapshot = { data: entry.snapshot.data, error };
  entry.promise = undefined;
  notify(entry as Entry<unknown>);
}

/**
 * Fetch through the cache. Returns fresh cached data without a request; otherwise
 * runs `fetcher`, sharing one in-flight promise across concurrent callers (dedup).
 * Pass `{ force: true }` to bypass the freshness window (still deduped).
 */
export function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  opts?: { force?: boolean }
): Promise<T> {
  const entry = getEntry<T>(key);
  const isFresh = entry.snapshot.data !== undefined && Date.now() - entry.ts < FRESH_MS;
  if (!opts?.force && isFresh) return Promise.resolve(entry.snapshot.data as T);
  if (entry.promise) return entry.promise;

  entry.promise = fetcher().then(
    (data) => {
      setData(entry, data);
      return data;
    },
    (error) => {
      setError(entry, error);
      throw error;
    }
  );
  return entry.promise;
}

/** Write a value straight into the cache (e.g. from a mutation response) and notify. */
export function mutateCache<T>(key: string, data: T): void {
  setData(getEntry<T>(key), data);
}

/** Mark every key starting with `prefix` stale so the next read revalidates. */
export function invalidate(prefix: string): void {
  for (const [key, entry] of store) {
    if (key.startsWith(prefix)) entry.ts = 0;
  }
}

/** Read the current cached value without subscribing or fetching. */
export function peek<T>(key: string): T | undefined {
  return store.get(key)?.snapshot.data as T | undefined;
}

export interface Resource<T> {
  data: T | undefined;
  error: unknown;
  /** No data yet — render a skeleton. */
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const EMPTY_LISTENER = () => () => {};

/**
 * Subscribe a component to a cached resource. Renders cached data immediately (stale
 * or fresh), revalidates in the background, and re-renders when the value changes.
 * Pass `key: null` to disable (e.g. before a route param is known).
 */
export function useResource<T>(key: string | null, fetcher: () => Promise<T>): Resource<T> {
  const subscribe = useCallback(
    (cb: Listener) => {
      if (!key) return EMPTY_LISTENER();
      const entry = getEntry<T>(key);
      entry.listeners.add(cb);
      return () => entry.listeners.delete(cb);
    },
    [key]
  );

  const getSnapshot = useCallback(
    () => (key ? getEntry<T>(key).snapshot : (EMPTY as Snapshot<T>)),
    [key]
  );

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY as Snapshot<T>);

  useEffect(() => {
    if (!key) return;
    // Freshness + in-flight dedup live inside fetchWithCache, so this is cheap even
    // if it runs on every key change. `fetcher` is intentionally excluded from deps:
    // it is a new closure each render, and keying on `key` is the correct trigger.
    void fetchWithCache(key, fetcher).catch(() => {
      /* error is captured in the snapshot */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refetch = useCallback(async () => {
    if (!key) return;
    await fetchWithCache(key, fetcher, { force: true }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data: snapshot.data,
    error: snapshot.error,
    isLoading: snapshot.data === undefined && snapshot.error === undefined,
    refetch,
  };
}
