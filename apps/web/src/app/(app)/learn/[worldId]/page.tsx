'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLevelsByWorld, WORLDS_META } from '@skillsum/shared';
import { WorldMap } from '@/components/learn/WorldMap';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { api, type MasteryRow } from '@/lib/api';

export default function WorldMapPage() {
  const params = useParams<{ worldId: string }>();
  const worldId = Number(params.worldId);
  const [mastery, setMastery] = useState<MasteryRow[] | null>(null);

  useEffect(() => {
    if (Number.isInteger(worldId) && worldId >= 1 && worldId <= 8) {
      void api.mastery.list(worldId).then(setMastery);
    }
  }, [worldId]);

  const meta = WORLDS_META.find((w) => w.id === worldId);
  if (!meta) {
    return (
      <div className="text-center py-24">
        <p className="text-h2">World not found</p>
        <Link href="/learn" className="font-bold" style={{ color: 'var(--pink-400)' }}>← Back to worlds</Link>
      </div>
    );
  }
  if (!mastery) return <LoadingScreen message={`Entering ${meta.name}…`} />;

  const levels = getLevelsByWorld(worldId);

  return (
    <div className="flex flex-col gap-6">
      <div className={`rounded-3xl p-5 world-${worldId}-gradient`} style={{ color: 'var(--text-on-pink)' }}>
        <Link href="/learn" className="text-sm opacity-80">← All worlds</Link>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-4xl">{meta.icon}</span>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>
              World {worldId}: {meta.name}
            </h1>
            <p className="text-sm opacity-80">{meta.description}</p>
          </div>
        </div>
      </div>
      <WorldMap levels={levels} mastery={mastery} />
    </div>
  );
}
