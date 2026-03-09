import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  variant?: 'primary' | 'danger' | 'warning' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const VARIANTS = {
  primary: {
    bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: '#a78bfa',
    glow: 'rgba(139,92,246,0.6)',
    color: '#fff',
  },
  danger: {
    bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: '#f87171',
    glow: 'rgba(239,68,68,0.6)',
    color: '#fff',
  },
  warning: {
    bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: '#fbbf24',
    glow: 'rgba(245,158,11,0.6)',
    color: '#fff',
  },
  success: {
    bg: 'linear-gradient(135deg, #22c55e, #16a34a)',
    border: '#4ade80',
    glow: 'rgba(34,197,94,0.6)',
    color: '#fff',
  },
  ghost: {
    bg: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.2)',
    glow: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
  },
};

export default function ActionButton({ onClick, disabled, children, variant = 'primary', size = 'md' }: Props) {
  const v = VARIANTS[variant];
  const padding = size === 'lg' ? '12px 28px' : size === 'sm' ? '6px 14px' : '9px 20px';
  const fontSize = size === 'lg' ? 16 : size === 'sm' ? 12 : 14;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding,
        borderRadius: 10,
        background: v.bg,
        border: `1.5px solid ${v.border}`,
        boxShadow: disabled ? 'none' : `0 0 12px ${v.glow}, 0 4px 8px rgba(0,0,0,0.3)`,
        color: v.color,
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.05em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        textTransform: 'uppercase',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'opacity 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </motion.button>
  );
}
