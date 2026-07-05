import { Skeleton } from '@/components/shared/Skeleton';

/** Placeholder for the world-select grid — title + a stack of world cards. */
export function WorldSelectSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-56 rounded-xl" />
      <div className="flex flex-col gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
