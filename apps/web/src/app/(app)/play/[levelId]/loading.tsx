import { Skeleton } from '@/components/shared/Skeleton';

// The play route pulls in the gameplay bundle; show a lightweight lesson-intro shell
// while it loads rather than the full-screen brain spinner.
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-28 rounded-3xl" />
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-16 rounded-xl" />
    </div>
  );
}
