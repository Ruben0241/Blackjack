import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../lib/useGameStore';
import HandDisplay from './HandDisplay';
import { Chip, BetDisplay, CHIP_VALUES } from './ChipStack';
import ActionButton from './ActionButton';
import MessageBanner from './MessageBanner';
import InsuranceModal from './InsuranceModal';
import CanvasBackground from './CanvasBackground';
import JokerSlots from './JokerSlots';
import SideBetPanel from './SideBetPanel';
import StrategyHint from './StrategyHint';
import StatsDashboard from './StatsDashboard';
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
    activeJokers,
    sideBet,
    sideBetResult,
    stats,
    strategyMode,
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
    toggleStrategyMode,
  } = useGameStore();

  const [showStats, setShowStats] = useState(false);
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

  const dealerUpcard = dealerHand.cards.find(c => !c.faceDown) ?? null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d0520 0%, #1a0a2e 50%, #0d0520 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
    }}>
      <CanvasBackground />

      {/* Corner decorations */}
      {[
        { top: 12, left: 12 },
        { top: 12, right: 12 },
        { bottom: 12, left: 12 },
        { bottom: 12, right: 12 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          ...pos,
          width: 50,
          height: 50,
          borderTop: i < 2 ? '2px solid rgba(155,48,255,0.4)' : 'none',
          borderBottom: i >= 2 ? '2px solid rgba(155,48,255,0.4)' : 'none',
          borderLeft: i % 2 === 0 ? '2px solid rgba(155,48,255,0.4)' : 'none',
          borderRight: i % 2 === 1 ? '2px solid rgba(155,48,255,0.4)' : 'none',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
      ))}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: 860,
        zIndex: 2,
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glitch-text"
          data-text="BLACKJACK"
          style={{
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: '0.08em',
            background: 'linear-gradient(90deg, #9b30ff, #ff00ff, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(155,48,255,0.7))',
          }}
        >
          BLACKJACK
        </motion.h1>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Strategy Mode toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleStrategyMode}
            title="Toggle Strategy Hints"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: strategyMode ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1.5px solid ${strategyMode ? 'rgba(0,255,136,0.5)' : 'rgba(255,255,255,0.15)'}`,
              color: strategyMode ? '#00ff88' : 'rgba(255,255,255,0.4)',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              letterSpacing: '0.05em',
              fontFamily: 'inherit',
              boxShadow: strategyMode ? '0 0 10px rgba(0,255,136,0.3)' : 'none',
              textTransform: 'uppercase',
            }}
          >
            📊 Hints
          </motion.button>

          {/* Stats button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStats(true)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(155,48,255,0.1)',
              border: '1.5px solid rgba(155,48,255,0.4)',
              color: '#9b30ff',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              letterSpacing: '0.05em',
              fontFamily: 'inherit',
              boxShadow: '0 0 8px rgba(155,48,255,0.2)',
              textTransform: 'uppercase',
            }}
          >
            🏆 Stats
          </motion.button>

          {/* Chips display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,0,0,0.4)',
              border: '2px solid rgba(155,48,255,0.45)',
              borderRadius: 10,
              padding: '7px 14px',
              boxShadow: '0 0 16px rgba(155,48,255,0.2)',
            }}
          >
            <span style={{ fontSize: 16 }}>🪙</span>
            <motion.span
              key={chips}
              initial={{ opacity: 0.5, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pixel-font"
              style={{
                fontSize: 13,
                color: '#ffd700',
                textShadow: '0 0 14px rgba(255,215,0,0.9)',
              }}
            >
              {chips}
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* Joker slots */}
      {activeJokers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ zIndex: 2, marginTop: 4 }}
        >
          <JokerSlots jokers={activeJokers} />
        </motion.div>
      )}

      {/* Main table area */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 860,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        flex: 1,
        justifyContent: 'center',
      }}>
        {/* Table oval — dark violet with neon pulse */}
        <div
          className="neon-pulse"
          style={{
            position: 'absolute',
            inset: -20,
            borderRadius: '45%',
            background: 'radial-gradient(ellipse, rgba(26,10,46,0.85) 0%, rgba(13,5,32,0.5) 60%, transparent 80%)',
            border: '2px solid rgba(155,48,255,0.5)',
            pointerEvents: 'none',
          }}
        />

        {/* Dealer area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.2em',
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

        {/* Neon divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(155,48,255,0.6), rgba(255,0,255,0.4), rgba(155,48,255,0.6), transparent)',
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
            <div key={i} style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              {playerHands.length > 1 && (
                <div style={{
                  textAlign: 'center',
                  marginBottom: 4,
                  fontSize: 10,
                  color: i === activeHandIndex ? '#9b30ff' : 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textShadow: i === activeHandIndex ? '0 0 8px rgba(155,48,255,0.8)' : 'none',
                }}>
                  Hand {i + 1} {hand.bet > 0 && `· ${hand.bet}`}
                </div>
              )}
              <HandDisplay
                hand={hand}
                label={playerHands.length === 1 ? (hand.bet > 0 ? `Bet: ${hand.bet}` : '') : ''}
                isActive={isPlayerTurn && i === activeHandIndex}
                showValue={hand.cards.length > 0}
              />

              {/* Strategy hint */}
              {strategyMode && isPlayerTurn && i === activeHandIndex && dealerUpcard && (
                <StrategyHint playerHand={hand} dealerUpcard={dealerUpcard} />
              )}

              {/* Active hand glow */}
              {isPlayerTurn && i === activeHandIndex && (
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: -10,
                    borderRadius: 18,
                    border: '2px solid rgba(155,48,255,0.6)',
                    boxShadow: '0 0 24px rgba(155,48,255,0.3)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Bet area */}
        <div style={{ minHeight: 180 }}>
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
                {/* Main bet + side bet row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 24,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Main Bet:</span>
                      {currentBet > 0 ? (
                        <BetDisplay amount={currentBet} />
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>—</span>
                      )}
                    </div>
                  </div>

                  <SideBetPanel
                    sideBet={sideBet}
                    sideBetResult={sideBetResult}
                    currentBet={currentBet}
                    chips={chips}
                    phase={phase}
                  />
                </div>

                {/* Chips */}
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

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <ActionButton onClick={clearBet} variant="ghost" disabled={currentBet === 0}>
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

          {/* Side bet result (non-betting phases) */}
          {!isBetting && sideBetResult && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <SideBetPanel
                sideBet={sideBet}
                sideBetResult={sideBetResult}
                currentBet={currentBet}
                chips={chips}
                phase={phase}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        justifyContent: 'center',
        zIndex: 2,
        minHeight: 60,
        alignItems: 'center',
      }}>
        <AnimatePresence>
          {isPlayerTurn && !insurancePending && (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0 }}>
                <ActionButton onClick={() => { playSound('hit'); hit(); }} disabled={!canHit()} variant="primary">
                  Hit
                </ActionButton>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.05 }}>
                <ActionButton onClick={() => { playSound('stand'); stand(); }} disabled={!canStand()} variant="success">
                  Stand
                </ActionButton>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.1 }}>
                <ActionButton onClick={() => { playSound('chip'); doubleDown(); }} disabled={!canDoubleDown()} variant="warning">
                  Double
                </ActionButton>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.15 }}>
                <ActionButton onClick={() => { playSound('chip'); split(); }} disabled={!canSplitHand()} variant="cyan">
                  Split
                </ActionButton>
              </motion.div>
            </>
          )}

          {isRoundEnd && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <ActionButton onClick={newRound} variant="primary" size="lg">
                New Round
              </ActionButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rules */}
      <div style={{
        fontSize: 10,
        color: 'rgba(255,255,255,0.15)',
        letterSpacing: '0.08em',
        textAlign: 'center',
        zIndex: 2,
        marginTop: 6,
      }}>
        Blackjack pays 3:2 · Dealer stands on soft 17 · 6 Decks · Perfect Pairs available
      </div>

      <InsuranceModal />

      <AnimatePresence>
        {showStats && (
          <StatsDashboard stats={stats} onClose={() => setShowStats(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
