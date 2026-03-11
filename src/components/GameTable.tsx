import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../lib/useGameStore';
import HandDisplay from './HandDisplay';
import { Chip, BetDisplay, CHIP_VALUES } from './ChipStack';
import ActionButton from './ActionButton';
import MessageBanner from './MessageBanner';
import InsuranceModal from './InsuranceModal';
import { useEffect, useRef } from 'react';
import { playSound } from '../lib/audio';

export default function GameTable() {
  const {
    phase,
    playerHands,
    activeHandIndex,
    dealerHand,
    chips,
    currentBet,
    message,
    placeBet,
    clearBet,
    deal,
    hit,
    stand,
    double: doubleDown,
    split,
    newRound,
    canHit,
    canStand,
    canDoubleDown,
    canSplitHand,
    insurancePending,
  } = useGameStore();

  const prevPhase = useRef(phase);

  useEffect(() => {
    if (phase !== prevPhase.current) {
      if (phase === 'dealing') playSound('deal');
      if (phase === 'round-end') {
        const msg = message.toLowerCase();
        if (msg.includes('blackjack')) playSound('blackjack');
        else if (msg.includes('win')) playSound('win');
        else if (msg.includes('bust') || msg.includes('lose')) playSound('lose');
        else if (msg.includes('push')) playSound('push');
      }
    }
    prevPhase.current = phase;
  }, [phase, message]);

  const handleBetChip = (value: number) => {
    playSound('chip');
    placeBet(value);
  };

  const isBetting = phase === 'betting';
  const isPlayerTurn = phase === 'player-turn';
  const isRoundEnd = phase === 'round-end';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.08) 0%, transparent 60%),
          linear-gradient(180deg, #020617 0%, #0a0f1e 50%, #020617 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
      }}
    >
      {/* Background felt texture */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 30px,
            rgba(99,102,241,0.02) 30px,
            rgba(99,102,241,0.02) 31px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 30px,
            rgba(99,102,241,0.02) 30px,
            rgba(99,102,241,0.02) 31px
          )
        `,
        pointerEvents: 'none',
      }} />

      {/* Corner decorations */}
      {[
        { top: 16, left: 16 },
        { top: 16, right: 16 },
        { bottom: 16, left: 16 },
        { bottom: 16, right: 16 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          ...pos,
          width: 60,
          height: 60,
          borderTop: i < 2 ? '2px solid rgba(99,102,241,0.3)' : 'none',
          borderBottom: i >= 2 ? '2px solid rgba(99,102,241,0.3)' : 'none',
          borderLeft: i % 2 === 0 ? '2px solid rgba(99,102,241,0.3)' : 'none',
          borderRight: i % 2 === 1 ? '2px solid rgba(99,102,241,0.3)' : 'none',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: 800,
        zIndex: 1,
      }}>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '0.08em',
            background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5))',
          }}
        >
          BLACKJACK
        </motion.h1>

        {/* Chips display */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0,0,0,0.4)',
            border: '1.5px solid rgba(99,102,241,0.3)',
            borderRadius: 12,
            padding: '8px 16px',
            boxShadow: '0 0 16px rgba(99,102,241,0.15)',
          }}
        >
          <span style={{ fontSize: 18 }}>🪙</span>
          <motion.span
            key={chips}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: '#fbbf24',
              textShadow: '0 0 12px rgba(251,191,36,0.6)',
            }}
          >
            {chips}
          </motion.span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>chips</span>
        </motion.div>
      </div>

      {/* Main table oval */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 800,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        flex: 1,
        justifyContent: 'center',
      }}>
        {/* Table felt oval */}
        <div style={{
          position: 'absolute',
          inset: -20,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(5,46,22,0.6) 0%, rgba(2,20,10,0.3) 60%, transparent 80%)',
          border: '2px solid rgba(34,197,94,0.15)',
          boxShadow: '0 0 60px rgba(34,197,94,0.08)',
          pointerEvents: 'none',
        }} />

        {/* Dealer area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            Dealer
          </div>
          <HandDisplay
            hand={dealerHand}
            label=""
            showValue={phase !== 'betting'}
            isDealer
          />
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
          margin: '0 40px',
        }} />

        {/* Message */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MessageBanner message={message} />
        </div>

        {/* Player hands */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          flexWrap: 'wrap',
        }}>
          {playerHands.map((hand, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {playerHands.length > 1 && (
                <div style={{
                  textAlign: 'center',
                  marginBottom: 4,
                  fontSize: 11,
                  color: i === activeHandIndex ? '#a5f3fc' : 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.1em',
                }}>
                  Hand {i + 1} {hand.bet > 0 && `• Bet: ${hand.bet}`}
                </div>
              )}
              <HandDisplay
                hand={hand}
                label={playerHands.length === 1 ? (hand.bet > 0 ? `Bet: ${hand.bet}` : '') : ''}
                isActive={isPlayerTurn && i === activeHandIndex}
                showValue={hand.cards.length > 0}
              />
              {/* Active hand glow */}
              {isPlayerTurn && i === activeHandIndex && (
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: 16,
                    border: '2px solid rgba(165,243,252,0.5)',
                    boxShadow: '0 0 20px rgba(165,243,252,0.2)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Bet area (betting phase) */}
        <div style={{ minHeight: 140 }}>
        <AnimatePresence>
          {isBetting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {/* Current bet display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Current Bet:</span>
                {currentBet > 0 ? (
                  <BetDisplay amount={currentBet} />
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>—</span>
                )}
              </div>

              {/* Chip selector */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {CHIP_VALUES.map(val => (
                  <Chip
                    key={val}
                    value={val}
                    onClick={() => handleBetChip(val)}
                    disabled={chips < val}
                  />
                ))}
              </div>

              {/* Bet actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <ActionButton
                  onClick={clearBet}
                  variant="ghost"
                  disabled={currentBet === 0}
                >
                  Clear
                </ActionButton>
                <ActionButton
                  onClick={deal}
                  variant="success"
                  size="lg"
                  disabled={currentBet < 10 || currentBet > chips + currentBet}
                >
                  Deal
                </ActionButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Player action buttons */}
      <div style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        justifyContent: 'center',
        zIndex: 1,
        minHeight: 60,
        alignItems: 'center',
      }}>
        <AnimatePresence>
          {isPlayerTurn && !insurancePending && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0 }}>
                <ActionButton onClick={() => { playSound('hit'); hit(); }} disabled={!canHit()} variant="primary">
                  Hit
                </ActionButton>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.05 }}>
                <ActionButton onClick={() => { playSound('stand'); stand(); }} disabled={!canStand()} variant="success">
                  Stand
                </ActionButton>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.1 }}>
                <ActionButton onClick={() => { playSound('chip'); doubleDown(); }} disabled={!canDoubleDown()} variant="warning">
                  Double
                </ActionButton>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.15 }}>
                <ActionButton onClick={() => { playSound('chip'); split(); }} disabled={!canSplitHand()} variant="ghost">
                  Split
                </ActionButton>
              </motion.div>
            </>
          )}

          {isRoundEnd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ActionButton onClick={newRound} variant="primary" size="lg">
                New Round
              </ActionButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rules reminder */}
      <div style={{
        fontSize: 10,
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.08em',
        textAlign: 'center',
        zIndex: 1,
        marginTop: 8,
      }}>
        Blackjack pays 3:2 · Dealer stands on soft 17 · 6 Decks
      </div>

      {/* Insurance modal overlay */}
      <InsuranceModal />
    </div>
  );
}
