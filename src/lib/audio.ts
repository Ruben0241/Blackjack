// Web Audio API based sound engine — Synthwave/Balatro style
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

function playSweep(
  freqStart: number,
  freqEnd: number,
  type: OscillatorType,
  duration: number,
  volume = 0.1,
  startTime?: number
) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    const t = startTime ?? ac.currentTime;
    osc.frequency.setValueAtTime(freqStart, t);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch {}
}

function playNoise(duration: number, volume = 0.05, startTime?: number) {
  try {
    const ac = getCtx();
    const bufferSize = Math.floor(ac.sampleRate * duration);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const gain = ac.createGain();
    const t = startTime ?? ac.currentTime;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(gain);
    gain.connect(ac.destination);
    source.start(t);
  } catch {}
}

export type SoundName = 'deal' | 'hit' | 'chip' | 'win' | 'lose' | 'blackjack' | 'push' | 'stand';

export function playSound(name: SoundName) {
  try {
    const ac = getCtx();
    switch (name) {
      case 'deal':
        // Synth swoosh: sawtooth frequency sweep up
        playSweep(120, 900, 'sawtooth', 0.18, 0.07);
        playNoise(0.1, 0.03);
        break;
      case 'hit':
        // Quick synth hit with noise burst
        playNoise(0.05, 0.06);
        playSweep(300, 600, 'square', 0.08, 0.06);
        break;
      case 'chip': {
        // Chip clicks — bright square ticks
        [0, 0.05, 0.1].forEach((offset, i) => {
          playTone(1400 + i * 300, 'square', 0.035, 0.05, ac.currentTime + offset);
        });
        break;
      }
      case 'win': {
        // Chiptune arpeggio — C4 E4 G4 C5 (square wave)
        const notes = [262, 330, 392, 523];
        notes.forEach((f, i) => {
          playTone(f, 'square', 0.12, 0.12, ac.currentTime + i * 0.08);
          // Harmonic overtone
          playTone(f * 2, 'sine', 0.1, 0.04, ac.currentTime + i * 0.08 + 0.02);
        });
        break;
      }
      case 'blackjack': {
        // Epic chiptune fanfare with arpeggiated chords
        const fanfare = [262, 330, 392, 523, 659, 784, 1047];
        fanfare.forEach((f, i) => {
          playTone(f, 'square', 0.22, 0.13, ac.currentTime + i * 0.09);
          playTone(f * 1.5, 'triangle', 0.15, 0.05, ac.currentTime + i * 0.09 + 0.04);
        });
        // Final chord
        [523, 659, 784].forEach(f => {
          playTone(f, 'square', 0.4, 0.1, ac.currentTime + 0.7);
        });
        break;
      }
      case 'lose': {
        // Glitch-style descending square + noise burst
        playNoise(0.05, 0.08);
        const loseNotes = [300, 240, 180, 130];
        loseNotes.forEach((f, i) => {
          playTone(f, 'square', 0.15, 0.08, ac.currentTime + i * 0.1);
        });
        // Glitch stutter
        [0.05, 0.07, 0.09].forEach(t => {
          playNoise(0.02, 0.05, ac.currentTime + t);
        });
        break;
      }
      case 'push': {
        // Double neutral tone — A4 twice
        playTone(440, 'triangle', 0.12, 0.09);
        playTone(440, 'triangle', 0.12, 0.09, ac.currentTime + 0.15);
        break;
      }
      case 'stand': {
        // Smooth synth confirm tone
        playTone(523, 'sine', 0.1, 0.1);
        playTone(659, 'sine', 0.08, 0.06, ac.currentTime + 0.08);
        break;
      }
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

    // Synthwave pad chords with lo-fi filter
    const playPad = (freqs: number[], time: number, dur: number) => {
      freqs.forEach(f => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        filter.Q.value = 2;
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.018, time + 0.8);
        gain.gain.setValueAtTime(0.018, time + dur - 0.8);
        gain.gain.linearRampToValueAtTime(0, time + dur);
        osc.start(time);
        osc.stop(time + dur + 0.1);
        musicNodes.push({ osc, gain });
      });
    };

    // Arpeggiated synth melody (square wave, higher octave)
    const playArp = (notes: number[], time: number, stepDuration: number) => {
      notes.forEach((f, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = f * 2;
        osc.type = 'square';
        osc.frequency.value = f;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        const t = time + i * stepDuration;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.025, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.8);
        osc.start(t);
        osc.stop(t + stepDuration);
        musicNodes.push({ osc, gain });
      });
    };

    // Synthwave bass pulse (sawtooth)
    const playBass = (freq: number, time: number) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.05, time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
      osc.start(time);
      osc.stop(time + 0.6);
      musicNodes.push({ osc, gain });
    };

    const schedule = () => {
      if (!musicRunning) return;
      const now = ac.currentTime;

      // 4 chord progression in Am: Am - F - C - G
      const chords = [
        [110, 165, 220, 277],  // Am
        [87, 130, 174, 220],   // F
        [131, 165, 196, 262],  // C
        [98, 147, 196, 246],   // G
      ];
      const bassNotes = [55, 43.7, 65.4, 49];
      // Arp pattern over Am scale
      const arpNotes = [440, 523, 587, 659, 587, 523, 440, 392];

      chords.forEach((chord, i) => {
        playPad(chord, now + i * 4, 4.2);
        // Bass on each beat
        for (let b = 0; b < 4; b++) {
          playBass(bassNotes[i], now + i * 4 + b);
        }
      });

      // Arp melody over first 2 chords
      playArp(arpNotes, now + 0.5, 0.25);
      playArp(arpNotes.map(f => f * 0.75), now + 8.5, 0.25);

      setTimeout(schedule, 16000);
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
