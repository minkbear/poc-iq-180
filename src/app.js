'use strict';

// ── Configuration ──────────────────────────────────────────────────────────
const config = {
  numberCount: 5,   // 1–20
  mathDigits: 2,    // number of digits for math challenge (1–6)
  mathMaxValue: 0,  // max value cap for math challenge (0 = no cap)
  timerMinutes: 3,  // 1–60
};

// ── Colours for number cards ────────────────────────────────────────────────
const CARD_COLORS = [
  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
  '#C77DFF', '#FF9A3C', '#00C9A7', '#F72585',
];

// ── Random Numbers ──────────────────────────────────────────────────────────
function generateNumbers() {
  const nums = [];
  for (let i = 0; i < config.numberCount; i++) {
    nums.push(Math.floor(Math.random() * 10)); // 0–9
  }
  return nums;
}

function renderNumbers(nums) {
  const container = document.getElementById('numbers-display');
  container.innerHTML = '';
  nums.forEach((n, i) => {
    const card = document.createElement('div');
    card.className = 'number-card';
    card.textContent = n;
    card.style.backgroundColor = CARD_COLORS[i % CARD_COLORS.length];
    container.appendChild(card);
  });
}

// ── Math Challenge ──────────────────────────────────────────────────────────
function generateChallenge() {
  const digits = config.mathDigits;
  const min = Math.pow(10, digits - 1); // e.g. 10 for 2 digits
  const digitMax = Math.pow(10, digits) - 1;  // e.g. 99 for 2 digits
  const max = (config.mathMaxValue > 0 && config.mathMaxValue >= min)
    ? Math.min(digitMax, config.mathMaxValue)
    : digitMax;
  return min + Math.floor(Math.random() * (max - min + 1));
}

function renderChallenge(number) {
  document.getElementById('math-problem').textContent = number;
}

// ── Timer ───────────────────────────────────────────────────────────────────
let timerInterval = null;
let timerRemaining = 0;
let timerRunning = false;

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  document.getElementById('timer-display').textContent = formatTime(timerRemaining);
}

function playExpiry() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.28;
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  } catch (_) {
    // AudioContext unavailable — silent fallback
  }
}

function startTimer() {
  if (timerRunning) return;
  if (timerRemaining <= 0) {
    timerRemaining = config.timerMinutes * 60;
    updateTimerDisplay();
    document.getElementById('timer-display').classList.remove('timer-expired');
  }
  timerRunning = true;
  setTimerButtons(true);

  timerInterval = setInterval(() => {
    timerRemaining--;
    updateTimerDisplay();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      setTimerButtons(false);
      document.getElementById('timer-display').classList.add('timer-expired');
      playExpiry();
    }
  }, 1000);
}

function pauseTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  setTimerButtons(false);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerRemaining = config.timerMinutes * 60;
  updateTimerDisplay();
  setTimerButtons(false);
  document.getElementById('timer-display').classList.remove('timer-expired');
}

function setTimerButtons(running) {
  document.getElementById('btn-start').disabled = running;
  document.getElementById('btn-pause').disabled = !running;
}

// ── Config ──────────────────────────────────────────────────────────────────
function readConfig() {
  const count = parseInt(document.getElementById('cfg-number-count').value, 10);
  const digits = parseInt(document.getElementById('cfg-math-digits').value, 10);
  const maxVal = parseInt(document.getElementById('cfg-math-max').value, 10);
  const minutes = parseInt(document.getElementById('cfg-timer-min').value, 10);

  config.numberCount = Math.min(20, Math.max(1, count || 5));
  config.mathDigits = Math.min(6, Math.max(1, digits || 2));
  config.mathMaxValue = isNaN(maxVal) ? 0 : Math.max(0, maxVal);
  config.timerMinutes = Math.min(60, Math.max(1, minutes || 3));
}

function applyConfig() {
  readConfig();
  refresh();
  resetTimer();
}

// ── Refresh ─────────────────────────────────────────────────────────────────
function refresh() {
  renderNumbers(generateNumbers());
  renderChallenge(generateChallenge());
}

// ── Bootstrap ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Config
  ['cfg-number-count', 'cfg-math-digits', 'cfg-math-max', 'cfg-timer-min'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyConfig);
  });

  // Game buttons
  document.getElementById('btn-refresh').addEventListener('click', refresh);
  document.getElementById('btn-new-challenge').addEventListener('click', () => {
    renderChallenge(generateChallenge());
  });

  // Timer buttons
  document.getElementById('btn-start').addEventListener('click', startTimer);
  document.getElementById('btn-pause').addEventListener('click', pauseTimer);
  document.getElementById('btn-reset').addEventListener('click', resetTimer);

  // Initial render
  timerRemaining = config.timerMinutes * 60;
  updateTimerDisplay();
  setTimerButtons(false);
  refresh();
});
