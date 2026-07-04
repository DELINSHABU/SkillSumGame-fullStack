import { describe, expect, it } from 'vitest';
import { ALL_LEVELS, getLevelById, getLevelsByWorld, getNextLevel, WORLDS_META } from '../levels';
import { generateQuestion } from '../generator';
import { mulberry32 } from '../rng';

describe('level data invariants — all 400 levels', () => {
  it('exactly 400 levels, ids 1..400 unique and ordered', () => {
    expect(ALL_LEVELS).toHaveLength(400);
    const ids = ALL_LEVELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(400);
    expect(Math.min(...ids)).toBe(1);
    expect(Math.max(...ids)).toBe(400);
  });

  it('worldId matches id band: worldId === ceil(id/50)', () => {
    for (const level of ALL_LEVELS) {
      expect(level.worldId).toBe(Math.ceil(level.id / 50));
    }
  });

  it('star thresholds: star1 < star2 < star3 <= targetScore', () => {
    for (const level of ALL_LEVELS) {
      expect(level.star1Score, `level ${level.id}`).toBeLessThan(level.star2Score);
      expect(level.star2Score, `level ${level.id}`).toBeLessThan(level.star3Score);
      expect(level.star3Score, `level ${level.id}`).toBeLessThanOrEqual(level.targetScore);
    }
  });

  it('every 10th level is a boss', () => {
    for (const level of ALL_LEVELS) {
      if (level.id % 10 === 0) expect(level.type, `level ${level.id}`).toBe('boss');
      else expect(level.type, `level ${level.id}`).not.toBe('boss');
    }
  });

  it('intro levels (X01-X02) have no timer; all others do', () => {
    for (const level of ALL_LEVELS) {
      const local = ((level.id - 1) % 50) + 1;
      if (local <= 2) expect(level.timeLimit, `level ${level.id}`).toBeUndefined();
      else {
        expect(level.timeLimit, `level ${level.id}`).toBeGreaterThanOrEqual(30);
      }
    }
  });

  it('timed levels: target reachable at 2s per answer', () => {
    for (const level of ALL_LEVELS) {
      if (level.timeLimit === undefined) continue;
      const maxAnswerable = level.timeLimit / 2;
      expect(level.targetScore, `level ${level.id}`).toBeLessThanOrEqual(maxAnswerable);
    }
  });

  it('unlock chain: every level except #1 requires previous level', () => {
    for (const level of ALL_LEVELS) {
      if (level.id === 1) expect(level.unlockRequirement).toBeUndefined();
      else expect(level.unlockRequirement, `level ${level.id}`).toBe(level.id - 1);
    }
  });

  it('generator produces 50 valid questions for every level', () => {
    for (const level of ALL_LEVELS) {
      const rng = mulberry32(level.id);
      for (let i = 0; i < 50; i++) {
        const question = generateQuestion(level.generationParams, rng);
        expect(Number.isInteger(question.answer), `level ${level.id}: ${question.question}`).toBe(true);
        expect(question.answer, `level ${level.id}: ${question.question}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('titles, tips, descriptions non-empty', () => {
    for (const level of ALL_LEVELS) {
      expect(level.title.length, `level ${level.id}`).toBeGreaterThan(0);
      expect(level.tip.length, `level ${level.id}`).toBeGreaterThan(0);
      expect(level.description.length, `level ${level.id}`).toBeGreaterThan(0);
    }
  });

  it('helpers work', () => {
    expect(getLevelById(1)?.title).toContain('First Steps');
    expect(getLevelsByWorld(3)).toHaveLength(50);
    expect(getNextLevel(50)?.id).toBe(51);
    expect(getNextLevel(400)).toBeUndefined();
    expect(WORLDS_META).toHaveLength(8);
  });
});
