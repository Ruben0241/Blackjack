import type { GameStats } from '../types/game';

const STATS_KEY = 'blackjack_stats_v1';

export const DEFAULT_STATS: GameStats = {
  handsPlayed: 0,
  wins: 0,
  losses: 0,
  pushes: 0,
  blackjacks: 0,
  currentStreak: 0,
  longestStreak: 0,
  biggestWin: 0,
  totalEarned: 0,
};

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...DEFAULT_STATS };
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // localStorage may not be available
  }
}

export function updateStats(
  result: 'win' | 'lose' | 'push' | 'blackjack',
  amount: number,
  stats: GameStats
): GameStats {
  const next = { ...stats };
  next.handsPlayed++;

  if (result === 'blackjack') {
    next.wins++;
    next.blackjacks++;
    next.currentStreak = Math.max(0, next.currentStreak) + 1;
    next.totalEarned += amount;
    if (amount > next.biggestWin) next.biggestWin = amount;
  } else if (result === 'win') {
    next.wins++;
    next.currentStreak = Math.max(0, next.currentStreak) + 1;
    next.totalEarned += amount;
    if (amount > next.biggestWin) next.biggestWin = amount;
  } else if (result === 'lose') {
    next.losses++;
    next.currentStreak = Math.min(0, next.currentStreak) - 1;
  } else {
    next.pushes++;
    // streak unchanged on push
  }

  if (next.currentStreak > next.longestStreak) {
    next.longestStreak = next.currentStreak;
  }

  return next;
}

export function getWinRate(stats: GameStats): number {
  if (stats.handsPlayed === 0) return 0;
  return Math.round((stats.wins / stats.handsPlayed) * 100);
}
