import type { Achievement } from './types';

// 50 achievements. Unlock state lives in the DB (user_achievements), not here.

export const ACHIEVEMENTS_LIST: Achievement[] = [
  // First steps (3)
  { id: 'first_answer', name: 'First Answer', description: 'Answer your first question', icon: '🎯', category: 'firstSteps', condition: { type: 'totalCorrect', threshold: 1 } },
  { id: 'first_level', name: 'Level Up!', description: 'Complete your first level', icon: '🏅', category: 'firstSteps', condition: { type: 'levelComplete', levelId: 1 } },
  { id: 'first_world', name: 'World 1 Done', description: 'Complete all levels in World 1', icon: '🌍', category: 'firstSteps', condition: { type: 'worldComplete', worldId: 1 } },

  // Speed (3)
  { id: 'speed_1s', name: 'Lightning Fast', description: 'Average under 1 second per answer in a session', icon: '⚡', category: 'speed', condition: { type: 'speed', threshold: 1000 } },
  { id: 'speed_1_5s', name: 'Blazing', description: 'Average under 1.5 seconds per answer', icon: '🔥', category: 'speed', condition: { type: 'speed', threshold: 1500 } },
  { id: 'speed_2s', name: 'Quick Thinker', description: 'Average under 2 seconds per answer', icon: '🚀', category: 'speed', condition: { type: 'speed', threshold: 2000 } },

  // Accuracy (2)
  { id: 'perfect_session', name: 'Perfect!', description: 'Complete a session with 100% accuracy', icon: '💯', category: 'accuracy', condition: { type: 'accuracy', threshold: 100 } },
  { id: 'accuracy_95', name: 'Sharp Mind', description: 'Complete a session with 95%+ accuracy', icon: '🎯', category: 'accuracy', condition: { type: 'accuracy', threshold: 95 } },

  // Answer streaks (5)
  { id: 'streak_5', name: 'On Fire!', description: 'Get 5 correct in a row', icon: '🔥', category: 'streaks', condition: { type: 'streak', threshold: 5 } },
  { id: 'streak_10', name: 'Unstoppable', description: 'Get 10 correct in a row', icon: '💥', category: 'streaks', condition: { type: 'streak', threshold: 10 } },
  { id: 'streak_15', name: 'Rampage', description: 'Get 15 correct in a row', icon: '🌊', category: 'streaks', condition: { type: 'streak', threshold: 15 } },
  { id: 'streak_25', name: 'Legendary', description: 'Get 25 correct in a row', icon: '👑', category: 'streaks', condition: { type: 'streak', threshold: 25 } },
  { id: 'streak_50', name: 'Mythic', description: 'Get 50 correct in a row', icon: '🐉', category: 'streaks', condition: { type: 'streak', threshold: 50 } },

  // Daily streaks (5)
  { id: 'daily_3', name: 'Warming Up', description: 'Maintain a 3-day streak', icon: '🌤️', category: 'streaks', condition: { type: 'dailyStreak', threshold: 3 } },
  { id: 'daily_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '📅', category: 'streaks', condition: { type: 'dailyStreak', threshold: 7 } },
  { id: 'daily_14', name: 'Fortnight Fighter', description: 'Maintain a 14-day streak', icon: '🗓️', category: 'streaks', condition: { type: 'dailyStreak', threshold: 14 } },
  { id: 'daily_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🌙', category: 'streaks', condition: { type: 'dailyStreak', threshold: 30 } },
  { id: 'daily_100', name: 'Centurion', description: 'Maintain a 100-day streak', icon: '🏆', category: 'streaks', condition: { type: 'dailyStreak', threshold: 100 } },

  // Totals (6)
  { id: 'total_100', name: 'Century', description: 'Answer 100 questions correctly', icon: '💯', category: 'mastery', condition: { type: 'totalCorrect', threshold: 100 } },
  { id: 'total_500', name: 'Half Grand', description: 'Answer 500 questions correctly', icon: '🎰', category: 'mastery', condition: { type: 'totalCorrect', threshold: 500 } },
  { id: 'total_1000', name: 'Thousand Club', description: 'Answer 1,000 questions correctly', icon: '🥇', category: 'mastery', condition: { type: 'totalCorrect', threshold: 1000 } },
  { id: 'total_5000', name: 'Five Grand', description: 'Answer 5,000 questions correctly', icon: '💎', category: 'mastery', condition: { type: 'totalCorrect', threshold: 5000 } },
  { id: 'total_10000', name: 'Ten Thousand!', description: 'Answer 10,000 questions correctly', icon: '🌟', category: 'mastery', condition: { type: 'totalCorrect', threshold: 10000 } },
  { id: 'total_25000', name: 'Math Machine', description: 'Answer 25,000 questions correctly', icon: '🤖', category: 'elite', condition: { type: 'totalCorrect', threshold: 25000 } },

  // Session counts (3)
  { id: 'sessions_10', name: 'Regular', description: 'Complete 10 sessions', icon: '🎮', category: 'mastery', condition: { type: 'sessionCount', threshold: 10 } },
  { id: 'sessions_100', name: 'Devoted', description: 'Complete 100 sessions', icon: '🕹️', category: 'mastery', condition: { type: 'sessionCount', threshold: 100 } },
  { id: 'sessions_500', name: 'Obsessed', description: 'Complete 500 sessions', icon: '🎖️', category: 'elite', condition: { type: 'sessionCount', threshold: 500 } },

  // World completion (7 — world 1 covered by first_world)
  { id: 'world_2', name: 'Subtraction Star', description: 'Complete all levels in World 2', icon: '➖', category: 'mastery', condition: { type: 'worldComplete', worldId: 2 } },
  { id: 'world_3', name: 'Times Table Titan', description: 'Complete all levels in World 3', icon: '✖️', category: 'mastery', condition: { type: 'worldComplete', worldId: 3 } },
  { id: 'world_4', name: 'Division Dominator', description: 'Complete all levels in World 4', icon: '➗', category: 'mastery', condition: { type: 'worldComplete', worldId: 4 } },
  { id: 'world_5', name: 'Operation Overlord', description: 'Complete all levels in World 5', icon: '🔀', category: 'mastery', condition: { type: 'worldComplete', worldId: 5 } },
  { id: 'world_6', name: 'Number Whisperer', description: 'Complete all levels in World 6', icon: '🧠', category: 'mastery', condition: { type: 'worldComplete', worldId: 6 } },
  { id: 'world_7', name: 'Speed Demon', description: 'Complete all levels in World 7', icon: '⚡', category: 'elite', condition: { type: 'worldComplete', worldId: 7 } },
  { id: 'world_8', name: 'Elite Graduate', description: 'Complete all levels in World 8', icon: '🎓', category: 'elite', condition: { type: 'worldComplete', worldId: 8 } },

  // Boss kills (8)
  { id: 'boss_50', name: 'Addition Master', description: 'Beat the World 1 boss', icon: '🥊', category: 'mastery', condition: { type: 'levelComplete', levelId: 50 } },
  { id: 'boss_100', name: 'Subtraction Slayer', description: 'Beat the World 2 boss', icon: '⚔️', category: 'mastery', condition: { type: 'levelComplete', levelId: 100 } },
  { id: 'boss_150', name: 'Multiplication Monarch', description: 'Beat the World 3 boss', icon: '👊', category: 'mastery', condition: { type: 'levelComplete', levelId: 150 } },
  { id: 'boss_200', name: 'Division Destroyer', description: 'Beat the World 4 boss', icon: '🗡️', category: 'mastery', condition: { type: 'levelComplete', levelId: 200 } },
  { id: 'boss_250', name: 'Mixed Mauler', description: 'Beat the World 5 boss', icon: '🔨', category: 'mastery', condition: { type: 'levelComplete', levelId: 250 } },
  { id: 'boss_300', name: 'Pattern Puncher', description: 'Beat the World 6 boss', icon: '🥋', category: 'mastery', condition: { type: 'levelComplete', levelId: 300 } },
  { id: 'boss_350', name: 'Velocity Victor', description: 'Beat the World 7 boss', icon: '🏎️', category: 'elite', condition: { type: 'levelComplete', levelId: 350 } },
  { id: 'level_400', name: 'Grand Master', description: 'Complete level 400', icon: '👑', category: 'elite', condition: { type: 'levelComplete', levelId: 400 } },

  // Account levels (5)
  { id: 'acc_level_5', name: 'Rising Star', description: 'Reach account level 5', icon: '✨', category: 'mastery', condition: { type: 'accountLevel', threshold: 5 } },
  { id: 'acc_level_10', name: 'Veteran', description: 'Reach account level 10', icon: '⭐', category: 'mastery', condition: { type: 'accountLevel', threshold: 10 } },
  { id: 'acc_level_25', name: 'Prodigy', description: 'Reach account level 25', icon: '💫', category: 'mastery', condition: { type: 'accountLevel', threshold: 25 } },
  { id: 'acc_level_50', name: 'Expert', description: 'Reach account level 50', icon: '🌟', category: 'elite', condition: { type: 'accountLevel', threshold: 50 } },
  { id: 'acc_level_100', name: 'Legend', description: 'Reach account level 100', icon: '🏅', category: 'elite', condition: { type: 'accountLevel', threshold: 100 } },

  // Hidden (3)
  { id: 'night_owl', name: 'Night Owl', description: '???', icon: '🦉', category: 'hidden', secret: true, condition: { type: 'custom', customId: 'night_owl' } },
  { id: 'early_bird', name: 'Early Bird', description: '???', icon: '🐦', category: 'hidden', secret: true, condition: { type: 'custom', customId: 'early_bird' } },
  { id: 'all_worlds', name: 'World Traveler', description: 'Complete every world', icon: '🗺️', category: 'hidden', secret: true, condition: { type: 'custom', customId: 'all_worlds' } },
];

export interface AchievementContext {
  totalCorrect: number;
  sessionCount: number;
  sessionAccuracy: number;
  sessionMaxStreak: number;
  sessionAvgMs: number;
  accountLevel: number;
  dailyStreak: number;
  /** Level completed this session (stars > 0), if any. */
  completedLevelId?: number;
  /** World fully completed as of this session, if any. */
  completedWorldId?: number;
  /** Local hour 0-23 when the session happened (client timezone). */
  localHour?: number;
  /** Set of world ids fully completed overall. */
  completedWorldIds?: number[];
  /** Achievement ids already unlocked. */
  alreadyUnlocked: Set<string>;
}

export function checkAchievements(context: AchievementContext): string[] {
  const newlyUnlocked: string[] = [];

  for (const a of ACHIEVEMENTS_LIST) {
    if (context.alreadyUnlocked.has(a.id)) continue;

    let unlock = false;
    const c = a.condition;
    switch (c.type) {
      case 'totalCorrect':
        unlock = context.totalCorrect >= (c.threshold ?? Infinity);
        break;
      case 'accuracy':
        unlock = context.sessionAccuracy >= (c.threshold ?? Infinity) && context.sessionCount > 0;
        break;
      case 'streak':
        unlock = context.sessionMaxStreak >= (c.threshold ?? Infinity);
        break;
      case 'speed':
        unlock = context.sessionAvgMs > 0 && context.sessionAvgMs <= (c.threshold ?? 0);
        break;
      case 'accountLevel':
        unlock = context.accountLevel >= (c.threshold ?? Infinity);
        break;
      case 'dailyStreak':
        unlock = context.dailyStreak >= (c.threshold ?? Infinity);
        break;
      case 'sessionCount':
        unlock = context.sessionCount >= (c.threshold ?? Infinity);
        break;
      case 'levelComplete':
        unlock = context.completedLevelId === c.levelId;
        break;
      case 'worldComplete':
        unlock = context.completedWorldId === c.worldId;
        break;
      case 'custom':
        switch (c.customId) {
          case 'night_owl':
            unlock = context.localHour !== undefined && context.localHour < 4;
            break;
          case 'early_bird':
            unlock = context.localHour !== undefined && context.localHour >= 4 && context.localHour < 7;
            break;
          case 'all_worlds':
            unlock = (context.completedWorldIds?.length ?? 0) >= 8;
            break;
          default:
            unlock = false;
        }
        break;
      default: {
        const exhaustive: never = c.type;
        throw new Error(`Unknown condition: ${String(exhaustive)}`);
      }
    }

    if (unlock) newlyUnlocked.push(a.id);
  }

  return newlyUnlocked;
}
