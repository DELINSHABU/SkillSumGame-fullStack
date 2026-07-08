import { Skeleton } from '@/components/shared/Skeleton';

/** Placeholder for the home dashboard — greeting, continue/daily/practice cards, journey. */
export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-16 rounded-full" />
      </header>
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-20 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
    </div>
  );
}
