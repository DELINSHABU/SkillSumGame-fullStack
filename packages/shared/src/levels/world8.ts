import type { Level } from '../types';
import { buildWorld, type WorldSpec } from './builder';

const spec: WorldSpec = {
  id: 8,
  name: 'World 8: Mental Math Elite',
  shortName: 'Elite',
  operators: ['+', '-', '×', '÷'],
  skillCycle: ['random'],
  ranges: {
    intro: [10, 99],
    early: [50, 199],
    mid: [100, 499],
    late: [100, 999],
    speed: [50, 499],
    boss: [100, 999],
  },
  worldTip: 'Chunk big numbers: 348 + 235 = 300+200, 48+35. Add the parts.',
};

export const world8Levels: Level[] = buildWorld(spec);
