import { create } from 'zustand';
import type { GameState, Hand } from '../types/game';
import {
  calculatePayout,
  canDouble,
  canSplit,
  createDeck,
  dealerShouldHit,
  getHandResult,
  isBust,
  isBlackjack,
} from './gameLogic';

type Card = import('../types/game').Card;

type GameStore = GameState & {
  placeBet: (amount: number) => void;
  clearBet: () => void;
  deal: () => void;
  hit: () => void;
  stand: () => void;
  double: () => void;
  split: () => void;
  takeInsurance: () => void;
  declineInsurance: () => void;
  newRound: () => void;
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

  deal: () => {
    const { chips, currentBet } = get();
    if (currentBet < MIN_BET || currentBet > chips) return;

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

    const playerBJ = isBlackjack(playerHand.cards);
    const dealerUpcard = dealerHand.cards[0];
    const insurancePending = dealerUpcard.rank === 'A' && !playerBJ;

    set({
      phase: 'dealing',
      playerHands: [playerHand],
      activeHandIndex: 0,
      dealerHand,
      deck,
      chips: chips - currentBet,
      message: '',
      insurancePending,
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
          set({
            dealerHand: revealedDealer,
            playerHands: [{ ...ph, status: 'blackjack' }],
            phase: 'round-end',
            insurancePending: false,
            message: 'Push! Both Blackjack!',
            chips: get().chips + currentBet,
          });
        } else {
          const payout = Math.floor(currentBet * 2.5);
          set({
            dealerHand: revealedDealer,
            playerHands: [{ ...ph, status: 'blackjack' }],
            phase: 'round-end',
            insurancePending: false,
            message: `Blackjack! You win ${payout} chips!`,
            chips: get().chips + payout,
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
    const { phase, playerHands, activeHandIndex, chips, deck, insurancePending } = get();
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
    let totalWinnings = 0;
    const results: string[] = [];

    for (const hand of playerHands) {
      const result = getHandResult(hand, finalDealerHand.cards);
      const payout = calculatePayout(result, hand.bet, !!hand.isInsured, dealerBJ);
      totalWinnings += payout;

      if (result === 'blackjack') results.push('Blackjack! 3:2');
      else if (result === 'win') results.push('You win!');
      else if (result === 'push') results.push('Push!');
      else if (result === 'bust') results.push('Bust!');
      else if (result === 'lose') results.push('Dealer wins!');
    }

    const newChips = get().chips + totalWinnings;
    const msg = results.length === 1 ? results[0] : results.join(' | ');

    set({
      phase: 'round-end',
      dealerHand: finalDealerHand,
      chips: newChips,
      message: msg,
    });
  },

  newRound: () => {
    set({
      phase: 'betting',
      playerHands: [makeHand([], 0)],
      activeHandIndex: 0,
      dealerHand: makeHand([], 0),
      currentBet: 0,
      message: get().chips > 0 ? 'Place your bet!' : 'Game Over!',
      insurancePending: false,
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
