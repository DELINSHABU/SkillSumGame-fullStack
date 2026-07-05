import { Skeleton } from '@/components/shared/Skeleton';

/** Placeholder for the practice configurator — mode/time/ops/difficulty rows + start button. */
export function PracticeSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-8 w-40 rounded-xl" />
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 flex-1 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-16 rounded-xl" />
    </div>
  );
}
