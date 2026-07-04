import type { Level } from '../types';
import { buildWorld, type WorldSpec } from './builder';

const spec: WorldSpec = {
  id: 4,
  name: 'World 4: Division Techniques',
  shortName: 'Division',
  operators: ['÷'],
  skillCycle: ['integerDivision'],
  ranges: {
    intro: [2, 5],
    early: [2, 8],
    mid: [2, 10],
    late: [2, 12],
    speed: [2, 12],
    boss: [2, 12],
  },
  worldTip: 'Division is reversed multiplication: 42 ÷ 6 asks "6 times what is 42?"',
};

export const world4Levels: Level[] = buildWorld(spec);
