import { Skeleton } from '@/components/shared/Skeleton';

/** Placeholder for the daily challenges screen — title, reward banner, three task cards. */
export function DailySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-lg" />
      </div>
      <Skeleton className="h-20 rounded-2xl" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
  );
}
