import type { Level } from '../types';
import { buildWorld, type WorldSpec } from './builder';

const spec: WorldSpec = {
  id: 2,
  name: 'World 2: Subtraction Strategies',
  shortName: 'Subtraction',
  operators: ['-'],
  skillCycle: ['subtractTen', 'subtractNine', 'random', 'subtractTen', 'subtractNine', 'random'],
  ranges: {
    intro: [1, 10],
    early: [1, 20],
    mid: [10, 60],
    late: [10, 90],
    speed: [1, 60],
    boss: [1, 99],
  },
  worldTip: 'Subtract 10 and adjust, or count up from the smaller number to find the gap.',
};

export const world2Levels: Level[] = buildWorld(spec);
