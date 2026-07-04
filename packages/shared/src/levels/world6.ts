import type { Level } from '../types';
import { buildWorld, type WorldSpec } from './builder';

const spec: WorldSpec = {
  id: 6,
  name: 'World 6: Number Sense & Patterns',
  shortName: 'Number Sense',
  operators: ['+', '-'],
  skillCycle: ['makeTen', 'doubles', 'nearDoubles', 'random', 'subtractNine', 'addNine'],
  ranges: {
    intro: [10, 30],
    early: [10, 50],
    mid: [20, 80],
    late: [20, 99],
    speed: [10, 80],
    boss: [10, 99],
  },
  worldTip: 'Look for friendly numbers: round to the nearest 10, compute, then adjust.',
};

export const world6Levels: Level[] = buildWorld(spec);
