export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
  faceDown?: boolean;
}

export type HandStatus = 'playing' | 'standing' | 'bust' | 'blackjack' | 'surrendered';

export interface Hand {
  cards: Card[];
  bet: number;
  status: HandStatus;
  isInsured?: boolean;
}

export type GamePhase =
  | 'betting'
  | 'dealing'
  | 'player-turn'
  | 'dealer-turn'
  | 'round-end';

export interface GameState {
  phase: GamePhase;
  playerHands: Hand[];
  activeHandIndex: number;
  dealerHand: Hand;
  deck: Card[];
  chips: number;
  currentBet: number;
  message: string;
  insurancePending: boolean;
}

export type GameAction =
  | 'hit'
  | 'stand'
  | 'double'
  | 'split'
  | 'insurance-yes'
  | 'insurance-no'
  | 'surrender';

export interface JokerEffect {
  blackjackMultiplier?: number;
  winMultiplier?: number;
  aceAlwaysOptimal?: boolean;
  doubleBonus?: number;
  hasMirrorCard?: boolean;
  streakBonusThreshold?: number;
  streakBonusMultiplier?: number;
}

export type JokerRarity = 'common' | 'uncommon' | 'rare';

export interface Joker {
  id: string;
  name: string;
  description: string;
  rarity: JokerRarity;
  emoji: string;
  effect: JokerEffect;
}

export interface GameStats {
  handsPlayed: number;
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  currentStreak: number;
  longestStreak: number;
  biggestWin: number;
  totalEarned: number;
}

export type SideBetType = 'mixed' | 'colored' | 'perfect';

export interface SideBetResult {
  type: SideBetType;
  multiplier: number;
  payout: number;
}
