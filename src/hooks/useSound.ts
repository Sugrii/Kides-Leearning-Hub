export function useSound(soundEnabled: boolean = true) {
  const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', gainVal: number = 0.15) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio failure
    }
  };

  const playCorrect = () => {
    if (!soundEnabled) return;
    // Ascending major chord fanfare
    playTone(523.25, 0.15, 'sine', 0.2); // C5
    setTimeout(() => playTone(659.25, 0.18, 'sine', 0.2), 100); // E5
    setTimeout(() => playTone(783.99, 0.35, 'triangle', 0.25), 200); // G5
  };

  const playIncorrect = () => {
    if (!soundEnabled) return;
    playTone(280, 0.18, 'sine', 0.12);
    setTimeout(() => playTone(240, 0.25, 'sine', 0.12), 120);
  };

  const playCoin = () => {
    if (!soundEnabled) return;
    playTone(987.77, 0.1, 'sine', 0.18); // B5
    setTimeout(() => playTone(1318.51, 0.25, 'triangle', 0.22), 80); // E6
  };

  const playClick = () => {
    if (!soundEnabled) return;
    playTone(600, 0.04, 'sine', 0.08);
  };

  return { playCorrect, playIncorrect, playCoin, playClick };
}
