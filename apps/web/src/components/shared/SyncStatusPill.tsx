'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { getPendingCount, installSyncTriggers, subscribePendingCount } from '@/lib/sync';

// Floating status pill: shows when the device is offline and/or games are
// waiting to sync. Mounting it also installs the sync triggers (app start,
// back online, tab foregrounded).
export function SyncStatusPill() {
  const pending = useSyncExternalStore(subscribePendingCount, getPendingCount, () => 0);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    installSyncTriggers();
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online && pending === 0) return null;

  const label = !online
    ? pending > 0
      ? `📴 Offline — ${pending} game${pending === 1 ? '' : 's'} saved on device`
      : '📴 Offline — progress saves on device'
    : `☁️ Syncing ${pending} game${pending === 1 ? '' : 's'}…`;

  return (
    <div
      role="status"
      className="fixed top-2 inset-x-0 z-50 flex justify-center pointer-events-none"
    >
      <span
        className="rounded-full px-4 py-1.5 text-xs font-bold animate-fade-up"
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-md)',
          fontFamily: 'var(--font-display)',
        }}
      >
        {label}
      </span>
    </div>
  );
}
