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

// Lock & Key sounds

export function playTimerWarning(ctx: AudioContext) {
  // Higher-pitched tick for last 10 seconds
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 1200;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

export function playTimerExpired(ctx: AudioContext) {
  // Descending two-tone: time's up
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

  const osc1 = ctx.createOscillator();
  osc1.frequency.value = 600;
  osc1.type = "square";
  osc1.connect(gain);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.15);

  const osc2 = ctx.createOscillator();
  osc2.frequency.value = 400;
  osc2.type = "square";
  osc2.connect(gain);
  osc2.start(ctx.currentTime + 0.2);
  osc2.stop(ctx.currentTime + 0.6);
}

export function playRevealCorrect(ctx: AudioContext) {
  // Quick bright chime for a correct reveal
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 880; // A5
  osc.type = "sine";
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export function playRevealIncorrect(ctx: AudioContext) {
  // Low thud for incorrect reveal
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 150;
  osc.type = "triangle";
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playSubmitted(ctx: AudioContext) {
  // Soft confirmation click
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 700;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export function playPerfectRound(ctx: AudioContext) {
  // Triumphant ascending arpeggio
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.4);
  });
}

// Code Serpent sounds

export function playCollectCorrect(ctx: AudioContext) {
  // Quick bright ping
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 880;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playCollectWrong(ctx: AudioContext) {
  // Low buzz
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 150;
  osc.type = "sawtooth";
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playCollision(ctx: AudioContext) {
  // Impact thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
  osc.type = "triangle";
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playCountdownBeep(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 660;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export function playRoundStart(ctx: AudioContext) {
  // Ascending two-note
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

  const osc1 = ctx.createOscillator();
  osc1.frequency.value = 440;
  osc1.type = "sine";
  osc1.connect(gain);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.15);

  const osc2 = ctx.createOscillator();
  osc2.frequency.value = 660;
  osc2.type = "sine";
  osc2.connect(gain);
  osc2.start(ctx.currentTime + 0.1);
  osc2.stop(ctx.currentTime + 0.4);
}

export function playRoundEnd(ctx: AudioContext) {
  // Descending two-note
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  const osc1 = ctx.createOscillator();
  osc1.frequency.value = 660;
  osc1.type = "sine";
  osc1.connect(gain);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.2);

  const osc2 = ctx.createOscillator();
  osc2.frequency.value = 440;
  osc2.type = "sine";
  osc2.connect(gain);
  osc2.start(ctx.currentTime + 0.15);
  osc2.stop(ctx.currentTime + 0.5);
}
