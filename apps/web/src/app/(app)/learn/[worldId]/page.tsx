'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getLevelsByWorld, WORLDS_META } from '@skillsum/shared';
import { WorldMap } from '@/components/learn/WorldMap';
import { WorldMapSkeleton } from '@/components/learn/WorldMapSkeleton';
import { api } from '@/lib/api';
import { useResource } from '@/lib/cache';
import { GameIcon } from '@/components/ui/GameIcon';

export default function WorldMapPage() {
  const params = useParams<{ worldId: string }>();
  const worldId = Number(params.worldId);
  const valid = Number.isInteger(worldId) && worldId >= 1 && worldId <= 8;
  const { data: mastery } = useResource(valid ? `mastery?worldId=${worldId}` : null, () =>
    api.mastery.list(worldId)
  );

  const meta = WORLDS_META.find((w) => w.id === worldId);
  if (!meta) {
    return (
      <div className="text-center py-24">
        <p className="text-h2">World not found</p>
        <Link href="/learn" className="font-bold" style={{ color: 'var(--pink-400)' }}>← Back to worlds</Link>
      </div>
    );
  }
  if (!mastery) return <WorldMapSkeleton />;

  const levels = getLevelsByWorld(worldId);

  return (
    <div className="flex flex-col gap-6">
      <div className={`rounded-3xl p-5 world-${worldId}-gradient`} style={{ color: 'var(--text-on-pink)' }}>
        <Link href="/learn" className="text-sm opacity-80">← All worlds</Link>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-4xl"><GameIcon emoji={meta.icon} /></span>
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
