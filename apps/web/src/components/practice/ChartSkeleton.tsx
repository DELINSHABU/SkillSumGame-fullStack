import { Skeleton } from '@/components/shared/Skeleton';

/** Loading placeholder for the lazily-loaded pace chart (matches its 160px chart area). */
export function ChartSkeleton() {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
      <Skeleton className="mb-3 h-4 w-40 rounded-lg" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
