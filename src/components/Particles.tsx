import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameStore } from '../lib/useGameStore';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
}

const COLORS = ['#fbbf24', '#a855f7', '#6366f1', '#ec4899', '#22c55e', '#ef4444'];

export default function Particles() {
  const { phase, message } = useGameStore();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (phase === 'round-end') {
      const msg = message.toLowerCase();
      const isWin = msg.includes('win') || msg.includes('blackjack') || msg.includes('push');
      if (!isWin) return;

      const count = msg.includes('blackjack') ? 40 : 20;
      const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: 40 + Math.random() * 20,
        y: 40 + Math.random() * 20,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 8,
        angle: Math.random() * 360,
        distance: 100 + Math.random() * 200,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 2000);
    }
  }, [phase, message]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 100,
    }}>
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{
              x: `${p.x}vw`,
              y: `${p.y}vh`,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: `calc(${p.x}vw + ${Math.cos(p.angle * Math.PI / 180) * p.distance}px)`,
              y: `calc(${p.y}vh + ${Math.sin(p.angle * Math.PI / 180) * p.distance}px)`,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 1.2 + Math.random() * 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: Math.random() > 0.5 ? '50%' : 2,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
