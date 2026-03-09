import { useEffect, useState } from 'react';
import GameTable from './components/GameTable';
import Particles from './components/Particles';
import { startMusic, stopMusic } from './lib/audio';
import { motion } from 'framer-motion';

export default function App() {
  const [musicOn, setMusicOn] = useState(false);
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    setStarted(true);
    setMusicOn(true);
    startMusic();
  };

  const toggleMusic = () => {
    if (musicOn) {
      stopMusic();
      setMusicOn(false);
    } else {
      startMusic();
      setMusicOn(true);
    }
  };

  useEffect(() => {
    return () => stopMusic();
  }, []);

  if (!started) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #020617 0%, #0a0f1e 50%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        flexDirection: 'column',
        gap: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated bg glow */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            position: 'absolute',
            width: 600,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Card suit decorations */}
        {['♠', '♥', '♦', '♣'].map((s, i) => (
          <motion.div
            key={s}
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            style={{
              position: 'absolute',
              fontSize: 80,
              opacity: 0.05,
              color: s === '♥' || s === '♦' ? '#ef4444' : '#6366f1',
              ...[
                { top: '10%', left: '5%' },
                { top: '10%', right: '5%' },
                { bottom: '10%', left: '5%' },
                { bottom: '10%', right: '5%' },
              ][i],
            }}
          >
            {s}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ textAlign: 'center' }}
        >
          <h1 style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: '0.1em',
            background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.6))',
            marginBottom: 0,
          }}>
            BLACKJACK
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: 14,
            letterSpacing: '0.3em',
            marginTop: 4,
          }}>
            CASINO ROYALE
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            <span>🪙 1,000 Chips</span>
            <span>•</span>
            <span>♠ 6 Decks</span>
            <span>•</span>
            <span>🛡️ Insurance</span>
            <span>•</span>
            <span>✂️ Split</span>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          style={{
            padding: '16px 48px',
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: '2px solid #a78bfa',
            borderRadius: 14,
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 0 24px rgba(139,92,246,0.6), 0 8px 24px rgba(0,0,0,0.4)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        >
          Play Now
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}
        >
          Click Play Now to start — music will begin automatically
        </motion.p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <GameTable />
      <Particles />

      {/* Music toggle */}
      <button
        onClick={toggleMusic}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)',
          border: '1.5px solid rgba(99,102,241,0.4)',
          color: musicOn ? '#a78bfa' : 'rgba(255,255,255,0.3)',
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          boxShadow: musicOn ? '0 0 12px rgba(139,92,246,0.4)' : 'none',
          outline: 'none',
        }}
        title={musicOn ? 'Mute music' : 'Play music'}
      >
        {musicOn ? '♪' : '♩'}
      </button>
    </div>
  );
}
