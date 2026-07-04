import type { Level } from '../types';
import { buildWorld, type WorldSpec } from './builder';

const spec: WorldSpec = {
  id: 3,
  name: 'World 3: Multiplication Mastery',
  shortName: 'Multiplication',
  operators: ['×'],
  skillCycle: ['multiplyByTwo', 'multiplyByFive', 'multiplyByTen', 'multiplyByEleven', 'random'],
  ranges: {
    intro: [1, 5],
    early: [1, 8],
    mid: [1, 10],
    late: [1, 12],
    speed: [1, 12],
    boss: [1, 12],
  },
  worldTip: 'Break it down: 7×6 is 7×5 + 7. Use the tables you already know.',
};

export const world3Levels: Level[] = buildWorld(spec);
