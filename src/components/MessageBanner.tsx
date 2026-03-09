import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  message: string;
}

function getStyle(msg: string) {
  const lower = msg.toLowerCase();
  if (lower.includes('blackjack')) return {
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.8)',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.5)',
  };
  if (lower.includes('win') || lower.includes('push') && lower.includes('blackjack')) return {
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.8)',
    bg: 'rgba(74,222,128,0.1)',
    border: 'rgba(74,222,128,0.4)',
  };
  if (lower.includes('bust') || lower.includes('lose') || lower.includes('dealer wins')) return {
    color: '#f87171',
    glow: 'rgba(248,113,113,0.8)',
    bg: 'rgba(248,113,113,0.1)',
    border: 'rgba(248,113,113,0.4)',
  };
  if (lower.includes('push')) return {
    color: '#a5f3fc',
    glow: 'rgba(165,243,252,0.8)',
    bg: 'rgba(165,243,252,0.1)',
    border: 'rgba(165,243,252,0.4)',
  };
  if (lower.includes('insurance')) return {
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.8)',
    bg: 'rgba(192,132,252,0.1)',
    border: 'rgba(192,132,252,0.4)',
  };
  return {
    color: '#e2e8f0',
    glow: 'rgba(226,232,240,0.4)',
    bg: 'rgba(226,232,240,0.05)',
    border: 'rgba(226,232,240,0.2)',
  };
}

export default function MessageBanner({ message }: Props) {
  const s = getStyle(message);
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            padding: '8px 24px',
            borderRadius: 12,
            background: s.bg,
            border: `1.5px solid ${s.border}`,
            color: s.color,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textAlign: 'center',
            textShadow: `0 0 12px ${s.glow}`,
            boxShadow: `0 0 20px ${s.glow}33`,
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
