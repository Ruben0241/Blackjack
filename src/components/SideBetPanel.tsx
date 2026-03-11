import { motion, AnimatePresence } from 'framer-motion';
import type { SideBetResult } from '../types/game';
import { useGameStore } from '../lib/useGameStore';
import { playSound } from '../lib/audio';

const SIDE_BET_AMOUNTS = [5, 10, 25];

const RESULT_CONFIG = {
  perfect: { label: 'PERFECT PAIR!', color: '#ffd700', emoji: '👑', multiplier: '25:1' },
  colored: { label: 'COLORED PAIR!', color: '#ff00ff', emoji: '💜', multiplier: '10:1' },
  mixed:   { label: 'MIXED PAIR!',   color: '#00ffff', emoji: '💙', multiplier: '5:1' },
};

interface Props {
  sideBet: number;
  sideBetResult: SideBetResult | null;
  currentBet: number;
  chips: number;
  phase: string;
}

export default function SideBetPanel({ sideBet, sideBetResult, currentBet, chips, phase }: Props) {
  const { placeSideBet, clearSideBet } = useGameStore();
  const maxSideBet = currentBet > 0 ? Math.floor(currentBet * 0.25) : 50;
  const isBetting = phase === 'betting';

  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      border: '1.5px solid rgba(255,0,255,0.3)',
      borderRadius: 12,
      padding: '10px 16px',
      boxShadow: '0 0 16px rgba(255,0,255,0.1)',
      minWidth: 200,
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'rgba(255,0,255,0.7)',
        letterSpacing: '0.15em',
        marginBottom: 8,
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        🃏 Perfect Pairs
      </div>

      {/* Payout table */}
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 10, lineHeight: 1.6 }}>
        <div>Mixed Pair → <span style={{ color: '#00ffff' }}>5:1</span></div>
        <div>Colored Pair → <span style={{ color: '#ff00ff' }}>10:1</span></div>
        <div>Perfect Pair → <span style={{ color: '#ffd700' }}>25:1</span></div>
      </div>

      <AnimatePresence mode="wait">
        {/* Result display after dealing */}
        {sideBetResult && !isBetting && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              textAlign: 'center',
              padding: '8px 12px',
              borderRadius: 8,
              background: `${RESULT_CONFIG[sideBetResult.type].color}18`,
              border: `1.5px solid ${RESULT_CONFIG[sideBetResult.type].color}88`,
              boxShadow: `0 0 16px ${RESULT_CONFIG[sideBetResult.type].color}44`,
            }}
          >
            <div style={{ fontSize: 20 }}>{RESULT_CONFIG[sideBetResult.type].emoji}</div>
            <div style={{
              fontSize: 11,
              fontWeight: 900,
              color: RESULT_CONFIG[sideBetResult.type].color,
              textShadow: `0 0 8px ${RESULT_CONFIG[sideBetResult.type].color}`,
              letterSpacing: '0.05em',
            }}>
              {RESULT_CONFIG[sideBetResult.type].label}
            </div>
            <div style={{ fontSize: 13, color: '#ffd700', fontWeight: 800, marginTop: 2 }}>
              +{sideBetResult.payout} chips
            </div>
          </motion.div>
        )}

        {/* No result / loss */}
        {!sideBetResult && !isBetting && sideBet > 0 && (
          <motion.div
            key="no-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              fontSize: 11,
              color: 'rgba(255,68,102,0.7)',
              padding: '6px',
            }}
          >
            No pair — bet lost
          </motion.div>
        )}

        {/* Betting controls */}
        {isBetting && (
          <motion.div
            key="betting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.4)',
              marginBottom: 6,
            }}>
              Side Bet: <span style={{ color: '#ffd700', fontWeight: 700 }}>{sideBet}</span>
              {currentBet > 0 && (
                <span style={{ color: 'rgba(255,255,255,0.3)' }}> / max {maxSideBet}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {SIDE_BET_AMOUNTS.map(amt => (
                <motion.button
                  key={amt}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    playSound('chip');
                    placeSideBet(amt);
                  }}
                  disabled={sideBet + amt > maxSideBet || chips < amt || currentBet === 0}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    background: 'rgba(255,0,255,0.15)',
                    border: '1px solid rgba(255,0,255,0.4)',
                    color: '#ff00ff',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'inherit',
                    opacity: sideBet + amt > maxSideBet || chips < amt || currentBet === 0 ? 0.35 : 1,
                  }}
                >
                  +{amt}
                </motion.button>
              ))}
              {sideBet > 0 && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={clearSideBet}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  Clear
                </motion.button>
              )}
            </div>
            {currentBet === 0 && (
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                Place main bet first
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
