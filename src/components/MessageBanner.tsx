import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  message: string;
}

function getStyle(msg: string) {
  const lower = msg.toLowerCase();
  if (lower.includes('blackjack')) return {
    color: '#ffd700',
    glow: 'rgba(255,215,0,0.9)',
    bg: 'rgba(255,215,0,0.08)',
    border: 'rgba(255,215,0,0.6)',
  };
  if (lower.includes('win') || (lower.includes('push') && lower.includes('blackjack'))) return {
    color: '#00ff88',
    glow: 'rgba(0,255,136,0.9)',
    bg: 'rgba(0,255,136,0.08)',
    border: 'rgba(0,255,136,0.5)',
  };
  if (lower.includes('bust') || lower.includes('lose') || lower.includes('dealer wins')) return {
    color: '#ff4466',
    glow: 'rgba(255,68,102,0.9)',
    bg: 'rgba(255,68,102,0.08)',
    border: 'rgba(255,68,102,0.5)',
  };
  if (lower.includes('push')) return {
    color: '#00ffff',
    glow: 'rgba(0,255,255,0.9)',
    bg: 'rgba(0,255,255,0.08)',
    border: 'rgba(0,255,255,0.5)',
  };
  if (lower.includes('insurance')) return {
    color: '#ff00ff',
    glow: 'rgba(255,0,255,0.9)',
    bg: 'rgba(255,0,255,0.08)',
    border: 'rgba(255,0,255,0.5)',
  };
  return {
    color: 'rgba(255,255,255,0.85)',
    glow: 'rgba(155,48,255,0.5)',
    bg: 'rgba(155,48,255,0.06)',
    border: 'rgba(155,48,255,0.3)',
  };
}

export default function MessageBanner({ message }: Props) {
  const s = getStyle(message);
  const isWinOrBust = message.toLowerCase().includes('blackjack') ||
    message.toLowerCase().includes('win') ||
    message.toLowerCase().includes('bust');

  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            padding: '10px 28px',
            borderRadius: 10,
            background: s.bg,
            border: `2px solid ${s.border}`,
            color: s.color,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '0.05em',
            textAlign: 'center',
            textShadow: `0 0 16px ${s.glow}, 0 0 32px ${s.glow.replace('0.9','0.4')}`,
            boxShadow: `0 0 24px ${s.glow.replace('0.9','0.3')}, 0 0 48px ${s.glow.replace('0.9','0.1')}`,
            animation: isWinOrBust ? 'neon-pulse 1.5s ease-in-out 3' : 'none',
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
