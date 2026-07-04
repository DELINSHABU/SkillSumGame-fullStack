import type { Level } from '../types';
import { buildWorld, w, type WorldSpec } from './builder';

const NAME = 'World 1: Addition Foundation';

const spec: WorldSpec = {
  id: 1,
  name: NAME,
  shortName: 'Addition',
  operators: ['+'],
  skillCycle: ['makeTen', 'doubles', 'nearDoubles', 'addTen', 'addNine', 'addEight', 'random'],
  ranges: {
    intro: [1, 5],
    early: [1, 20],
    mid: [10, 60],
    late: [10, 80],
    speed: [1, 60],
    boss: [1, 99],
  },
  worldTip: 'Pick the right trick: make ten, use doubles, or add 10 and adjust.',
};

// First ten levels hand-tuned to match the master guide (lines 749-897).
const overrides: Record<number, Level> = {
  1: {
    id: w(1, 1), worldId: 1, worldName: NAME, type: 'intro',
    title: 'First Steps: Adding Small Numbers',
    description: "Welcome! Let's start with the most basic addition.",
    tip: 'Count up from the bigger number. For 3 + 5, start at 5 and count up 3: 6, 7, 8.',
    tipDiagram: {
      steps: ['Look at the bigger number', 'Count up from it', "That's your answer!"],
      example: '3 + 5 = ?',
      solution: ['Start at 5', 'Count: 6, 7, 8', 'Answer: 8'],
    },
    targetScore: 5, star1Score: 3, star2Score: 4, star3Score: 5,
    generationParams: { operators: ['+'], numberRange: [1, 5], skill: 'random' },
  },
  2: {
    id: w(1, 2), worldId: 1, worldName: NAME, type: 'intro',
    title: 'Making Ten',
    description: 'Knowing which numbers add to exactly 10 is one of the most powerful skills.',
    tip: "Memorize these pairs: 1+9, 2+8, 3+7, 4+6, 5+5. These are your 'Make 10' friends!",
    tipDiagram: {
      steps: ['1+9=10', '2+8=10', '3+7=10', '4+6=10', '5+5=10'],
      example: '3 + ? = 10',
      solution: ['3 + 7 = 10', 'The missing number is 7'],
    },
    targetScore: 8, star1Score: 4, star2Score: 6, star3Score: 8,
    generationParams: { operators: ['+'], numberRange: [1, 9], skill: 'makeTen' },
    unlockRequirement: w(1, 1),
  },
  3: {
    id: w(1, 3), worldId: 1, worldName: NAME, type: 'standard',
    title: 'Adding to Single Digits',
    description: 'Practice adding any two single-digit numbers confidently.',
    tip: 'Always start counting from the BIGGER number. It saves steps!',
    targetScore: 10, star1Score: 6, star2Score: 8, star3Score: 10, timeLimit: 90,
    generationParams: { operators: ['+'], numberRange: [1, 9], skill: 'random' },
    unlockRequirement: w(1, 2),
  },
  4: {
    id: w(1, 4), worldId: 1, worldName: NAME, type: 'standard',
    title: 'Doubles',
    description: 'Adding a number to itself — your first mental shortcut!',
    tip: 'Memorize these: 1+1=2 up to 9+9=18.',
    tipDiagram: {
      steps: ['A double is a number + itself', 'Think of it as 2 groups'],
      example: '7 + 7 = ?',
      solution: ['7 + 7 = 14', 'Two groups of 7'],
    },
    targetScore: 10, star1Score: 6, star2Score: 8, star3Score: 10, timeLimit: 90,
    generationParams: { operators: ['+'], numberRange: [1, 9], skill: 'doubles' },
    unlockRequirement: w(1, 3),
  },
  5: {
    id: w(1, 5), worldId: 1, worldName: NAME, type: 'standard',
    title: 'Near Doubles',
    description: 'What if the numbers are almost the same? Use your doubles!',
    tip: "For 7+8: think '7+7=14, then add 1 more = 15'.",
    tipDiagram: {
      steps: ['Spot that the numbers are close', 'Use the double you know', 'Add the difference'],
      example: '7 + 8 = ?',
      solution: ['7 + 7 = 14 (known double)', '14 + 1 = 15', 'Answer: 15'],
    },
    targetScore: 10, star1Score: 6, star2Score: 8, star3Score: 10, timeLimit: 90,
    generationParams: { operators: ['+'], numberRange: [3, 9], skill: 'nearDoubles' },
    unlockRequirement: w(1, 4),
  },
  6: {
    id: w(1, 6), worldId: 1, worldName: NAME, type: 'standard',
    title: "The 'Adding 10' Rule",
    description: 'Adding 10 is one of the simplest tricks. Master it!',
    tip: 'To add 10, just increase the TENS digit by 1. 23+10=33.',
    tipDiagram: {
      steps: ['Find the tens digit', 'Add 1 to it', 'Ones digit stays the same'],
      example: '47 + 10 = ?',
      solution: ['Tens digit is 4 → becomes 5', 'Ones digit stays 7', 'Answer: 57'],
    },
    targetScore: 12, star1Score: 7, star2Score: 10, star3Score: 12, timeLimit: 75,
    generationParams: { operators: ['+'], numberRange: [10, 60], skill: 'addTen' },
    unlockRequirement: w(1, 5),
  },
  7: {
    id: w(1, 7), worldId: 1, worldName: NAME, type: 'standard',
    title: "The 'Adding 9' Trick",
    description: '9 is just one less than 10. Use that!',
    tip: 'To add 9: add 10 first, then subtract 1. 27+9 = 27+10-1 = 36.',
    tipDiagram: {
      steps: ['Add 10 instead of 9', 'Then subtract 1'],
      example: '34 + 9 = ?',
      solution: ['34 + 10 = 44 (easy!)', '44 - 1 = 43', 'Answer: 43'],
    },
    targetScore: 12, star1Score: 7, star2Score: 10, star3Score: 12, timeLimit: 75,
    generationParams: { operators: ['+'], numberRange: [11, 60], skill: 'addNine' },
    unlockRequirement: w(1, 6),
  },
  8: {
    id: w(1, 8), worldId: 1, worldName: NAME, type: 'standard',
    title: "The 'Adding 8' Trick",
    description: 'Same idea as adding 9, but subtract 2.',
    tip: 'To add 8: add 10, then subtract 2. 35+8 = 35+10-2 = 43.',
    tipDiagram: {
      steps: ['Add 10 instead of 8', 'Then subtract 2'],
      example: '27 + 8 = ?',
      solution: ['27 + 10 = 37', '37 - 2 = 35', 'Answer: 35'],
    },
    targetScore: 12, star1Score: 7, star2Score: 10, star3Score: 12, timeLimit: 75,
    generationParams: { operators: ['+'], numberRange: [11, 60], skill: 'addEight' },
    unlockRequirement: w(1, 7),
  },
  9: {
    id: w(1, 9), worldId: 1, worldName: NAME, type: 'standard',
    title: 'Mixed: 8s, 9s, and 10s',
    description: "Now let's mix all three tricks together!",
    tip: 'Before answering, decide: am I adding 8 (+10, -2), 9 (+10, -1), or 10?',
    targetScore: 14, star1Score: 8, star2Score: 11, star3Score: 14, timeLimit: 60,
    generationParams: { operators: ['+'], numberRange: [11, 60], skill: 'random' },
    unlockRequirement: w(1, 8),
  },
  10: {
    id: w(1, 10), worldId: 1, worldName: NAME, type: 'boss',
    title: 'BOSS: Addition Basics Champion',
    description: "Show what you've learned so far! This is your first boss level.",
    tip: "Stay calm. Use the trick that fits each question. You've got this!",
    targetScore: 20, star1Score: 10, star2Score: 15, star3Score: 20, timeLimit: 90,
    generationParams: { operators: ['+'], numberRange: [1, 60], skill: 'random' },
    unlockRequirement: w(1, 9),
  },
  50: {
    id: w(1, 50), worldId: 1, worldName: NAME, type: 'boss',
    title: 'WORLD BOSS: Addition Master',
    description: "The final test for World 1. Prove you've mastered all addition tricks!",
    tip: 'Every trick you have learned is fair game. Trust your instincts.',
    targetScore: 30, star1Score: 15, star2Score: 22, star3Score: 30, timeLimit: 120,
    generationParams: { operators: ['+'], numberRange: [1, 99], skill: 'random' },
    unlockRequirement: w(1, 49),
  },
};

export const world1Levels: Level[] = buildWorld(spec, overrides);
