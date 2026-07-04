'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/learn', label: 'Learn', icon: '🗺️' },
  { href: '/practice', label: 'Practice', icon: '🎯' },
  { href: '/daily', label: 'Daily', icon: '📅' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col gap-2 p-6 sticky top-0 h-screen"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">🧠</span>
          <span className="text-h2">SkillSum</span>
        </div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 min-h-[48px] font-bold transition-colors active:scale-95'
            )}
            style={{
              fontFamily: 'var(--font-display)',
              backgroundColor: isActive(item.href) ? 'var(--pink-100)' : 'transparent',
              color: isActive(item.href) ? 'var(--pink-500)' : 'var(--text-secondary)',
            }}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Main content */}
      <main className="pb-24 lg:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 flex justify-around pb-[env(safe-area-inset-bottom)]"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[56px] active:scale-95"
            style={{ color: isActive(item.href) ? 'var(--pink-400)' : 'var(--text-tertiary)' }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase" style={{ fontFamily: 'var(--font-body)' }}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
