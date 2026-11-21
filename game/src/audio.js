// The sounds, made rather than loaded: a chime when a difference is found, a low knock when a mark
// misses, a shimmer for a hint, a rising figure when a round is cleared and a falling one when the
// clock wins. Everything is two or three oscillators with an envelope, so the game ships no audio
// file and makes no request.
//
// Browsers hold sound until the page is touched, so nothing is created until the first key or click.

/** A note: frequency, when it starts (seconds from now), how long it rings, and how loud. */
function note(context, destination, { frequency, start, duration, gain, type }) {
  const at = context.currentTime + start;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type ?? 'sine';
  oscillator.frequency.setValueAtTime(frequency, at);
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(envelope);
  envelope.connect(destination);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.02);
}

/** The audio the game plays, created on the first gesture and silent if the browser refuses. */
export function createAudio() {
  let context = null;
  let master = null;
  let muted = false;

  const ensure = () => {
    if (context !== null) return context;
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (AudioContextClass === undefined) return null;
    try {
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = 0.32;
      master.connect(context.destination);
    } catch {
      context = null;
    }
    return context;
  };

  const play = (notes) => {
    if (muted) return;
    const ready = ensure();
    if (ready === null) return;
    if (ready.state === 'suspended') ready.resume();
    for (const noteSpec of notes) note(ready, master, noteSpec);
  };

  return {
    /** Call from the first key press or click, so the browser lets the game make sound. */
    unlock() {
      const ready = ensure();
      if (ready !== null && ready.state === 'suspended') ready.resume();
    },
    setMuted(value) {
      muted = value;
    },
    isMuted: () => muted,
    /** A two-note chime, a fifth apart, for a difference found. */
    found() {
      play([
        { frequency: 880, start: 0, duration: 0.22, gain: 0.5 },
        { frequency: 1318.5, start: 0.06, duration: 0.3, gain: 0.36 },
      ]);
    },
    /** A dull knock, low and short, for a mark that finds nothing. */
    miss() {
      play([{ frequency: 138, start: 0, duration: 0.16, gain: 0.45, type: 'triangle' }]);
    },
    /** A soft shimmer for a hint. */
    hint() {
      play([
        { frequency: 659.3, start: 0, duration: 0.18, gain: 0.3, type: 'triangle' },
        { frequency: 987.8, start: 0.09, duration: 0.26, gain: 0.24, type: 'triangle' },
      ]);
    },
    /** A rising figure for a round cleared. */
    cleared() {
      [523.3, 659.3, 784, 1046.5].forEach((frequency, index) => {
        play([{ frequency, start: index * 0.1, duration: 0.34, gain: 0.4 }]);
      });
    },
    /** A falling figure for the clock running out. */
    over() {
      [523.3, 415.3, 311.1].forEach((frequency, index) => {
        play([{ frequency, start: index * 0.14, duration: 0.4, gain: 0.36, type: 'triangle' }]);
      });
    },
  };
}
