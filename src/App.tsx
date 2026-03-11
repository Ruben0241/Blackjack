import { useEffect, useState } from 'react';
import GameTable from './components/GameTable';
import Particles from './components/Particles';
import JokerSelectScreen from './components/JokerSelectScreen';
import CanvasBackground from './components/CanvasBackground';
import { startMusic, stopMusic } from './lib/audio';
import { motion } from 'framer-motion';
import type { Joker } from './types/game';
import { useGameStore } from './lib/useGameStore';

type AppScreen = 'splash' | 'joker-select' | 'game';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [musicOn, setMusicOn] = useState(false);
  const { selectJokers } = useGameStore();

  const handleSplashStart = () => {
    setScreen('joker-select');
    startMusic();
    setMusicOn(true);
  };

  const handleJokersConfirmed = (jokers: Joker[]) => {
    selectJokers(jokers);
    setScreen('game');
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

  if (screen === 'splash') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0d0520 0%, #1a0a2e 50%, #0d0520 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        flexDirection: 'column',
        gap: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <CanvasBackground />

        {/* Animated bg glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            position: 'absolute',
            width: 700,
            height: 450,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(155,48,255,0.2), transparent 70%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Card suit decorations */}
        {(['♠', '♥', '♦', '♣'] as const).map((s, i) => (
          <motion.div
            key={s}
            animate={{ y: [0, -12, 0], rotate: [0, 6, -6, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            style={{
              position: 'absolute',
              fontSize: 100,
              opacity: 0.06,
              color: s === '♥' || s === '♦' ? '#ff00ff' : '#9b30ff',
              zIndex: 1,
              ...[
                { top: '8%', left: '4%' },
                { top: '8%', right: '4%' },
                { bottom: '8%', left: '4%' },
                { bottom: '8%', right: '4%' },
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
          style={{ textAlign: 'center', zIndex: 2 }}
        >
          <h1
            className="glitch-text"
            data-text="BLACKJACK"
            style={{
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: '0.1em',
              background: 'linear-gradient(90deg, #9b30ff, #ff00ff, #ffd700, #ff00ff, #9b30ff)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 24px rgba(155,48,255,0.8))',
              marginBottom: 0,
              animation: 'shimmer 3s linear infinite',
            }}
          >
            BLACKJACK
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: 13,
            letterSpacing: '0.4em',
            marginTop: 6,
            textTransform: 'uppercase',
          }}>
            Casino Royale
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            gap: 20,
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            zIndex: 2,
            letterSpacing: '0.05em',
          }}
        >
          <span>🪙 1,000 Chips</span>
          <span>·</span>
          <span>🃏 Joker System</span>
          <span>·</span>
          <span>♠ 6 Decks</span>
          <span>·</span>
          <span>📊 Strategy Hints</span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.06, y: -4 }}
          whileTap={{ scale: 0.94 }}
          onClick={handleSplashStart}
          style={{
            padding: '18px 56px',
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #7b1fff, #ff00ff)',
            border: '2px solid #ff00ff',
            borderRadius: 14,
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 0 28px rgba(255,0,255,0.7), 0 0 56px rgba(155,48,255,0.4), 0 8px 24px rgba(0,0,0,0.5)',
            outline: 'none',
            fontFamily: 'inherit',
            zIndex: 2,
          }}
        >
          Play Now
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, zIndex: 2 }}
        >
          Choose your Jokers · Then play!
        </motion.p>
      </div>
    );
  }

  if (screen === 'joker-select') {
    return <JokerSelectScreen onConfirm={handleJokersConfirmed} />;
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
          border: `1.5px solid ${musicOn ? 'rgba(155,48,255,0.6)' : 'rgba(255,255,255,0.2)'}`,
          color: musicOn ? '#9b30ff' : 'rgba(255,255,255,0.3)',
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          boxShadow: musicOn ? '0 0 16px rgba(155,48,255,0.5)' : 'none',
          outline: 'none',
        }}
        title={musicOn ? 'Mute music' : 'Play music'}
      >
        {musicOn ? '♪' : '♩'}
      </button>
    </div>
  );
}
