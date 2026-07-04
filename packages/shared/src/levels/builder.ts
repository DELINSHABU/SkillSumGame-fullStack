import type { Level, LevelType, OperationType, SkillType } from '../types';

// 400-level curriculum is generated from per-world specs, not hand-written.
// Difficulty ramp (per master guide): intro (no timer) → standard bands with
// shrinking timers and rising targets → speedrun 41-49 → world boss at 50.
// Bosses at every 10th level.

export type Band = 'intro' | 'early' | 'mid' | 'late' | 'speed' | 'boss';

export interface WorldSpec {
  id: number;
  name: string; // "World 1: Addition Foundation"
  shortName: string; // "Addition"
  operators: OperationType[];
  /** Skills cycled across standard levels. 'random' = plain arithmetic from operators. */
  skillCycle: SkillType[];
  /** Number range per band. */
  ranges: Record<Band, [number, number]>;
  /** Seconds subtracted from every timer (speed-drill worlds). */
  timerAdjust?: number;
  /** World-generic tip used for 'random' skill levels. */
  worldTip: string;
}

const SKILL_TITLES: Record<SkillType, string> = {
  makeTen: 'Making Ten',
  addTen: "The 'Adding 10' Rule",
  addNine: "The 'Adding 9' Trick",
  addEight: "The 'Adding 8' Trick",
  doubles: 'Doubles',
  nearDoubles: 'Near Doubles',
  subtractTen: "The 'Minus 10' Rule",
  subtractNine: "The 'Minus 9' Trick",
  multiplyByTwo: 'Doubling (×2)',
  multiplyByFive: 'The Fives (×5)',
  multiplyByTen: 'Power of Ten (×10)',
  multiplyByEleven: 'Elevens Magic (×11)',
  integerDivision: 'Clean Division',
  random: 'Mixed Practice',
};

const SKILL_TIPS: Record<SkillType, string> = {
  makeTen: "Memorize the pairs that make 10: 1+9, 2+8, 3+7, 4+6, 5+5.",
  addTen: 'To add 10, increase the tens digit by 1. The ones digit stays the same.',
  addNine: 'To add 9: add 10 first, then subtract 1. 27+9 = 27+10-1 = 36.',
  addEight: 'To add 8: add 10 first, then subtract 2. 35+8 = 35+10-2 = 43.',
  doubles: 'Memorize your doubles: 6+6=12, 7+7=14, 8+8=16, 9+9=18.',
  nearDoubles: "For 7+8: use the double you know. 7+7=14, then add 1 = 15.",
  subtractTen: 'To subtract 10, decrease the tens digit by 1. Ones digit stays.',
  subtractNine: 'To subtract 9: subtract 10, then add 1 back. 45-9 = 45-10+1 = 36.',
  multiplyByTwo: 'Multiplying by 2 is doubling. Double the tens, double the ones.',
  multiplyByFive: '×5 trick: multiply by 10, then halve it. 14×5 = 140÷2 = 70.',
  multiplyByTen: 'To multiply by 10, add a zero to the end.',
  multiplyByEleven: '×11 for single digits: repeat the digit. 7×11 = 77.',
  integerDivision: 'Think backwards: 42 ÷ 6 asks "6 times what is 42?"',
  random: 'Pick the right trick for each question before you answer.',
};

interface Slot {
  type: LevelType;
  band: Band;
  timeLimit?: number;
  target: number;
}

function slotFor(local: number): Slot {
  if (local === 50) return { type: 'boss', band: 'boss', timeLimit: 120, target: 30 };
  if (local === 10) return { type: 'boss', band: 'early', timeLimit: 90, target: 20 };
  if (local === 20) return { type: 'boss', band: 'mid', timeLimit: 90, target: 22 };
  if (local === 30) return { type: 'boss', band: 'mid', timeLimit: 90, target: 24 };
  if (local === 40) return { type: 'boss', band: 'late', timeLimit: 75, target: 26 };
  if (local <= 2) return { type: 'intro', band: 'intro', target: 5 + (local - 1) * 3 };
  if (local <= 9) return { type: 'standard', band: 'early', timeLimit: 90, target: 10 + Math.floor((local - 3) / 2) };
  if (local <= 19) return { type: 'standard', band: 'mid', timeLimit: 75, target: 12 + (local % 2) };
  if (local <= 29) return { type: 'standard', band: 'mid', timeLimit: 75, target: 14 + (local % 2) };
  if (local <= 39) return { type: 'standard', band: 'late', timeLimit: 60, target: 16 + (local % 2) };
  return { type: 'speedrun', band: 'speed', timeLimit: 45, target: 18 + (local % 3) };
}

/** World 1 = IDs 1-50, World 2 = 51-100, ... */
export const w = (worldId: number, localId: number): number => (worldId - 1) * 50 + localId;

function stars(target: number): { star1Score: number; star2Score: number; star3Score: number } {
  return {
    star1Score: Math.max(1, Math.ceil(target * 0.5)),
    star2Score: Math.ceil(target * 0.75),
    star3Score: target,
  };
}

const BAND_SUFFIX: Record<Band, string> = {
  intro: '', early: '', mid: ' II', late: ' III', speed: '', boss: '',
};

export function buildWorld(spec: WorldSpec, overrides: Record<number, Level> = {}): Level[] {
  const levels: Level[] = [];
  let skillIndex = 0;

  for (let local = 1; local <= 50; local++) {
    const override = overrides[local];
    if (override) {
      levels.push(override);
      continue;
    }

    const slot = slotFor(local);
    const timeLimit =
      slot.timeLimit === undefined
        ? undefined
        : Math.max(30, slot.timeLimit - (spec.timerAdjust ?? 0));

    // Keep targets honest: at 2s per answer the target must fit in the timer
    // (matters for speed-drill worlds whose timers are shortened).
    const target =
      timeLimit === undefined ? slot.target : Math.max(5, Math.min(slot.target, Math.floor(timeLimit / 2)));

    // Bosses and speedruns always mix; standard levels cycle the skill pool.
    const skill: SkillType =
      slot.type === 'boss' || slot.type === 'speedrun'
        ? 'random'
        : spec.skillCycle[skillIndex++ % spec.skillCycle.length] ?? 'random';

    const range = spec.ranges[slot.band];

    let title: string;
    let description: string;
    if (slot.type === 'boss' && local === 50) {
      title = `WORLD BOSS: ${spec.shortName} Master`;
      description = `The final test for ${spec.name}. Prove your mastery!`;
    } else if (slot.type === 'boss') {
      title = `BOSS: ${spec.shortName} Challenge ${local / 10}`;
      description = 'Show what you have learned so far in this boss level.';
    } else if (slot.type === 'intro') {
      title = local === 1 ? `First Steps: ${spec.shortName}` : `Warming Up: ${spec.shortName}`;
      description = `Ease into ${spec.shortName.toLowerCase()} — no timer, no pressure.`;
    } else if (slot.type === 'speedrun') {
      title = `Speed Run ${local - 40}: ${spec.shortName}`;
      description = 'Short timer. Answer as fast as you can!';
    } else {
      title = `${SKILL_TITLES[skill]}${BAND_SUFFIX[slot.band]}`;
      description = `Practice: ${SKILL_TITLES[skill].toLowerCase()}.`;
    }

    const id = w(spec.id, local);
    levels.push({
      id,
      worldId: spec.id,
      worldName: spec.name,
      title,
      description,
      tip: skill === 'random' ? spec.worldTip : SKILL_TIPS[skill],
      type: slot.type,
      targetScore: target,
      ...stars(target),
      timeLimit,
      generationParams: { operators: spec.operators, numberRange: range, skill },
      unlockRequirement: id > 1 ? id - 1 : undefined,
    });
  }

  return levels;
}
