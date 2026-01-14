// Simple Sound Effects using Web Audio API
// No external assets required!

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playTone = (freq, type, duration, delay = 0) => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
};

export const playSuccessSound = () => {
    // A nice major chord "Ding!"
    playTone(523.25, 'sine', 0.6); // C5
    playTone(659.25, 'sine', 0.6, 0.1); // E5
    playTone(783.99, 'sine', 0.8, 0.2); // G5
    playTone(1046.50, 'triangle', 0.8, 0.2); // C6 (sparkle)
};

export const playErrorSound = () => {
    // A low jagged buzz
    playTone(150, 'sawtooth', 0.4);
    playTone(100, 'sawtooth', 0.4, 0.1);
};

export const vibrateSuccess = () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
};

export const vibrateError = () => {
    if (navigator.vibrate) navigator.vibrate([500]);
};
