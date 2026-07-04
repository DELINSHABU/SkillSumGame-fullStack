import type { GenerationParams, OperationType, Question, SkillType } from './types';
import { defaultRng, pick, randInt, type Rng } from './rng';

// Question generation — one switch per SkillType. NEVER eval.
// Answers are always non-negative integers; division is always exact.

export function generateQuestion(params: GenerationParams, rng: Rng = defaultRng): Question {
  const skill = params.skill === 'random' ? pickRandomSkill(params, rng) : params.skill;
  const [min, max] = params.numberRange;

  switch (skill) {
    case 'makeTen': {
      // "3 + ? = 10" style asked as complement: a + b where a+b = 10
      const a = randInt(rng, 1, 9);
      return q(`${a} + ?`, 10 - a, '+', 'makeTen', `${a} + ? = 10`);
    }
    case 'addTen': {
      const a = randInt(rng, Math.max(min, 1), Math.max(max - 10, Math.max(min, 1)));
      return q(`${a} + 10`, a + 10, '+', 'addTen');
    }
    case 'addNine': {
      const a = randInt(rng, Math.max(min, 2), Math.max(max - 9, Math.max(min, 2)));
      return q(`${a} + 9`, a + 9, '+', 'addNine');
    }
    case 'addEight': {
      const a = randInt(rng, Math.max(min, 3), Math.max(max - 8, Math.max(min, 3)));
      return q(`${a} + 8`, a + 8, '+', 'addEight');
    }
    case 'doubles': {
      const a = randInt(rng, Math.max(min, 1), Math.min(max, 20));
      return q(`${a} + ${a}`, a * 2, '+', 'doubles');
    }
    case 'nearDoubles': {
      const a = randInt(rng, Math.max(min, 2), Math.min(max, 19));
      const b = a + 1;
      return rng() < 0.5
        ? q(`${a} + ${b}`, a + b, '+', 'nearDoubles')
        : q(`${b} + ${a}`, a + b, '+', 'nearDoubles');
    }
    case 'subtractTen': {
      const a = randInt(rng, Math.max(min, 11), Math.max(max, 11));
      return q(`${a} - 10`, a - 10, '-', 'subtractTen');
    }
    case 'subtractNine': {
      const a = randInt(rng, Math.max(min, 10), Math.max(max, 10));
      return q(`${a} - 9`, a - 9, '-', 'subtractNine');
    }
    case 'multiplyByTwo': {
      const a = randInt(rng, Math.max(min, 1), Math.min(max, 50));
      return orderByPosition(rng, a, 2, 'multiplyByTwo');
    }
    case 'multiplyByFive': {
      const a = randInt(rng, Math.max(min, 1), Math.min(max, 20));
      return orderByPosition(rng, a, 5, 'multiplyByFive');
    }
    case 'multiplyByTen': {
      const a = randInt(rng, Math.max(min, 1), Math.min(max, 99));
      return orderByPosition(rng, a, 10, 'multiplyByTen');
    }
    case 'multiplyByEleven': {
      const a = randInt(rng, Math.max(min, 1), Math.min(max, 12));
      return orderByPosition(rng, a, 11, 'multiplyByEleven');
    }
    case 'integerDivision': {
      // Build product first so the answer is always an exact integer.
      const divisor = randInt(rng, 2, Math.min(Math.max(max, 2), 12));
      const quotient = randInt(rng, 1, Math.min(Math.max(max, 2), 12));
      return q(`${divisor * quotient} ÷ ${divisor}`, quotient, '÷', 'integerDivision');
    }
    case 'random':
      // Unreachable: resolved by pickRandomSkill above; fall through defensively.
      return basicArithmetic(params, rng);
    default: {
      const exhaustive: never = skill;
      throw new Error(`Unknown skill: ${String(exhaustive)}`);
    }
  }
}

/** Plain arithmetic question from operators + range (used for skill: 'random'). */
function basicArithmetic(params: GenerationParams, rng: Rng): Question {
  const op = pick(rng, params.operators);
  const [min, max] = params.numberRange;
  switch (op) {
    case '+': {
      const a = params.fixedOperand ?? randInt(rng, min, max);
      const b = randInt(rng, min, max);
      return q(`${a} + ${b}`, a + b, '+', 'random');
    }
    case '-': {
      // Ensure non-negative result.
      const x = randInt(rng, min, max);
      const y = randInt(rng, min, max);
      const [a, b] = x >= y ? [x, y] : [y, x];
      return q(`${a} - ${b}`, a - b, '-', 'random');
    }
    case '×': {
      const cap = Math.min(max, 12);
      const a = randInt(rng, Math.max(min, 1), Math.max(cap, 1));
      const b = randInt(rng, 2, 12);
      return q(`${a} × ${b}`, a * b, '×', 'random');
    }
    case '÷': {
      const divisor = randInt(rng, 2, 12);
      const quotient = randInt(rng, 1, Math.min(Math.max(max, 2), 12));
      return q(`${divisor * quotient} ÷ ${divisor}`, quotient, '÷', 'random');
    }
    default: {
      const exhaustive: never = op;
      throw new Error(`Unknown operator: ${String(exhaustive)}`);
    }
  }
}

/** For skill:'random', restrict basicArithmetic to the level's operators. */
function pickRandomSkill(_params: GenerationParams, _rng: Rng): SkillType {
  return 'random';
}

function orderByPosition(rng: Rng, a: number, fixed: number, skill: SkillType): Question {
  return rng() < 0.5
    ? q(`${a} × ${fixed}`, a * fixed, '×', skill)
    : q(`${fixed} × ${a}`, a * fixed, '×', skill);
}

function q(
  text: string,
  answer: number,
  operator: OperationType,
  skill: SkillType,
  display?: string
): Question {
  return { question: display ?? text, answer, operator, skill };
}
