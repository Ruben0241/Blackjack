import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  variant?: 'primary' | 'danger' | 'warning' | 'success' | 'ghost' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  glowClass?: string;
}

const VARIANTS = {
  primary: {
    bg: 'linear-gradient(135deg, #7b1fff, #9b30ff)',
    border: '#b44fff',
    glow: 'rgba(155,48,255,0.7)',
    color: '#fff',
    glowClass: 'btn-glow-purple',
  },
  danger: {
    bg: 'linear-gradient(135deg, #cc0044, #ff0066)',
    border: '#ff3385',
    glow: 'rgba(255,0,102,0.7)',
    color: '#fff',
    glowClass: '',
  },
  warning: {
    bg: 'linear-gradient(135deg, #c8a200, #ffd700)',
    border: '#ffe44d',
    glow: 'rgba(255,215,0,0.7)',
    color: '#000',
    glowClass: 'btn-glow-gold',
  },
  success: {
    bg: 'linear-gradient(135deg, #006633, #00ff88)',
    border: '#00ff88',
    glow: 'rgba(0,255,136,0.7)',
    color: '#000',
    glowClass: 'btn-glow-green',
  },
  ghost: {
    bg: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.2)',
    glow: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
    glowClass: '',
  },
  cyan: {
    bg: 'linear-gradient(135deg, #006888, #00ffff)',
    border: '#00ffff',
    glow: 'rgba(0,255,255,0.7)',
    color: '#000',
    glowClass: 'btn-glow-cyan',
  },
};

export default function ActionButton({ onClick, disabled, children, variant = 'primary', size = 'md' }: Props) {
  const v = VARIANTS[variant];
  const padding = size === 'lg' ? '13px 30px' : size === 'sm' ? '6px 14px' : '10px 22px';
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 12 : 13;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.06, y: -3 } : {}}
      whileTap={!disabled ? { scale: 0.94 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={!disabled ? v.glowClass : ''}
      style={{
        padding,
        borderRadius: 8,
        background: v.bg,
        border: `2px solid ${v.border}`,
        boxShadow: disabled
          ? 'none'
          : `0 0 14px ${v.glow}, 0 0 28px ${v.glow.replace('0.7', '0.3')}, 0 4px 10px rgba(0,0,0,0.4)`,
        color: v.color,
        fontSize,
        fontWeight: 800,
        letterSpacing: '0.06em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        textTransform: 'uppercase',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'box-shadow 0.2s ease, opacity 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </motion.button>
  );
}
