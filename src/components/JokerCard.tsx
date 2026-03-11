import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Joker } from '../types/game';

const RARITY_COLORS = {
  common:   { border: '#6688aa', glow: 'rgba(102,136,170,0.6)', label: 'COMMON',   labelColor: '#99bbdd' },
  uncommon: { border: '#00cc88', glow: 'rgba(0,204,136,0.7)',   label: 'UNCOMMON', labelColor: '#00ff88' },
  rare:     { border: '#ff00ff', glow: 'rgba(255,0,255,0.8)',   label: 'RARE',     labelColor: '#ff66ff' },
};

interface Props {
  joker: Joker;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  mini?: boolean;
}

export default function JokerCard({ joker, selected, onSelect, disabled, mini = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const rarity = RARITY_COLORS[joker.rarity];

  if (mini) {
    return (
      <div
        title={`${joker.name}: ${joker.description}`}
        style={{
          width: 56,
          height: 76,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #1a0a2e, #2d0a4e)',
          border: `2px solid ${rarity.border}`,
          boxShadow: `0 0 10px ${rarity.glow}, 0 0 20px ${rarity.glow.replace('0.', '0.3')}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          cursor: 'default',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ fontSize: 22 }}>{joker.emoji}</div>
        <div style={{
          fontSize: 6,
          color: rarity.labelColor,
          fontWeight: 800,
          letterSpacing: '0.05em',
          textAlign: 'center',
          padding: '0 4px',
          lineHeight: 1.2,
        }}>
          {joker.name.split(' ').slice(-1)[0].toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="joker-card-wrapper"
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={disabled ? undefined : onSelect}
      style={{
        width: 140,
        height: 200,
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div
        className="joker-card-inner"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 14,
          background: selected
            ? 'linear-gradient(135deg, #2a0a4e, #4a0a8e, #2a0a4e)'
            : 'linear-gradient(135deg, #1a0a2e, #2d0a4e)',
          border: selected
            ? `2px solid ${rarity.border}`
            : `2px solid ${hovered ? rarity.border : 'rgba(155,48,255,0.4)'}`,
          boxShadow: selected
            ? `0 0 20px ${rarity.glow}, 0 0 40px ${rarity.glow.replace('0.', '0.4')}, 0 0 60px ${rarity.glow.replace('0.', '0.2')}`
            : hovered
              ? `0 0 16px ${rarity.glow}, 0 0 32px ${rarity.glow.replace('0.', '0.3')}`
              : '0 4px 16px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 12px',
          position: 'relative',
          overflow: 'hidden',
          opacity: disabled ? 0.4 : 1,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Holographic overlay */}
        {(selected || hovered) && (
          <div
            className="holographic-card"
            style={{ position: 'absolute', inset: 0, borderRadius: 14, zIndex: 0 }}
          />
        )}

        {/* Selected indicator */}
        {selected && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: rarity.border,
            boxShadow: `0 0 8px ${rarity.glow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 900,
            color: '#000',
            zIndex: 2,
          }}>✓</div>
        )}

        {/* Rarity badge */}
        <div style={{
          fontSize: 9,
          fontWeight: 800,
          color: rarity.labelColor,
          letterSpacing: '0.15em',
          textShadow: `0 0 8px ${rarity.glow}`,
          zIndex: 1,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          {rarity.label}
        </div>

        {/* Emoji */}
        <div style={{
          fontSize: 48,
          filter: `drop-shadow(0 0 12px ${rarity.glow})`,
          zIndex: 1,
        }}>
          {joker.emoji}
        </div>

        {/* Name + description */}
        <div style={{ zIndex: 1, width: '100%', textAlign: 'center' }}>
          <div style={{
            fontSize: 11,
            fontWeight: 900,
            color: '#fff',
            marginBottom: 4,
            letterSpacing: '0.03em',
            textShadow: `0 0 8px ${rarity.glow}`,
          }}>
            {joker.name}
          </div>
          <div style={{
            fontSize: 9.5,
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.3,
          }}>
            {joker.description}
          </div>
        </div>

        {/* Corner accent */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: `linear-gradient(to top, ${rarity.glow.replace('0.', '0.1')}, transparent)`,
          borderRadius: '0 0 14px 14px',
          zIndex: 0,
        }} />
      </div>
    </motion.div>
  );
}
