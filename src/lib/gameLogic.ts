import type { Card, Hand, Rank, Suit } from '../types/game';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck(numDecks = 6): Card[] {
  const deck: Card[] = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, id: `${d}-${suit}-${rank}` });
      }
    }
  }
  return shuffle(deck);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function cardValue(rank: Rank): number {
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  if (rank === 'A') return 11;
  return parseInt(rank, 10);
}

export function handValue(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.faceDown) continue;
    const val = cardValue(card.rank);
    total += val;
    if (card.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export function isBust(cards: Card[]): boolean {
  return handValue(cards) > 21;
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards) === 21;
}

export function canSplit(hand: Hand): boolean {
  return (
    hand.cards.length === 2 &&
    hand.cards[0].rank === hand.cards[1].rank
  );
}

export function canDouble(hand: Hand): boolean {
  return hand.cards.length === 2;
}

export function dealerShouldHit(cards: Card[]): boolean {
  return handValue(cards) < 17;
}

export function getHandResult(
  playerHand: Hand,
  dealerCards: Card[]
): 'win' | 'lose' | 'push' | 'blackjack' | 'bust' {
  if (playerHand.status === 'surrendered') return 'lose';
  if (playerHand.status === 'bust') return 'bust';

  const playerVal = handValue(playerHand.cards);
  const dealerVal = handValue(dealerCards);
  const dealerBust = isBust(dealerCards);
  const playerBJ = isBlackjack(playerHand.cards);
  const dealerBJ = isBlackjack(dealerCards);

  if (playerBJ && !dealerBJ) return 'blackjack';
  if (dealerBJ && !playerBJ) return 'lose';
  if (playerBJ && dealerBJ) return 'push';
  if (dealerBust) return 'win';
  if (playerVal > dealerVal) return 'win';
  if (playerVal < dealerVal) return 'lose';
  return 'push';
}

export function calculatePayout(
  result: ReturnType<typeof getHandResult>,
  bet: number,
  isInsured: boolean,
  dealerBlackjack: boolean
): number {
  let payout = 0;
  switch (result) {
    case 'blackjack': payout = bet * 2.5; break;
    case 'win': payout = bet * 2; break;
    case 'push': payout = bet; break;
    case 'bust':
    case 'lose': payout = 0; break;
  }
  // Insurance pays 2:1 if dealer has blackjack
  if (isInsured && dealerBlackjack) {
    payout += bet * 0.5 * 2; // insurance bet is half the original bet
  }
  return Math.floor(payout);
}

export function getHandLabel(value: number): string {
  if (value > 21) return `${value} BUST`;
  if (value === 21) return '21';
  return `${value}`;
}

export function suitSymbol(suit: Suit): string {
  return { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' }[suit];
}

export function isRed(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}
