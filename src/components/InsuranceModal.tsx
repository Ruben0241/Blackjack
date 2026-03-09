import { motion } from 'framer-motion';
import ActionButton from './ActionButton';
import { useGameStore } from '../lib/useGameStore';

export default function InsuranceModal() {
  const { insurancePending, takeInsurance, declineInsurance, currentBet } = useGameStore();

  if (!insurancePending) return null;

  const insuranceCost = Math.floor(currentBet / 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
          border: '2px solid rgba(192,132,252,0.5)',
          borderRadius: 16,
          padding: '28px 36px',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(192,132,252,0.3), 0 20px 40px rgba(0,0,0,0.5)',
          maxWidth: 320,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
        <h2 style={{
          color: '#c084fc',
          fontSize: 20,
          fontWeight: 800,
          marginBottom: 8,
          textShadow: '0 0 12px rgba(192,132,252,0.8)',
        }}>
          Insurance?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 }}>
          Dealer shows an Ace.
        </p>
        <p style={{ color: '#fbbf24', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
          Cost: {insuranceCost} chips (pays 2:1)
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <ActionButton onClick={takeInsurance} variant="primary">
            Take Insurance
          </ActionButton>
          <ActionButton onClick={declineInsurance} variant="ghost">
            No Thanks
          </ActionButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
