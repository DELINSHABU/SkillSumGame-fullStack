export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
