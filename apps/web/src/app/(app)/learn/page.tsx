'use client';

import { WorldSelectGrid } from '@/components/learn/WorldSelectGrid';
import { WorldSelectSkeleton } from '@/components/learn/WorldSelectSkeleton';
import { useResource } from '@/lib/cache';
import { masteryList } from '@/lib/data';

export default function LearnPage() {
  const { data: mastery } = useResource('mastery', () => masteryList());

  if (!mastery) return <WorldSelectSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">Choose a World</h1>
      <WorldSelectGrid mastery={mastery} />
    </div>
  );
}
