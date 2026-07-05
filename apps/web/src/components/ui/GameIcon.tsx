import React from 'react';

const EMOJI_MAP: Record<string, string> = {
  '✅': 'check',
  '✓': 'check',
  '📅': 'calendar',
  '🗓': 'calendar',
  '🗺': 'map',
  '🔒': 'lock',
  '🔄': 'refresh',
  '💡': 'lightbulb',
  '👑': 'crown',
  '💪': 'muscle',
  '🎁': 'gift',
  '🎉': 'party',
  '🎊': 'party',
  '⚡': 'zap',
  '😔': 'sad',
  '🏠': 'home',
  '❓': 'question',
  '👤': 'user',
  '🌍': 'globe',
  '🔀': 'shuffle',
  '⚙': 'gear',
  '🎮': 'controller',
  '🕹': 'controller',
  '⚔': 'swords',
  '🗡': 'swords',
  '💎': 'diamond',
  '⭐': 'star',
  '🌟': 'star',
  '✨': 'star',
  '💫': 'star',
  '🔥': 'fire',
  '🧠': 'brain',
  '💯': '100',
  '🎯': 'target',
  '🏅': 'medal',
  '🥇': 'medal',
  '🎖': 'medal',
  '🏆': 'medal',
  '🚀': 'rocket',
  '➕': 'plus',
  '➖': 'minus',
  '✖': 'multiply',
  '➗': 'divide',
  '🐉': 'party', 
  '🌤': 'star', 
  '🌙': 'star', 
  '🎰': 'calendar', 
  '🤖': 'brain', 
  '🎓': 'target', 
  '🥊': 'multiply', 
  '👊': 'multiply', 
  '🔨': 'multiply', 
  '🥋': 'multiply', 
  '🏎': 'rocket', 
  '🦉': 'brain', 
  '🐦': 'brain', 
};

interface GameIconProps {
  emoji: string;
  className?: string;
  alt?: string;
}

export function GameIcon({ emoji, className = '', alt }: GameIconProps) {
  // Strip variation selectors from emoji to ensure consistent matching
  const cleanEmoji = emoji.replace(/[\uFE00-\uFE0F]/g, '');
  const iconName = EMOJI_MAP[cleanEmoji] || EMOJI_MAP[emoji];

  if (iconName) {
    return (
      <img 
        src={`/icons/${iconName}.svg`}
        alt={alt || emoji}
        className={`inline-block object-contain ${className}`}
        style={{ width: '1em', height: '1em', verticalAlign: '-0.125em' }}
      />
    );
  }

  // Fallback to text if no mapped SVG
  return <span className={className}>{emoji}</span>;
}
