// Web Audio API based sound engine - no external files needed
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  freq: number,
  type: OscillatorType,
  duration: number,
  volume = 0.15,
  startTime?: number
) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.value = freq;
    const t = startTime ?? ac.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch {
    // AudioContext may not be available
  }
}

function playNoise(duration: number, volume = 0.05) {
  try {
    const ac = getCtx();
    const bufferSize = Math.floor(ac.sampleRate * duration);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    source.connect(gain);
    gain.connect(ac.destination);
    source.start();
  } catch {}
}

export type SoundName = 'deal' | 'hit' | 'chip' | 'win' | 'lose' | 'blackjack' | 'push' | 'stand';

export function playSound(name: SoundName) {
  try {
    switch (name) {
      case 'deal':
        // Swoosh sound
        playNoise(0.08, 0.04);
        playTone(800, 'sine', 0.05, 0.06);
        break;
      case 'hit':
        playNoise(0.06, 0.05);
        playTone(500, 'sine', 0.05, 0.08);
        break;
      case 'chip': {
        // Chip click - short bright ticks
        const ac = getCtx();
        [0, 0.06, 0.12].forEach((offset, i) => {
          playTone(1200 + i * 200, 'square', 0.04, 0.04, ac.currentTime + offset);
        });
        break;
      }
      case 'win': {
        // Ascending win jingle
        const ac = getCtx();
        const notes = [523, 659, 784, 1047];
        notes.forEach((f, i) => {
          playTone(f, 'sine', 0.2, 0.15, ac.currentTime + i * 0.12);
        });
        break;
      }
      case 'blackjack': {
        // Big fanfare
        const ac = getCtx();
        const bj = [523, 659, 784, 1047, 1319];
        bj.forEach((f, i) => {
          playTone(f, 'sine', 0.3, 0.2, ac.currentTime + i * 0.1);
          playTone(f * 1.5, 'sine', 0.15, 0.08, ac.currentTime + i * 0.1 + 0.05);
        });
        break;
      }
      case 'lose':
        // Descending sad tones
        {
          const ac = getCtx();
          [400, 320, 260].forEach((f, i) => {
            playTone(f, 'sawtooth', 0.2, 0.1, ac.currentTime + i * 0.15);
          });
        }
        break;
      case 'push':
        playTone(440, 'sine', 0.15, 0.1);
        playTone(440, 'sine', 0.15, 0.1);
        break;
      case 'stand':
        playTone(600, 'sine', 0.08, 0.08);
        break;
    }
  } catch {}
}

// Ambient looping music
let musicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let musicRunning = false;


export function startMusic() {
  if (musicRunning) return;
  musicRunning = true;

  try {
    const ac = getCtx();

    // Pad chords - slow ethereal atmosphere
    const playChord = (freqs: number[], time: number, dur: number) => {
      freqs.forEach(f => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.03, time + 0.5);
        gain.gain.setValueAtTime(0.03, time + dur - 0.5);
        gain.gain.linearRampToValueAtTime(0, time + dur);
        osc.start(time);
        osc.stop(time + dur + 0.1);
        musicNodes.push({ osc, gain });
      });
    };

    // Ambient bass pulse
    const playBass = (freq: number, time: number) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ac.destination);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.04, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
      osc.start(time);
      osc.stop(time + 0.7);
    };

    // Schedule 30 seconds of ambient music then loop
    const schedule = () => {
      if (!musicRunning) return;
      const now = ac.currentTime;
      const chords = [
        [110, 138.6, 165.0, 220],
        [98, 123.5, 146.8, 196],
        [116.5, 146.8, 174.6, 220],
        [110, 130.8, 164.8, 220],
      ];
      const bassNotes = [55, 49, 58.3, 55];

      chords.forEach((chord, i) => {
        playChord(chord, now + i * 4, 4.5);
        for (let b = 0; b < 4; b++) {
          playBass(bassNotes[i], now + i * 4 + b * 1);
        }
      });

      // Schedule next cycle
      setTimeout(schedule, 15000);
    };

    schedule();
  } catch {}
}

export function stopMusic() {
  musicRunning = false;
  musicNodes.forEach(({ osc, gain }) => {
    try {
      gain.gain.setValueAtTime(gain.gain.value, getCtx().currentTime);
      gain.gain.linearRampToValueAtTime(0, getCtx().currentTime + 0.5);
      osc.stop(getCtx().currentTime + 0.6);
    } catch {}
  });
  musicNodes = [];
}
