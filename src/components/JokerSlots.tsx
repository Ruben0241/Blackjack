import { motion } from 'framer-motion';
import type { Joker } from '../types/game';
import JokerCard from './JokerCard';

interface Props {
  jokers: Joker[];
}

export default function JokerSlots({ jokers }: Props) {
  if (jokers.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {jokers.map((joker, i) => (
        <motion.div
          key={joker.id}
          initial={{ opacity: 0, scale: 0.7, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 250 }}
          className="glow-pulse"
        >
          <JokerCard joker={joker} mini />
        </motion.div>
      ))}
    </div>
  );
}
