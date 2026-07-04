import type { Level, WorldMeta } from '../types';
import { world1Levels } from './world1';
import { world2Levels } from './world2';
import { world3Levels } from './world3';
import { world4Levels } from './world4';
import { world5Levels } from './world5';
import { world6Levels } from './world6';
import { world7Levels } from './world7';
import { world8Levels } from './world8';

export { w, buildWorld } from './builder';
export type { WorldSpec, Band } from './builder';

export const ALL_LEVELS: Level[] = [
  ...world1Levels,
  ...world2Levels,
  ...world3Levels,
  ...world4Levels,
  ...world5Levels,
  ...world6Levels,
  ...world7Levels,
  ...world8Levels,
];

const levelById = new Map(ALL_LEVELS.map((l) => [l.id, l]));

export const getLevelById = (id: number): Level | undefined => levelById.get(id);

export const getLevelsByWorld = (worldId: number): Level[] =>
  ALL_LEVELS.filter((l) => l.worldId === worldId);

export const getNextLevel = (currentId: number): Level | undefined =>
  levelById.get(currentId + 1);

export const isBossLevel = (id: number): boolean => id % 10 === 0;

export const WORLDS_META: WorldMeta[] = [
  { id: 1, name: 'Addition Foundation', icon: '➕', colorVar: '--world-1', description: 'Singles, doubles, +9/+10 tricks, 2-digit addition' },
  { id: 2, name: 'Subtraction Strategies', icon: '➖', colorVar: '--world-2', description: '-9/-10 tricks, borrowing, bridging' },
  { id: 3, name: 'Multiplication Mastery', icon: '✖️', colorVar: '--world-3', description: 'Tables 2-12, ×5/×10/×11 tricks' },
  { id: 4, name: 'Division Techniques', icon: '➗', colorVar: '--world-4', description: 'Tables reversed, clean division' },
  { id: 5, name: 'Mixed Operations', icon: '🔀', colorVar: '--world-5', description: 'All four operations mixed' },
  { id: 6, name: 'Number Sense', icon: '🧠', colorVar: '--world-6', description: 'Friendly numbers, patterns, estimation' },
  { id: 7, name: 'Speed Drills', icon: '⚡', colorVar: '--world-7', description: 'Everything so far, faster' },
  { id: 8, name: 'Mental Math Elite', icon: '🏆', colorVar: '--world-8', description: '3-digit mental arithmetic' },
];
