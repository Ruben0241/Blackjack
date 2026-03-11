import { motion, AnimatePresence } from 'framer-motion';

const CHIP_COLORS: Record<number, { bg: string; border: string; glow: string; label: string }> = {
  10:  { bg: '#3b82f6', border: '#60a5fa', glow: 'rgba(59,130,246,0.7)',  label: '10' },
  25:  { bg: '#22c55e', border: '#4ade80', glow: 'rgba(34,197,94,0.7)',   label: '25' },
  50:  { bg: '#f59e0b', border: '#fbbf24', glow: 'rgba(245,158,11,0.7)',  label: '50' },
  100: { bg: '#ef4444', border: '#f87171', glow: 'rgba(239,68,68,0.7)',   label: '100' },
  500: { bg: '#8b5cf6', border: '#a78bfa', glow: 'rgba(139,92,246,0.7)',  label: '500' },
};

interface ChipProps {
  value: number;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Chip({ value, onClick, disabled, size = 'md' }: ChipProps) {
  const config = CHIP_COLORS[value] ?? CHIP_COLORS[10];
  const dim = size === 'sm' ? 44 : size === 'lg' ? 72 : 56;
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 15 : 12;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.12, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.94 } : {}}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: dim,
        height: dim,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${config.border}, ${config.bg})`,
        border: `3px solid ${config.border}`,
        boxShadow: disabled
          ? 'none'
          : `0 0 12px ${config.glow}, 0 0 24px ${config.glow}, 0 4px 8px rgba(0,0,0,0.4)`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 0,
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shine */}
      <div style={{
        position: 'absolute',
        top: 4, left: 8,
        width: '40%', height: '30%',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.25)',
        filter: 'blur(2px)',
      }} />
      {/* Dashed ring */}
      <div style={{
        position: 'absolute',
        inset: 5,
        borderRadius: '50%',
        border: `2px dashed rgba(255,255,255,0.3)`,
      }} />
      <span style={{
        color: '#fff',
        fontWeight: 900,
        fontSize,
        letterSpacing: '0.03em',
        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
        zIndex: 1,
      }}>
        {config.label}
      </span>
    </motion.button>
  );
}

interface BetDisplayProps {
  amount: number;
}

export function BetDisplay({ amount }: BetDisplayProps) {
  const chips = decomposeIntoChips(amount);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, minHeight: 60 }}>
      <AnimatePresence>
        {chips.map((chip, i) => (
          <motion.div
            key={`${chip.value}-${i}`}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: i * 0.06 }}
          >
            <Chip value={chip.value} size="sm" />
          </motion.div>
        ))}
      </AnimatePresence>
      {amount > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: '#fbbf24',
            fontWeight: 700,
            fontSize: 14,
            marginLeft: 6,
            textShadow: '0 0 8px rgba(251,191,36,0.8)',
          }}
        >
          {amount}
        </motion.span>
      )}
    </div>
  );
}

function decomposeIntoChips(amount: number): { value: number }[] {
  const denominations = [500, 100, 50, 25, 10];
  const result: { value: number }[] = [];
  let remaining = amount;
  for (const denom of denominations) {
    while (remaining >= denom && result.length < 12) {
      result.push({ value: denom });
      remaining -= denom;
    }
  }
  return result;
}

export const CHIP_VALUES = [10, 25, 50, 100, 500];
