'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Theme, ThemeId } from '@skillsum/shared';
import { isTheme, normalizeTheme } from '@skillsum/shared';
import { api } from '@/lib/api';
import { fetchWithCache } from '@/lib/cache';

interface ThemeContextValue {
  /** The user's chosen mode. 'system' follows the device OS setting. */
  theme: Theme;
  /** The concrete named theme currently applied ('system' resolved via matchMedia). */
  resolvedTheme: ThemeId;
  setTheme: (mode: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const THEME_COOKIE = 'skillsum-theme';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const SYSTEM_LIGHT: ThemeId = 'arcade-light';
const SYSTEM_DARK: ThemeId = 'arcade-dark';

function readCookie(): Theme {
  if (typeof document === 'undefined') return 'system';
  const match = document.cookie.match(/(?:^|;\s*)skillsum-theme=([^;]+)/);
  const raw = match ? decodeURIComponent(match[1] ?? '') : '';
  const normalized = normalizeTheme(raw);
  return isTheme(normalized) ? normalized : 'system';
}

function writeCookie(mode: Theme): void {
  document.cookie = `${THEME_COOKIE}=${mode}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

function prefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolve(mode: Theme): ThemeId {
  if (mode === 'system') return prefersDark() ? SYSTEM_DARK : SYSTEM_LIGHT;
  return mode;
}

/** Set the concrete named theme on <html> (the pre-paint init script does this first; we keep it in sync). */
function applyToDom(mode: Theme): void {
  document.documentElement.dataset.theme = resolve(mode);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start from a stable default so the first client render matches SSR (no hydration mismatch);
  // real values are read from the cookie in an effect, after the pre-paint script has run.
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ThemeId>(SYSTEM_LIGHT);

  const adopt = useCallback((mode: Theme) => {
    setThemeState(mode);
    setResolvedTheme(resolve(mode));
  }, []);

  // Seed from the cookie the init script already applied to <html>.
  useEffect(() => {
    adopt(readCookie());
  }, [adopt]);

  // Reconcile with the account (the source of truth) so the choice follows the user across devices.
  // Silently ignored when logged out (401 on auth pages).
  useEffect(() => {
    let cancelled = false;
    // Shared cache key with the home page — dedups the duplicate auth.me() on load.
    void fetchWithCache('auth/me', () => api.auth.me())
      .then((me) => {
        if (cancelled) return;
        const normalized = normalizeTheme(me.theme);
        const safe = isTheme(normalized) ? normalized : 'system';
        writeCookie(safe);
        applyToDom(safe);
        adopt(safe);
      })
      .catch(() => {
        /* not logged in — keep the cookie-derived theme */
      });
    return () => {
      cancelled = true;
    };
  }, [adopt]);

  // While in System mode, follow live OS changes.
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      applyToDom('system');
      setResolvedTheme(prefersDark() ? SYSTEM_DARK : SYSTEM_LIGHT);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback(
    (mode: Theme) => {
      writeCookie(mode);
      applyToDom(mode);
      adopt(mode);
      void api.profile.update({ theme: mode }).catch(() => {
        /* offline / logged out — the cookie still holds the choice */
      });
    },
    [adopt]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
