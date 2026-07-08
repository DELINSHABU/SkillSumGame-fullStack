import { Skeleton } from '@/components/shared/Skeleton';

/** Placeholder for a world map — gradient header + a winding column of level nodes. */
export function WorldMapSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-28 rounded-3xl" />
      <div className="flex flex-col items-center gap-6 py-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            className="h-16 w-16 rounded-full"
            style={{ marginLeft: i % 2 === 0 ? '-6rem' : '6rem' }}
          />
        ))}
      </div>
    </div>
  );
}
