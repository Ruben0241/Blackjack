import { motion } from 'framer-motion';
import type { Card } from '../types/game';
import { isRed, suitSymbol } from '../lib/gameLogic';

interface Props {
  card: Card;
  index?: number;
  delay?: number;
  isActive?: boolean;
}

export default function PlayingCard({ card, index = 0, delay = 0, isActive = false }: Props) {
  const red = isRed(card.suit);
  const suit = suitSymbol(card.suit);

  return (
    <motion.div
      initial={{ y: -120, opacity: 0, rotateY: 90, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, rotateY: card.faceDown ? 180 : 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 22,
        delay: delay + index * 0.1,
      }}
      style={{
        width: 80,
        height: 112,
        perspective: 600,
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Glow effect for active card */}
      {isActive && !card.faceDown && (
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: 12,
            background: red
              ? 'radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)',
            filter: 'blur(6px)',
            zIndex: 0,
          }}
        />
      )}

      {/* Card face */}
      {!card.faceDown ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 10,
            background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
            border: isActive ? `2px solid ${red ? '#ef4444' : '#6366f1'}` : '2px solid rgba(255,255,255,0.3)',
            boxShadow: isActive
              ? `0 0 16px ${red ? 'rgba(239,68,68,0.6)' : 'rgba(99,102,241,0.6)'}, 0 4px 12px rgba(0,0,0,0.4)`
              : '0 4px 12px rgba(0,0,0,0.4)',
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '4px 6px',
            userSelect: 'none',
          }}
        >
          {/* Top-left */}
          <div style={{ color: red ? '#dc2626' : '#1e1b4b', lineHeight: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, fontFamily: 'Georgia, serif' }}>{card.rank}</div>
            <div style={{ fontSize: 11 }}>{suit}</div>
          </div>

          {/* Center suit */}
          <div style={{
            textAlign: 'center',
            fontSize: 28,
            color: red ? '#dc2626' : '#1e1b4b',
            filter: `drop-shadow(0 0 4px ${red ? 'rgba(220,38,38,0.4)' : 'rgba(30,27,75,0.3)'})`,
          }}>
            {suit}
          </div>

          {/* Bottom-right (rotated) */}
          <div style={{
            color: red ? '#dc2626' : '#1e1b4b',
            lineHeight: 1,
            transform: 'rotate(180deg)',
            alignSelf: 'flex-end',
          }}>
            <div style={{ fontSize: 13, fontWeight: 900, fontFamily: 'Georgia, serif' }}>{card.rank}</div>
            <div style={{ fontSize: 11 }}>{suit}</div>
          </div>
        </div>
      ) : (
        /* Card back */
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            border: '2px solid rgba(99,102,241,0.5)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 8px rgba(99,102,241,0.3)',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Decorative back pattern */}
          <div style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 6,
            border: '1.5px solid rgba(99,102,241,0.4)',
          }} />
          <div style={{
            position: 'absolute',
            inset: 10,
            borderRadius: 4,
            border: '1px solid rgba(99,102,241,0.2)',
            backgroundImage: `repeating-linear-gradient(
              45deg,
              rgba(99,102,241,0.05) 0px,
              rgba(99,102,241,0.05) 2px,
              transparent 2px,
              transparent 8px
            )`,
          }} />
          <span style={{ fontSize: 24, filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.8))' }}>🂠</span>
        </div>
      )}
    </motion.div>
  );
}
