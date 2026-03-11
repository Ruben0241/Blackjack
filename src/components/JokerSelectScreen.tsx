import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Joker } from '../types/game';
import { getJokerPool } from '../lib/jokers';
import JokerCard from './JokerCard';
import CanvasBackground from './CanvasBackground';

interface Props {
  onConfirm: (jokers: Joker[]) => void;
}

const MAX_SELECTED = 3;
const POOL_SIZE = 5;

export default function JokerSelectScreen({ onConfirm }: Props) {
  const [pool] = useState<Joker[]>(() => getJokerPool(POOL_SIZE));
  const [selected, setSelected] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (selected.length === MAX_SELECTED) {
      const timer = setTimeout(() => setReady(true), 200);
      return () => clearTimeout(timer);
    } else {
      setReady(false);
    }
  }, [selected]);

  const toggleJoker = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(j => j !== id);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, id];
    });
  };

  const handleConfirm = () => {
    const chosenJokers = pool.filter(j => selected.includes(j.id));
    onConfirm(chosenJokers);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d0520 0%, #1a0a2e 50%, #0d0520 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px 16px',
      fontFamily: '"Inter", sans-serif',
    }}>
      <CanvasBackground />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 800 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <h1 style={{
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: '0.06em',
            background: 'linear-gradient(90deg, #9b30ff, #ff00ff, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(155,48,255,0.7))',
            marginBottom: 8,
          }}>
            Choose Your Jokers
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            letterSpacing: '0.15em',
          }}>
            SELECT {MAX_SELECTED} JOKERS TO PLAY WITH
          </p>

          {/* Selection counter */}
          <div style={{
            marginTop: 12,
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
          }}>
            {Array.from({ length: MAX_SELECTED }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i < selected.length ? 1.1 : 1,
                  boxShadow: i < selected.length
                    ? '0 0 12px rgba(155,48,255,0.8), 0 0 24px rgba(155,48,255,0.4)'
                    : '0 0 4px rgba(155,48,255,0.2)',
                }}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: i < selected.length ? '#9b30ff' : 'rgba(155,48,255,0.2)',
                  border: '2px solid rgba(155,48,255,0.5)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Joker cards */}
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 32,
        }}>
          {pool.map((joker, i) => (
            <motion.div
              key={joker.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
            >
              <JokerCard
                joker={joker}
                selected={selected.includes(joker.id)}
                onSelect={() => toggleJoker(joker.id)}
                disabled={!selected.includes(joker.id) && selected.length >= MAX_SELECTED}
              />
            </motion.div>
          ))}
        </div>

        {/* Info note */}
        <div style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: 11,
          letterSpacing: '0.1em',
          marginBottom: 24,
        }}>
          RARE JOKERS HAVE STRONGER EFFECTS · EFFECTS STACK
        </div>

        {/* Confirm button */}
        <AnimatePresence>
          {ready && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <motion.button
                whileHover={{ scale: 1.06, y: -3 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleConfirm}
                style={{
                  padding: '16px 56px',
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(135deg, #7b1fff, #ff00ff)',
                  border: '2px solid #ff00ff',
                  borderRadius: 12,
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 0 24px rgba(255,0,255,0.7), 0 0 48px rgba(155,48,255,0.4), 0 8px 24px rgba(0,0,0,0.4)',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              >
                Let's Play! 🃏
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {!ready && selected.length > 0 && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(155,48,255,0.6)',
            fontSize: 12,
            letterSpacing: '0.08em',
          }}>
            {MAX_SELECTED - selected.length} more to select
          </div>
        )}
        {selected.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.2)',
            fontSize: 12,
            letterSpacing: '0.08em',
          }}>
            Click on joker cards to select them
          </div>
        )}
      </div>
    </div>
  );
}
