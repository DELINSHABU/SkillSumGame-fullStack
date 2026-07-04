import type { PracticeConfig } from './types';

/** Canonical key for a practice config — personal-best identity. */
export function configKey(config: PracticeConfig): string {
  const ops = [...config.operators].sort().join('');
  const [min, max] = config.numberRange;
  const limit =
    config.mode === 'time' ? `t${config.timeLimit ?? 0}` : config.mode === 'count' ? `c${config.targetCount ?? 0}` : 'zen';
  return `${config.mode}|${limit}|${ops}|${min}-${max}`;
}
