import { motion, AnimatePresence } from 'framer-motion';
import type { Hand } from '../types/game';
import { getHandLabel, handValue } from '../lib/gameLogic';
import PlayingCard from './PlayingCard';

interface Props {
  hand: Hand;
  label: string;
  isActive?: boolean;
  isDealer?: boolean;
  showValue?: boolean;
}

export default function HandDisplay({ hand, label, isActive, isDealer, showValue = true }: Props) {
  const value = handValue(hand.cards);
  const displayValue = isDealer
    ? hand.cards.some(c => c.faceDown)
      ? '?'
      : getHandLabel(value)
    : getHandLabel(value);

  const statusColor = {
    playing: isActive ? '#a5f3fc' : 'rgba(255,255,255,0.5)',
    standing: '#4ade80',
    bust: '#f87171',
    blackjack: '#fbbf24',
    surrendered: '#94a3b8',
  }[hand.status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {/* Label + Value */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}>
          {label}
        </span>
        {showValue && hand.cards.length > 0 && (
          <motion.span
            key={displayValue}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              color: statusColor,
              fontSize: 16,
              fontWeight: 800,
              textShadow: `0 0 10px ${statusColor}`,
              minWidth: 28,
              textAlign: 'center',
            }}
          >
            {displayValue}
          </motion.span>
        )}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', gap: -12, flexWrap: 'nowrap', position: 'relative' }}>
        <AnimatePresence>
          {hand.cards.map((card, i) => (
            <motion.div
              key={card.id}
              style={{ marginLeft: i === 0 ? 0 : -20, zIndex: i }}
            >
              <PlayingCard
                card={card}
                index={i}
                delay={isDealer ? 0.2 : 0}
                isActive={isActive && i === hand.cards.length - 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Status badge */}
      <AnimatePresence>
        {hand.status !== 'playing' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              padding: '3px 12px',
              borderRadius: 20,
              background: `${statusColor}22`,
              border: `1px solid ${statusColor}`,
              color: statusColor,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textShadow: `0 0 8px ${statusColor}`,
              boxShadow: `0 0 12px ${statusColor}44`,
            }}
          >
            {hand.status === 'blackjack' ? '⭐ BLACKJACK' :
             hand.status === 'bust' ? '💥 BUST' :
             hand.status === 'standing' ? 'STAND' :
             hand.status === 'surrendered' ? '🏳 SURRENDER' : hand.status}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
