import type { Card, Hand } from '../types/game';
import { handValue } from './gameLogic';

export type StrategyAction = 'H' | 'S' | 'D' | 'P';

/**
 * Maps a dealer upcard rank to a lookup key.
 * 10, J, Q, K all map to 'T'.
 */
function dealerKey(rank: string): string {
  if (['10', 'J', 'Q', 'K'].includes(rank)) return 'T';
  return rank;
}

/**
 * Hard totals strategy (player has no usable ace).
 * Keys: player total (5–20). Values: map of dealer upcard → action.
 */
const HARD: Record<number, Record<string, StrategyAction>> = {
  5:  { '2':'H','3':'H','4':'H','5':'H','6':'H','7':'H','8':'H','9':'H','T':'H','A':'H' },
  6:  { '2':'H','3':'H','4':'H','5':'H','6':'H','7':'H','8':'H','9':'H','T':'H','A':'H' },
  7:  { '2':'H','3':'H','4':'H','5':'H','6':'H','7':'H','8':'H','9':'H','T':'H','A':'H' },
  8:  { '2':'H','3':'H','4':'H','5':'H','6':'H','7':'H','8':'H','9':'H','T':'H','A':'H' },
  9:  { '2':'H','3':'D','4':'D','5':'D','6':'D','7':'H','8':'H','9':'H','T':'H','A':'H' },
  10: { '2':'D','3':'D','4':'D','5':'D','6':'D','7':'D','8':'D','9':'D','T':'H','A':'H' },
  11: { '2':'D','3':'D','4':'D','5':'D','6':'D','7':'D','8':'D','9':'D','T':'D','A':'D' },
  12: { '2':'H','3':'H','4':'S','5':'S','6':'S','7':'H','8':'H','9':'H','T':'H','A':'H' },
  13: { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'H','8':'H','9':'H','T':'H','A':'H' },
  14: { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'H','8':'H','9':'H','T':'H','A':'H' },
  15: { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'H','8':'H','9':'H','T':'H','A':'H' },
  16: { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'H','8':'H','9':'H','T':'H','A':'H' },
  17: { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'S','8':'S','9':'S','T':'S','A':'S' },
  18: { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'S','8':'S','9':'S','T':'S','A':'S' },
  19: { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'S','8':'S','9':'S','T':'S','A':'S' },
  20: { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'S','8':'S','9':'S','T':'S','A':'S' },
};

/**
 * Soft totals (player has a usable ace, value shown is total including ace as 11).
 * Keys: soft total (13=A2 up to 21=A10).
 */
const SOFT: Record<number, Record<string, StrategyAction>> = {
  13: { '2':'H','3':'H','4':'H','5':'D','6':'D','7':'H','8':'H','9':'H','T':'H','A':'H' },
  14: { '2':'H','3':'H','4':'H','5':'D','6':'D','7':'H','8':'H','9':'H','T':'H','A':'H' },
  15: { '2':'H','3':'H','4':'D','5':'D','6':'D','7':'H','8':'H','9':'H','T':'H','A':'H' },
  16: { '2':'H','3':'H','4':'D','5':'D','6':'D','7':'H','8':'H','9':'H','T':'H','A':'H' },
  17: { '2':'H','3':'D','4':'D','5':'D','6':'D','7':'H','8':'H','9':'H','T':'H','A':'H' },
  18: { '2':'S','3':'D','4':'D','5':'D','6':'D','7':'S','8':'S','9':'H','T':'H','A':'H' },
  19: { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'S','8':'S','9':'S','T':'S','A':'S' },
  20: { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'S','8':'S','9':'S','T':'S','A':'S' },
};

/**
 * Pair splits. Key is the card rank.
 * J/Q/K treated as 'T'.
 */
const PAIRS: Record<string, Record<string, StrategyAction>> = {
  'A': { '2':'P','3':'P','4':'P','5':'P','6':'P','7':'P','8':'P','9':'P','T':'P','A':'P' },
  '2': { '2':'P','3':'P','4':'P','5':'P','6':'P','7':'P','8':'H','9':'H','T':'H','A':'H' },
  '3': { '2':'P','3':'P','4':'P','5':'P','6':'P','7':'P','8':'H','9':'H','T':'H','A':'H' },
  '4': { '2':'H','3':'H','4':'H','5':'P','6':'P','7':'H','8':'H','9':'H','T':'H','A':'H' },
  '5': { '2':'D','3':'D','4':'D','5':'D','6':'D','7':'D','8':'D','9':'D','T':'H','A':'H' },
  '6': { '2':'P','3':'P','4':'P','5':'P','6':'P','7':'H','8':'H','9':'H','T':'H','A':'H' },
  '7': { '2':'P','3':'P','4':'P','5':'P','6':'P','7':'P','8':'H','9':'H','T':'H','A':'H' },
  '8': { '2':'P','3':'P','4':'P','5':'P','6':'P','7':'P','8':'P','9':'P','T':'P','A':'P' },
  '9': { '2':'P','3':'P','4':'P','5':'P','6':'P','7':'S','8':'P','9':'P','T':'S','A':'S' },
  'T': { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'S','8':'S','9':'S','T':'S','A':'S' },
  'J': { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'S','8':'S','9':'S','T':'S','A':'S' },
  'Q': { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'S','8':'S','9':'S','T':'S','A':'S' },
  'K': { '2':'S','3':'S','4':'S','5':'S','6':'S','7':'S','8':'S','9':'S','T':'S','A':'S' },
};

/** Returns true if this hand has a usable ace (ace counted as 11). */
function hasSoftAce(cards: Card[]): boolean {
  const hasAce = cards.some(c => c.rank === 'A');
  if (!hasAce) return false;
  const total = cards.reduce((sum, c) => {
    if (c.rank === 'A') return sum + 11;
    if (['J','Q','K'].includes(c.rank)) return sum + 10;
    return sum + parseInt(c.rank);
  }, 0);
  return total <= 21;
}

/**
 * Returns the optimal basic strategy action for the given hand vs dealer upcard.
 * Prioritizes: pairs → soft totals → hard totals.
 */
export function getOptimalAction(playerHand: Hand, dealerUpcard: Card): StrategyAction {
  const cards = playerHand.cards;
  const dk = dealerKey(dealerUpcard.rank);

  // Pair check (exactly 2 cards with same rank)
  if (cards.length === 2 && cards[0].rank === cards[1].rank) {
    const pairRank = ['J','Q','K'].includes(cards[0].rank) ? 'T' : cards[0].rank;
    const pairRow = PAIRS[pairRank];
    if (pairRow && pairRow[dk]) return pairRow[dk];
  }

  const total = handValue(cards);

  // Soft total check
  if (hasSoftAce(cards) && total >= 13 && total <= 20) {
    const softRow = SOFT[total];
    if (softRow && softRow[dk]) return softRow[dk];
  }

  // Hard total
  const clampedTotal = Math.min(Math.max(total, 5), 20);
  const hardRow = HARD[clampedTotal];
  if (hardRow && hardRow[dk]) return hardRow[dk];

  return total >= 17 ? 'S' : 'H';
}

export const ACTION_LABELS: Record<StrategyAction, string> = {
  H: 'Hit recommended',
  S: 'Stand recommended',
  D: 'Double recommended',
  P: 'Split recommended',
};

export const ACTION_COLORS: Record<StrategyAction, string> = {
  H: '#ef4444',  // red
  S: '#22c55e',  // green
  D: '#ffd700',  // gold
  P: '#00ffff',  // cyan
};
