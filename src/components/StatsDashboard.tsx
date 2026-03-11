import { motion } from 'framer-motion';
import type { GameStats } from '../types/game';
import { getWinRate } from '../lib/stats';

interface Props {
  stats: GameStats;
  onClose: () => void;
}

interface StatRowProps {
  label: string;
  value: string | number;
  color?: string;
  glow?: string;
}

function StatRow({ label, value, color = '#fff', glow }: StatRowProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid rgba(155,48,255,0.15)',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: '0.05em' }}>
        {label}
      </span>
      <span style={{
        fontSize: color !== '#fff' ? 11 : 14,
        fontWeight: 800,
        color,
        textShadow: glow ? `0 0 10px ${glow}` : undefined,
        letterSpacing: '0.04em',
        fontFamily: color !== '#fff' ? '"Press Start 2P", monospace' : 'inherit',
      }}>
        {value}
      </span>
    </div>
  );
}

export default function StatsDashboard({ stats, onClose }: Props) {
  const winRate = getWinRate(stats);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        className="score-slide-in"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'linear-gradient(135deg, #1a0a2e, #0d0520)',
          border: '2px solid rgba(155,48,255,0.6)',
          borderRadius: 20,
          padding: '28px 32px',
          boxShadow: '0 0 40px rgba(155,48,255,0.4), 0 0 80px rgba(155,48,255,0.2)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: '0.08em',
            background: 'linear-gradient(90deg, #9b30ff, #ff00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(155,48,255,0.7))',
            marginBottom: 4,
          }}>
            RUN SUMMARY
          </h2>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>
            STATISTICS DASHBOARD
          </div>
        </div>

        {/* Win rate hero */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          style={{
            textAlign: 'center',
            marginBottom: 24,
            padding: '16px',
            borderRadius: 12,
            background: 'rgba(155,48,255,0.1)',
            border: '1px solid rgba(155,48,255,0.3)',
          }}
        >
          <div style={{
            fontSize: 52,
            fontWeight: 900,
            color: winRate >= 50 ? '#00ff88' : '#ff4466',
            textShadow: winRate >= 50
              ? '0 0 20px rgba(0,255,136,0.8)'
              : '0 0 20px rgba(255,68,102,0.8)',
            fontFamily: '"Press Start 2P", monospace',
            lineHeight: 1,
          }}>
            {winRate}%
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4, letterSpacing: '0.1em' }}>
            WIN RATE
          </div>
        </motion.div>

        {/* Stats grid */}
        <div style={{ marginBottom: 20 }}>
          <StatRow label="Hands Played" value={stats.handsPlayed} />
          <StatRow label="Wins" value={stats.wins} color="#00ff88" glow="rgba(0,255,136,0.8)" />
          <StatRow label="Losses" value={stats.losses} color="#ff4466" glow="rgba(255,68,102,0.8)" />
          <StatRow label="Pushes" value={stats.pushes} color="#00ffff" glow="rgba(0,255,255,0.8)" />
          <StatRow label="Blackjacks 🎉" value={stats.blackjacks} color="#ffd700" glow="rgba(255,215,0,0.8)" />
          <StatRow label="Win Streak (best)" value={stats.longestStreak} color="#ff00ff" glow="rgba(255,0,255,0.8)" />
          <StatRow label="Biggest Single Win" value={`${stats.biggestWin} chips`} color="#ffd700" glow="rgba(255,215,0,0.8)" />
          <StatRow label="Total Earned" value={`${stats.totalEarned > 0 ? '+' : ''}${stats.totalEarned}`} />
        </div>

        {/* Current streak */}
        {stats.currentStreak > 1 && (
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              textAlign: 'center',
              padding: '8px',
              borderRadius: 8,
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.4)',
              fontSize: 12,
              color: '#ffd700',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: 16,
              textShadow: '0 0 8px rgba(255,215,0,0.8)',
            }}
          >
            🔥 Current Win Streak: {stats.currentStreak}
          </motion.div>
        )}

        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #7b1fff, #9b30ff)',
            border: '2px solid #b44fff',
            color: '#fff',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(155,48,255,0.6)',
            outline: 'none',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
          }}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
