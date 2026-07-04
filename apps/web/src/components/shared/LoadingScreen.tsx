export function LoadingScreen({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <span className="text-5xl animate-float">🧠</span>
      <p className="font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
        {message}
      </p>
    </div>
  );
}
