import type { Joker } from '../types/game';

export const ALL_JOKERS: Joker[] = [
  {
    id: 'high-roller',
    name: 'The High Roller',
    description: 'Blackjack pays 4:1 instead of 3:2',
    rarity: 'rare',
    emoji: '🎰',
    effect: { blackjackMultiplier: 1.6 }, // multiplied on top of 2.5x base → ~4:1
  },
  {
    id: 'lucky-ace',
    name: 'Lucky Ace',
    description: 'Aces always count as 11 without busting',
    rarity: 'uncommon',
    emoji: '🍀',
    effect: { aceAlwaysOptimal: true },
  },
  {
    id: 'gambler',
    name: 'The Gambler',
    description: 'Each Double Down adds +15% to your total winnings',
    rarity: 'uncommon',
    emoji: '🎲',
    effect: { doubleBonus: 0.15 },
  },
  {
    id: 'mirror-card',
    name: 'Mirror Card',
    description: 'Once per round, copy your best card for +5 chips bonus',
    rarity: 'common',
    emoji: '🪞',
    effect: { hasMirrorCard: true },
  },
  {
    id: 'chip-magnet',
    name: 'Chip Magnet',
    description: 'Win streak of 3+: multiply next win by 2x',
    rarity: 'rare',
    emoji: '🧲',
    effect: { streakBonusThreshold: 3, streakBonusMultiplier: 2 },
  },
  {
    id: 'iron-will',
    name: 'Iron Will',
    description: 'Push (tie) pays back 1.5x your bet instead of 1x',
    rarity: 'common',
    emoji: '🛡️',
    effect: { winMultiplier: 1.0 }, // handled specifically for pushes
  },
  {
    id: 'golden-touch',
    name: 'Golden Touch',
    description: 'All wins pay an extra 10% bonus on top',
    rarity: 'uncommon',
    emoji: '✨',
    effect: { winMultiplier: 1.1 },
  },
  {
    id: 'wild-card',
    name: 'Wild Card',
    description: 'Once per game, turn a losing hand into a push',
    rarity: 'rare',
    emoji: '🃏',
    effect: {},
  },
];

/** Returns a shuffled subset of jokers for the selection screen */
export function getJokerPool(count = 5): Joker[] {
  const shuffled = [...ALL_JOKERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
