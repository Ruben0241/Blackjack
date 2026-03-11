import { motion, AnimatePresence } from 'framer-motion';

const CHIP_COLORS: Record<number, { bg: string; border: string; glow: string; label: string }> = {
  10:  { bg: '#1a44cc', border: '#4d88ff', glow: 'rgba(77,136,255,0.8)',   label: '10' },
  25:  { bg: '#006622', border: '#00ff88', glow: 'rgba(0,255,136,0.8)',    label: '25' },
  50:  { bg: '#995500', border: '#ffd700', glow: 'rgba(255,215,0,0.8)',    label: '50' },
  100: { bg: '#880011', border: '#ff3355', glow: 'rgba(255,51,85,0.8)',    label: '100' },
  500: { bg: '#4a0a8a', border: '#9b30ff', glow: 'rgba(155,48,255,0.9)',   label: '500' },
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
  const fontSize = size === 'sm' ? 9 : size === 'lg' ? 15 : 11;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.14, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.93 } : {}}
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
          : `0 0 14px ${config.glow}, 0 0 28px ${config.glow.replace('0.8', '0.4')}, 0 4px 10px rgba(0,0,0,0.6)`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
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
        width: '40%', height: '28%',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.3)',
        filter: 'blur(2px)',
      }} />
      {/* Dashed ring */}
      <div style={{
        position: 'absolute',
        inset: 5,
        borderRadius: '50%',
        border: '2px dashed rgba(255,255,255,0.35)',
      }} />
      <span
        className="pixel-font"
        style={{
          color: '#fff',
          fontWeight: 900,
          fontSize,
          letterSpacing: '0.02em',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          zIndex: 1,
        }}
      >
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
          className="pixel-font"
          style={{
            color: '#ffd700',
            fontWeight: 700,
            fontSize: 11,
            marginLeft: 6,
            textShadow: '0 0 10px rgba(255,215,0,0.9)',
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
