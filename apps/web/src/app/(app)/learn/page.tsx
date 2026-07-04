'use client';

import { useEffect, useState } from 'react';
import { WorldSelectGrid } from '@/components/learn/WorldSelectGrid';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { api, type MasteryRow } from '@/lib/api';

export default function LearnPage() {
  const [mastery, setMastery] = useState<MasteryRow[] | null>(null);

  useEffect(() => {
    void api.mastery.list().then(setMastery);
  }, []);

  if (!mastery) return <LoadingScreen message="Loading worlds…" />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1">Choose a World</h1>
      <WorldSelectGrid mastery={mastery} />
    </div>
  );
}
