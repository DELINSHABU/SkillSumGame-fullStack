import { HomeSkeleton } from '@/components/shared/HomeSkeleton';

// Instant-loading UI shown while the route segment's JS loads on navigation.
export default function Loading() {
  return <HomeSkeleton />;
}
