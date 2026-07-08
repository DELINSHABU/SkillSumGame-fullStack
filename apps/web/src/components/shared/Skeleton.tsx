import { cn } from '@/lib/utils';

/**
 * A single shimmering placeholder block. Caller sets size + radius via `className`
 * (Tailwind on the 8px grid / radius scale). Colors come from the `.skeleton` utility
 * in globals.css, so this stays theme-aware with no inline colors.
 */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden className={cn('skeleton', className)} style={style} />;
}
