import { create } from 'zustand';
import type { GameState, Hand, Joker, GameStats, SideBetResult } from '../types/game';
import {
  calculatePayout,
  canDouble,
  canSplit,
  createDeck,
  dealerShouldHit,
  getHandResult,
  isBust,
  isBlackjack,
  isRed,
} from './gameLogic';
import { loadStats, saveStats, updateStats } from './stats';

type Card = import('../types/game').Card;

type ExtendedGameState = GameState & {
  activeJokers: Joker[];
  sideBet: number;
  sideBetResult: SideBetResult | null;
  stats: GameStats;
  strategyMode: boolean;
  doubleCount: number; // track doubles this round for The Gambler
};

type GameStore = ExtendedGameState & {
  placeBet: (amount: number) => void;
  clearBet: () => void;
  placeSideBet: (amount: number) => void;
  clearSideBet: () => void;
  deal: () => void;
  hit: () => void;
  stand: () => void;
  double: () => void;
  split: () => void;
  takeInsurance: () => void;
  declineInsurance: () => void;
  newRound: () => void;
  selectJokers: (jokers: Joker[]) => void;
  toggleStrategyMode: () => void;
  canHit: () => boolean;
  canStand: () => boolean;
  canDoubleDown: () => boolean;
  canSplitHand: () => boolean;
  canInsure: () => boolean;
  canSurrender: () => boolean;
  _runDealerTurn: (playerHands: Hand[]) => void;
  _resolveRound: (playerHands: Hand[], finalDealerHand: Hand) => void;
};

const STARTING_CHIPS = 1000;
const MIN_BET = 10;

function makeHand(cards: Card[], bet: number): Hand {
  return { cards, bet, status: 'playing' };
}

function drawCard(deck: Card[], faceDown = false): [Card, Card[]] {
  const card = { ...deck[deck.length - 1], faceDown };
  return [card, deck.slice(0, -1)];
}

/** Resolve Perfect Pairs side bet from first 2 player cards */
function resolvePerfectPairs(cards: Card[], sideBet: number): SideBetResult | null {
  if (sideBet <= 0 || cards.length < 2) return null;
  if (cards[0].rank !== cards[1].rank) return null;
  if (cards[0].suit === cards[1].suit) {
    return { type: 'perfect', multiplier: 25, payout: sideBet * 25 };
  }
  if (isRed(cards[0].suit) === isRed(cards[1].suit)) {
    return { type: 'colored', multiplier: 10, payout: sideBet * 10 };
  }
  return { type: 'mixed', multiplier: 5, payout: sideBet * 5 };
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'betting',
  playerHands: [makeHand([], 0)],
  activeHandIndex: 0,
  dealerHand: makeHand([], 0),
  deck: createDeck(),
  chips: STARTING_CHIPS,
  currentBet: 0,
  message: 'Place your bet!',
  insurancePending: false,
  activeJokers: [],
  sideBet: 0,
  sideBetResult: null,
  stats: loadStats(),
  strategyMode: false,
  doubleCount: 0,

  selectJokers: (jokers) => set({ activeJokers: jokers }),

  toggleStrategyMode: () => set(s => ({ strategyMode: !s.strategyMode })),

  placeBet: (amount) => {
    const { chips, currentBet, phase } = get();
    if (phase !== 'betting') return;
    const newBet = currentBet + amount;
    if (newBet > chips) return;
    set({ currentBet: newBet });
  },

  clearBet: () => {
    if (get().phase !== 'betting') return;
    set({ currentBet: 0 });
  },

  placeSideBet: (amount) => {
    const { chips, currentBet, sideBet, phase } = get();
    if (phase !== 'betting') return;
    const maxSideBet = currentBet > 0 ? Math.floor(currentBet * 0.25) : 50;
    const newSideBet = sideBet + amount;
    if (newSideBet > maxSideBet || newSideBet > chips - currentBet) return;
    set({ sideBet: newSideBet });
  },

  clearSideBet: () => {
    if (get().phase !== 'betting') return;
    set({ sideBet: 0 });
  },

  deal: () => {
    const { chips, currentBet, sideBet } = get();
    const totalCost = currentBet + sideBet;
    if (currentBet < MIN_BET || totalCost > chips) return;

    let deck = get().deck.length < 52 ? createDeck() : [...get().deck];

    const [c1, d1] = drawCard(deck);
    deck = d1;
    const [c2, d2] = drawCard(deck);
    deck = d2;
    const [c3, d3] = drawCard(deck);
    deck = d3;
    const [c4, d4] = drawCard(deck, true); // dealer hole card
    deck = d4;

    const playerHand = makeHand([c1, c3], currentBet);
    const dealerHand = makeHand([c2, c4], 0);

    // Resolve side bet immediately after dealing
    const sideBetResult = resolvePerfectPairs([c1, c3], sideBet);

    const playerBJ = isBlackjack(playerHand.cards);
    const dealerUpcard = dealerHand.cards[0];
    const insurancePending = dealerUpcard.rank === 'A' && !playerBJ;

    const sideBetWinnings = sideBetResult ? sideBetResult.payout : 0;

    set({
      phase: 'dealing',
      playerHands: [playerHand],
      activeHandIndex: 0,
      dealerHand,
      deck,
      chips: chips - totalCost + sideBetWinnings,
      message: '',
      insurancePending,
      sideBetResult,
      doubleCount: 0,
    });

    setTimeout(() => {
      const { playerHands } = get();
      const ph = playerHands[0];
      if (isBlackjack(ph.cards)) {
        const dh = get().dealerHand;
        const revealedDealer: Hand = {
          ...dh,
          cards: dh.cards.map(c => ({ ...c, faceDown: false })),
        };
        if (isBlackjack(revealedDealer.cards)) {
          const newChips = get().chips + currentBet;
          const newStats = updateStats('push', 0, get().stats);
          saveStats(newStats);
          set({
            dealerHand: revealedDealer,
            playerHands: [{ ...ph, status: 'blackjack' }],
            phase: 'round-end',
            insurancePending: false,
            message: 'Push! Both Blackjack!',
            chips: newChips,
            stats: newStats,
          });
        } else {
          const basePayout = Math.floor(currentBet * 2.5);
          const jokerPayout = applyJokerBlackjack(basePayout, get().activeJokers);
          const newChips = get().chips + jokerPayout;
          const newStats = updateStats('blackjack', jokerPayout - currentBet, get().stats);
          saveStats(newStats);
          set({
            dealerHand: revealedDealer,
            playerHands: [{ ...ph, status: 'blackjack' }],
            phase: 'round-end',
            insurancePending: false,
            message: `Blackjack! You win ${jokerPayout} chips!`,
            chips: newChips,
            stats: newStats,
          });
        }
        return;
      }

      set({
        phase: 'player-turn',
        message: insurancePending ? 'Insurance?' : 'Your turn!',
      });
    }, 800);
  },

  hit: () => {
    const { phase, playerHands, activeHandIndex, deck, insurancePending } = get();
    if (phase !== 'player-turn' || insurancePending) return;

    let d = [...deck];
    const [card, nd] = drawCard(d);
    d = nd;

    const updatedHands = playerHands.map((hand, i) => {
      if (i !== activeHandIndex) return hand;
      const newCards = [...hand.cards, card];
      const bust = isBust(newCards);
      return { ...hand, cards: newCards, status: bust ? ('bust' as const) : hand.status };
    });

    const currentHand = updatedHands[activeHandIndex];
    set({ playerHands: updatedHands, deck: d });

    if (currentHand.status === 'bust') {
      const nextIndex = activeHandIndex + 1;
      if (nextIndex < updatedHands.length) {
        set({ activeHandIndex: nextIndex, message: 'Next hand!' });
      } else {
        get()._runDealerTurn(updatedHands);
      }
    }
  },

  stand: () => {
    const { phase, playerHands, activeHandIndex, insurancePending } = get();
    if (phase !== 'player-turn' || insurancePending) return;

    const updatedHands = playerHands.map((hand, i) =>
      i === activeHandIndex ? { ...hand, status: 'standing' as const } : hand
    );

    const nextIndex = activeHandIndex + 1;
    if (nextIndex < updatedHands.length) {
      set({ playerHands: updatedHands, activeHandIndex: nextIndex, message: 'Next hand!' });
    } else {
      set({ playerHands: updatedHands });
      get()._runDealerTurn(updatedHands);
    }
  },

  double: () => {
    const { phase, playerHands, activeHandIndex, chips, deck, insurancePending, doubleCount } = get();
    if (phase !== 'player-turn' || insurancePending) return;
    const hand = playerHands[activeHandIndex];
    if (!canDouble(hand) || chips < hand.bet) return;

    let d = [...deck];
    const [card, nd] = drawCard(d);
    d = nd;

    const newCards = [...hand.cards, card];
    const bust = isBust(newCards);
    const updatedHands = playerHands.map((h, i) =>
      i === activeHandIndex
        ? { ...h, cards: newCards, bet: h.bet * 2, status: bust ? ('bust' as const) : ('standing' as const) }
        : h
    );

    set({
      playerHands: updatedHands,
      chips: chips - hand.bet,
      deck: d,
      doubleCount: doubleCount + 1,
    });

    const nextIndex = activeHandIndex + 1;
    if (nextIndex < updatedHands.length) {
      set({ activeHandIndex: nextIndex, message: 'Next hand!' });
    } else {
      get()._runDealerTurn(updatedHands);
    }
  },

  split: () => {
    const { phase, playerHands, activeHandIndex, chips, deck, insurancePending } = get();
    if (phase !== 'player-turn' || insurancePending) return;
    const hand = playerHands[activeHandIndex];
    if (!canSplit(hand) || chips < hand.bet) return;

    let d = [...deck];
    const [card1, nd1] = drawCard(d);
    d = nd1;
    const [card2, nd2] = drawCard(d);
    d = nd2;

    const hand1 = makeHand([hand.cards[0], card1], hand.bet);
    const hand2 = makeHand([hand.cards[1], card2], hand.bet);

    const newHands = [
      ...playerHands.slice(0, activeHandIndex),
      hand1,
      hand2,
      ...playerHands.slice(activeHandIndex + 1),
    ];

    set({
      playerHands: newHands,
      chips: chips - hand.bet,
      deck: d,
      message: 'Hand split!',
    });
  },

  takeInsurance: () => {
    const { chips, currentBet, playerHands, activeHandIndex } = get();
    const insuranceBet = Math.floor(currentBet / 2);
    if (chips < insuranceBet) {
      set({ insurancePending: false, message: 'Your turn!' });
      return;
    }
    const updatedHands = playerHands.map((h, i) =>
      i === activeHandIndex ? { ...h, isInsured: true } : h
    );
    set({
      insurancePending: false,
      playerHands: updatedHands,
      chips: chips - insuranceBet,
      message: 'Your turn!',
    });
  },

  declineInsurance: () => {
    set({ insurancePending: false, message: 'Your turn!' });
  },

  _runDealerTurn: (playerHands: Hand[]) => {
    set({ phase: 'dealer-turn', message: 'Dealer plays...' });

    const { dealerHand } = get();
    const revealedDealer: Hand = {
      ...dealerHand,
      cards: dealerHand.cards.map(c => ({ ...c, faceDown: false })),
    };
    set({ dealerHand: revealedDealer });

    const allBust = playerHands.every(h => h.status === 'bust' || h.status === 'surrendered');

    if (allBust) {
      get()._resolveRound(playerHands, revealedDealer);
      return;
    }

    let dealerCards = [...revealedDealer.cards];
    let deck = [...get().deck];

    const drawNextCard = () => {
      if (dealerShouldHit(dealerCards)) {
        const [card, nd] = drawCard(deck);
        deck = nd;
        dealerCards = [...dealerCards, card];
        set({
          dealerHand: { ...revealedDealer, cards: dealerCards },
          deck,
        });
        setTimeout(drawNextCard, 600);
      } else {
        get()._resolveRound(playerHands, { ...revealedDealer, cards: dealerCards });
      }
    };

    setTimeout(drawNextCard, 600);
  },

  _resolveRound: (playerHands: Hand[], finalDealerHand: Hand) => {
    const dealerBJ = isBlackjack(finalDealerHand.cards);
    const { activeJokers, doubleCount, stats } = get();
    let totalWinnings = 0;
    const results: string[] = [];
    let lastResult: 'win' | 'lose' | 'push' | 'blackjack' = 'push';
    let lastAmount = 0;

    for (const hand of playerHands) {
      const result = getHandResult(hand, finalDealerHand.cards);
      let payout = calculatePayout(result, hand.bet, !!hand.isInsured, dealerBJ);

      // Apply joker multipliers
      payout = applyJokerWinEffects(payout, result, activeJokers, doubleCount, stats.currentStreak);

      totalWinnings += payout;
      lastResult = result === 'blackjack' ? 'blackjack' : result === 'win' ? 'win' : result === 'push' ? 'push' : 'lose';
      lastAmount = payout > 0 ? payout - hand.bet : 0;

      if (result === 'blackjack') results.push('Blackjack! 3:2');
      else if (result === 'win') results.push('You win!');
      else if (result === 'push') results.push('Push!');
      else if (result === 'bust') results.push('Bust!');
      else if (result === 'lose') results.push('Dealer wins!');
    }

    const newChips = get().chips + totalWinnings;
    const msg = results.length === 1 ? results[0] : results.join(' | ');

    const newStats = updateStats(lastResult, lastAmount, stats);
    saveStats(newStats);

    set({
      phase: 'round-end',
      dealerHand: finalDealerHand,
      chips: newChips,
      message: msg,
      stats: newStats,
    });
  },

  newRound: () => {
    set({
      phase: 'betting',
      playerHands: [makeHand([], 0)],
      activeHandIndex: 0,
      dealerHand: makeHand([], 0),
      currentBet: 0,
      sideBet: 0,
      sideBetResult: null,
      message: get().chips > 0 ? 'Place your bet!' : 'Game Over!',
      insurancePending: false,
      doubleCount: 0,
    });
  },

  canHit: () => {
    const { phase, playerHands, activeHandIndex, insurancePending } = get();
    if (phase !== 'player-turn' || insurancePending) return false;
    const hand = playerHands[activeHandIndex];
    return hand?.status === 'playing';
  },
  canStand: () => {
    const { phase, playerHands, activeHandIndex, insurancePending } = get();
    if (phase !== 'player-turn' || insurancePending) return false;
    return playerHands[activeHandIndex]?.status === 'playing';
  },
  canDoubleDown: () => {
    const { phase, playerHands, activeHandIndex, chips, insurancePending } = get();
    if (phase !== 'player-turn' || insurancePending) return false;
    const hand = playerHands[activeHandIndex];
    return hand?.status === 'playing' && canDouble(hand) && chips >= hand.bet;
  },
  canSplitHand: () => {
    const { phase, playerHands, activeHandIndex, chips, insurancePending } = get();
    if (phase !== 'player-turn' || insurancePending) return false;
    const hand = playerHands[activeHandIndex];
    return hand?.status === 'playing' && canSplit(hand) && chips >= hand.bet;
  },
  canInsure: () => get().insurancePending,
  canSurrender: () => {
    const { phase, playerHands, activeHandIndex, insurancePending } = get();
    if (phase !== 'player-turn' || insurancePending) return false;
    const hand = playerHands[activeHandIndex];
    return hand?.status === 'playing' && hand.cards.length === 2;
  },
}));

/** Apply joker multipliers for blackjack payouts */
function applyJokerBlackjack(basePayout: number, jokers: Joker[]): number {
  let payout = basePayout;
  for (const joker of jokers) {
    if (joker.effect.blackjackMultiplier) {
      payout = Math.floor(payout * joker.effect.blackjackMultiplier);
    }
  }
  return payout;
}

/** Apply joker effects to win payouts */
function applyJokerWinEffects(
  basePayout: number,
  result: string,
  jokers: Joker[],
  doubleCount: number,
  currentStreak: number
): number {
  if (basePayout === 0) return 0;
  let payout = basePayout;

  for (const joker of jokers) {
    // Golden Touch: +10% on all wins
    if ((result === 'win' || result === 'blackjack') && joker.effect.winMultiplier && joker.id === 'golden-touch') {
      payout = Math.floor(payout * (1 + joker.effect.winMultiplier - 1));
    }
    // The Gambler: +15% per double this round
    if (joker.id === 'gambler' && joker.effect.doubleBonus && doubleCount > 0) {
      payout = Math.floor(payout * (1 + joker.effect.doubleBonus * doubleCount));
    }
    // Chip Magnet: 2x on win streak
    if (
      joker.id === 'chip-magnet' &&
      joker.effect.streakBonusThreshold &&
      joker.effect.streakBonusMultiplier &&
      currentStreak >= joker.effect.streakBonusThreshold &&
      (result === 'win' || result === 'blackjack')
    ) {
      payout = Math.floor(payout * joker.effect.streakBonusMultiplier);
    }
  }

  return payout;
}

