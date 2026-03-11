import { motion } from 'framer-motion';
import { useState } from 'react';
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (card.faceDown) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -15, y: x * 15 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 24,
        delay: delay + index * 0.1,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: 80,
        height: 112,
        flexShrink: 0,
        position: 'relative',
        rotateX: tilt.x,
        rotateY: tilt.y,
        perspective: 600,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* Glow effect for active card */}
      {isActive && !card.faceDown && (
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: 14,
            background: red
              ? 'radial-gradient(circle, rgba(255,0,128,0.6) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(155,48,255,0.6) 0%, transparent 70%)',
            filter: 'blur(8px)',
            zIndex: 0,
          }}
        />
      )}

      {/* Card face */}
      {!card.faceDown ? (
        <div
          className="holographic-card"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 10,
            background: 'linear-gradient(145deg, #ffffff 0%, #f4f0ff 100%)',
            border: isActive
              ? `2px solid ${red ? '#ff006a' : '#9b30ff'}`
              : '2px solid rgba(255,255,255,0.5)',
            boxShadow: isActive
              ? `0 0 20px ${red ? 'rgba(255,0,106,0.7)' : 'rgba(155,48,255,0.7)'}, 0 0 40px ${red ? 'rgba(255,0,106,0.3)' : 'rgba(155,48,255,0.3)'}, 0 4px 16px rgba(0,0,0,0.5)`
              : '0 4px 16px rgba(0,0,0,0.5), 0 0 8px rgba(155,48,255,0.2)',
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
          <div style={{ color: red ? '#dc2626' : '#3b0764', lineHeight: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, fontFamily: 'Georgia, serif' }}>{card.rank}</div>
            <div style={{ fontSize: 11 }}>{suit}</div>
          </div>

          {/* Center suit */}
          <div style={{
            textAlign: 'center',
            fontSize: 28,
            color: red ? '#dc2626' : '#3b0764',
            filter: `drop-shadow(0 0 6px ${red ? 'rgba(220,38,38,0.5)' : 'rgba(155,48,255,0.5)'})`,
          }}>
            {suit}
          </div>

          {/* Bottom-right (rotated) */}
          <div style={{
            color: red ? '#dc2626' : '#3b0764',
            lineHeight: 1,
            transform: 'rotate(180deg)',
            alignSelf: 'flex-end',
          }}>
            <div style={{ fontSize: 13, fontWeight: 900, fontFamily: 'Georgia, serif' }}>{card.rank}</div>
            <div style={{ fontSize: 11 }}>{suit}</div>
          </div>
        </div>
      ) : (
        /* Card back with glitch effect */
        <div
          className="glitch-card"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1a0a2e 0%, #0d0520 50%, #2d0a4e 100%)',
            border: '2px solid rgba(155,48,255,0.6)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(155,48,255,0.4)',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Inner border */}
          <div style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 6,
            border: '1.5px solid rgba(155,48,255,0.5)',
          }} />
          {/* Grid pattern */}
          <div style={{
            position: 'absolute',
            inset: 10,
            borderRadius: 4,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              rgba(155,48,255,0.07) 0px,
              rgba(155,48,255,0.07) 2px,
              transparent 2px,
              transparent 8px
            )`,
          }} />
          {/* Neon symbol */}
          <span style={{
            fontSize: 24,
            filter: 'drop-shadow(0 0 8px rgba(155,48,255,1))',
            position: 'relative',
            zIndex: 3,
          }}>🂠</span>
          {/* Magenta accent glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(to top, rgba(255,0,255,0.15), transparent)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
