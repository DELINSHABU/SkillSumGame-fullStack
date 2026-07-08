import Link from 'next/link';

// Service-worker fallback for documents that were never cached.
// Precached routes (learn, play, practice) render normally offline.
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--bg-canvas)] p-8 text-center">
      <span className="text-5xl" role="img" aria-label="No connection">
        📡
      </span>
      <h1 className="font-display text-2xl font-extrabold text-[var(--text-primary)]">
        You&apos;re offline
      </h1>
      <p className="max-w-sm text-[var(--text-secondary)]">
        This page isn&apos;t saved on your device yet, but your downloaded levels still work.
      </p>
      <Link
        href="/learn"
        className="rounded-full bg-[var(--pink-300)] px-6 py-3 font-display font-extrabold text-white shadow-md"
      >
        Go to Learn
      </Link>
    </main>
  );
}
