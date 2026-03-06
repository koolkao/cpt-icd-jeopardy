export function playCorrectDing(ctx: AudioContext) {
  // Two-tone ascending chime: C5 -> E5
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  const osc1 = ctx.createOscillator();
  osc1.frequency.value = 523.25; // C5
  osc1.type = "sine";
  osc1.connect(gain);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.2);

  const osc2 = ctx.createOscillator();
  osc2.frequency.value = 659.25; // E5
  osc2.type = "sine";
  osc2.connect(gain);
  osc2.start(ctx.currentTime + 0.15);
  osc2.stop(ctx.currentTime + 0.5);
}

export function playWrongBuzzer(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.value = 100;
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);
}

export function playCountdownTick(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 800;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export function playDailyDoubleFanfare(ctx: AudioContext) {
  const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.3);
  });
}

export function playVictoryFanfare(ctx: AudioContext) {
  // Triumphant chords
  const chord1 = [261.63, 329.63, 392.0];
  const chord2 = [261.63, 329.63, 392.0, 523.25];

  chord1.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  });

  chord2.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 2.0);
  });
}

export function playBuzzIn(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 1000;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}
