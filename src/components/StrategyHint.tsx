import { motion } from 'framer-motion';
import type { Hand, Card } from '../types/game';
import { getOptimalAction, ACTION_LABELS, ACTION_COLORS } from '../lib/basicStrategy';

interface Props {
  playerHand: Hand;
  dealerUpcard: Card | null;
}

const ACTION_EMOJI: Record<string, string> = {
  H: '🔴',
  S: '🟢',
  D: '🟡',
  P: '🔵',
};

export default function StrategyHint({ playerHand, dealerUpcard }: Props) {
  if (!dealerUpcard || playerHand.cards.length < 2) return null;
  if (playerHand.status !== 'playing') return null;

  const action = getOptimalAction(playerHand, dealerUpcard);
  const color = ACTION_COLORS[action];
  const label = ACTION_LABELS[action];
  const emoji = ACTION_EMOJI[action];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
        padding: '4px 12px',
        borderRadius: 8,
        background: `${color}18`,
        border: `1px solid ${color}66`,
        boxShadow: `0 0 8px ${color}44`,
        fontSize: 11,
        fontWeight: 700,
        color: color,
        textShadow: `0 0 8px ${color}`,
        letterSpacing: '0.06em',
        cursor: 'default',
        userSelect: 'none',
      }}
      title={label}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </motion.div>
  );
}
