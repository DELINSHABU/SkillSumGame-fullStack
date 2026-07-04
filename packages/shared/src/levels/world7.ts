import type { Level } from '../types';
import { buildWorld, type WorldSpec } from './builder';

const spec: WorldSpec = {
  id: 7,
  name: 'World 7: Speed Drills',
  shortName: 'Speed',
  operators: ['+', '-', '×'],
  skillCycle: ['random'],
  timerAdjust: 20, // every timer 20s shorter than the standard ramp
  ranges: {
    intro: [1, 10],
    early: [1, 20],
    mid: [1, 30],
    late: [1, 50],
    speed: [1, 40],
    boss: [1, 50],
  },
  worldTip: 'Do not overthink. First instinct, answer, next question.',
};

export const world7Levels: Level[] = buildWorld(spec);
