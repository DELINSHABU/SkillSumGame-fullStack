'use client';

import { useEffect, useRef, useState } from 'react';
import type { Level, StarCount } from '@skillsum/shared';
import type { MasteryRow } from '@/lib/api';
import { LevelDetailSheet } from './LevelDetailSheet';
import { LevelNode, type LevelNodeState } from './LevelNode';

interface WorldMapProps {
  levels: Level[];
  mastery: MasteryRow[];
}

export function WorldMap({ levels, mastery }: WorldMapProps) {
  const [selected, setSelected] = useState<Level | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);
  const masteryByLevel = new Map(mastery.map((m) => [m.levelId, m]));

  const stateFor = (level: Level, index: number): LevelNodeState => {
    const stars = (masteryByLevel.get(level.id)?.stars ?? 0) as StarCount;
    if (stars === 3) return 'gold';
    if (stars === 2) return 'silver';
    if (stars === 1) return 'bronze';
    const previous = levels[index - 1];
    const previousPassed = index === 0 || (previous !== undefined && (masteryByLevel.get(previous.id)?.stars ?? 0) > 0);
    // First world's first level is always open; otherwise previous level must be passed.
    if (previousPassed) return 'current';
    return 'locked';
  };

  const states = levels.map((level, i) => stateFor(level, i));
  const currentIndex = states.findIndex((s) => s === 'current');

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  return (
    <div className="relative">
      {/* Winding 2-column zigzag layout */}
      <div className="flex flex-col gap-6 items-center">
        {levels.map((level, index) => {
          const state = states[index] ?? 'locked';
          const zigzag = index % 4 < 2 ? 'self-start ml-[15%]' : 'self-end mr-[15%]';
          return (
            <div key={level.id} className={zigzag} ref={index === currentIndex ? currentRef : undefined}>
              <LevelNode
                level={level}
                stars={(masteryByLevel.get(level.id)?.stars ?? 0) as StarCount}
                state={state}
                onSelect={setSelected}
              />
            </div>
          );
        })}
      </div>

      {selected && (
        <LevelDetailSheet level={selected} mastery={masteryByLevel.get(selected.id)} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
