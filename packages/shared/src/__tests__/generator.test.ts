import { describe, expect, it } from 'vitest';
import { generateQuestion } from '../generator';
import { mulberry32 } from '../rng';
import type { GenerationParams, SkillType } from '../types';

const SKILLS: SkillType[] = [
  'makeTen', 'addTen', 'addNine', 'addEight', 'doubles', 'nearDoubles',
  'subtractTen', 'subtractNine', 'multiplyByTwo', 'multiplyByFive',
  'multiplyByTen', 'multiplyByEleven', 'integerDivision',
];

function params(skill: SkillType, range: [number, number] = [1, 50]): GenerationParams {
  return { operators: ['+', '-', '×', '÷'], numberRange: range, skill };
}

describe('generateQuestion fuzz — every skill', () => {
  for (const skill of SKILLS) {
    it(`${skill}: 1000 questions all valid`, () => {
      const rng = mulberry32(42);
      for (let i = 0; i < 1000; i++) {
        const question = generateQuestion(params(skill), rng);
        expect(Number.isInteger(question.answer)).toBe(true);
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.question.length).toBeGreaterThan(0);
      }
    });
  }

  it('makeTen: complement always sums to 10', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const question = generateQuestion(params('makeTen'), rng);
      const shown = Number(question.question.split(' ')[0]);
      expect(shown + question.answer).toBe(10);
    }
  });

  it('addNine: answer = operand + 9, question contains "+ 9"', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const question = generateQuestion(params('addNine', [11, 60]), rng);
      expect(question.question).toContain('+ 9');
      const a = Number(question.question.split(' ')[0]);
      expect(question.answer).toBe(a + 9);
    }
  });

  it('doubles: both operands equal', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const question = generateQuestion(params('doubles', [1, 9]), rng);
      const [a, , b] = question.question.split(' ');
      expect(a).toBe(b);
      expect(question.answer).toBe(Number(a) * 2);
    }
  });

  it('subtraction skills: never negative', () => {
    const rng = mulberry32(7);
    for (const skill of ['subtractTen', 'subtractNine'] as const) {
      for (let i = 0; i < 500; i++) {
        const question = generateQuestion(params(skill, [11, 99]), rng);
        expect(question.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('integerDivision: exact division, answer is quotient', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const question = generateQuestion(params('integerDivision', [1, 12]), rng);
      const [dividend, , divisor] = question.question.split(' ');
      expect(Number(dividend) / Number(divisor)).toBe(question.answer);
      expect(Number.isInteger(question.answer)).toBe(true);
    }
  });

  it('random skill: respects operators — plus-only never emits other ops', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const question = generateQuestion(
        { operators: ['+'], numberRange: [1, 20], skill: 'random' },
        rng
      );
      expect(question.operator).toBe('+');
      const [a, , b] = question.question.split(' ');
      expect(Number(a) + Number(b)).toBe(question.answer);
    }
  });

  it('random skill: subtraction results non-negative', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const question = generateQuestion(
        { operators: ['-'], numberRange: [1, 50], skill: 'random' },
        rng
      );
      expect(question.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it('random skill: division always exact', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const question = generateQuestion(
        { operators: ['÷'], numberRange: [1, 50], skill: 'random' },
        rng
      );
      const [dividend, , divisor] = question.question.split(' ');
      expect(Number(dividend) % Number(divisor)).toBe(0);
    }
  });

  it('deterministic under same seed', () => {
    const a = generateQuestion(params('addNine', [11, 60]), mulberry32(123));
    const b = generateQuestion(params('addNine', [11, 60]), mulberry32(123));
    expect(a).toEqual(b);
  });
});
