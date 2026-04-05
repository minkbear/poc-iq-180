'use strict';

// ── Configuration ──────────────────────────────────────────────────────────
const config = {
  numberCount: 5,   // 1–20
  mathDigits: 2,    // number of digits for math challenge (1–6)
  mathMaxValue: 0,  // max value cap for math challenge (0 = no cap)
  timerMinutes: 3,  // 1–60
  mathOps: { add: true, sub: true, mul: true },
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
function generateOperand() {
  const digits = config.mathDigits;
  const min = Math.pow(10, digits - 1); // e.g. 10 for 2 digits
  const digitMax = Math.pow(10, digits) - 1;  // e.g. 99 for 2 digits
  const max = (config.mathMaxValue > 0 && config.mathMaxValue >= min)
    ? Math.min(digitMax, config.mathMaxValue)
    : digitMax;
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generateChallenge() {
  const ops = [];
  if (config.mathOps.add) ops.push('+');
  if (config.mathOps.sub) ops.push('−');
  if (config.mathOps.mul) ops.push('×');
  const op = ops[Math.floor(Math.random() * ops.length)];

  let a = generateOperand();
  let b = generateOperand();

  // Subtraction: ensure non-negative result
  if (op === '−' && a < b) { const tmp = a; a = b; b = tmp; }

  return { a, op, b };
}

function renderChallenge({ a, op, b }) {
  document.getElementById('math-problem').textContent = `${a} ${op} ${b} = ?`;
}

// ── Sound / Mute ────────────────────────────────────────────────────────────
let isMuted = localStorage.getItem('mathgame-muted') === 'true';

function updateMuteButton() {
  const btn = document.getElementById('btn-mute');
  if (!btn) return;
  if (isMuted) {
    btn.textContent = '🔇';
    btn.setAttribute('aria-label', 'Unmute sound');
    btn.setAttribute('title', 'Unmute sound');
    btn.classList.add('muted');
  } else {
    btn.textContent = '🔊';
    btn.setAttribute('aria-label', 'Mute sound');
    btn.setAttribute('title', 'Mute sound');
    btn.classList.remove('muted');
  }
}

function toggleMute() {
  isMuted = !isMuted;
  localStorage.setItem('mathgame-muted', isMuted);
  updateMuteButton();
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
  const el = document.getElementById('timer-display');
  el.textContent = formatTime(timerRemaining);
  if (timerRemaining > 0 && timerRemaining <= 30) {
    el.classList.add('timer-warning');
  } else {
    el.classList.remove('timer-warning');
  }
}

function playExpiry() {
  if (isMuted) return;
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
    document.getElementById('timer-display').classList.remove('timer-expired', 'timer-warning');
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
      const el = document.getElementById('timer-display');
      el.classList.remove('timer-warning');
      el.classList.add('timer-expired');
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
  const timerEl = document.getElementById('timer-display');
  timerEl.classList.remove('timer-warning');
  timerEl.classList.remove('timer-expired');
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

  const add = document.getElementById('cfg-op-add').checked;
  const sub = document.getElementById('cfg-op-sub').checked;
  const mul = document.getElementById('cfg-op-mul').checked;
  // At least one must remain selected
  if (!add && !sub && !mul) {
    document.getElementById('cfg-op-add').checked = true;
    config.mathOps = { add: true, sub: false, mul: false };
  } else {
    config.mathOps = { add, sub, mul };
  }
}

function applyConfig() {
  readConfig();
  resetTimer();
  if (isSpinning) return;
  spinAndReveal(generateNumbers(), generateChallenge());
}

// ── Refresh ─────────────────────────────────────────────────────────────────
function refresh() {
  renderNumbers(generateNumbers());
  renderChallenge(generateChallenge());
}

// ── Spin Animation ──────────────────────────────────────────────────────────
const SPIN_FAST_MS = 80;
const SPIN_SLOW_MS = 200;
const SPIN_FAST_DURATION = 1800;
const SPIN_SLOW_TICKS = 4;
const CARD_STAGGER_MS = 60;

let isSpinning = false;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setGameButtonsDisabled(disabled) {
  isSpinning = disabled;
  document.getElementById('btn-refresh').disabled = disabled;
  document.getElementById('btn-new-challenge').disabled = disabled;
}

// Spin a single DOM element through random values then settle on finalValue.
// randomFn: () => string — returns a random display value during spin
// finalValue: string — value to show at the end
// offsetMs: start delay in ms
// onDone: called when this element's animation is complete
function spinElement(el, randomFn, finalValue, offsetMs, onDone) {
  setTimeout(() => {
    el.classList.add('spinning');

    const fastInterval = setInterval(() => {
      el.textContent = randomFn();
    }, SPIN_FAST_MS);

    setTimeout(() => {
      clearInterval(fastInterval);
      let slowTicks = 0;
      const slowInterval = setInterval(() => {
        el.textContent = randomFn();
        slowTicks++;
        if (slowTicks >= SPIN_SLOW_TICKS) {
          clearInterval(slowInterval);
          el.textContent = finalValue;
          el.classList.remove('spinning');
          if (onDone) onDone();
        }
      }, SPIN_SLOW_MS);
    }, SPIN_FAST_DURATION);
  }, offsetMs);
}

function spinAndReveal(nums, challenge) {
  if (prefersReducedMotion()) {
    renderNumbers(nums);
    renderChallenge(challenge);
    return;
  }

  setGameButtonsDisabled(true);

  // Render cards with placeholder values so elements exist in the DOM
  renderNumbers(nums.map(() => Math.floor(Math.random() * 10)));

  const container = document.getElementById('numbers-display');
  const cards = Array.from(container.querySelectorAll('.number-card'));
  const challengeEl = document.getElementById('math-problem');

  let doneCount = 0;
  const total = cards.length + 1; // cards + challenge number

  function onOneDone() {
    doneCount++;
    if (doneCount >= total) {
      setGameButtonsDisabled(false);
    }
  }

  cards.forEach((card, i) => {
    spinElement(
      card,
      () => String(Math.floor(Math.random() * 10)),
      String(nums[i]),
      i * CARD_STAGGER_MS,
      onOneDone
    );
  });

  // Challenge number lands ~100ms after the last card
  const challengeDelay = (cards.length - 1) * CARD_STAGGER_MS + 100;
  const challengeText = `${challenge.a} ${challenge.op} ${challenge.b} = ?`;
  spinElement(
    challengeEl,
    () => String(generateOperand()),
    challengeText,
    challengeDelay,
    onOneDone
  );
}

function spinChallengeOnly(challenge) {
  if (prefersReducedMotion()) {
    renderChallenge(challenge);
    return;
  }

  setGameButtonsDisabled(true);

  const challengeEl = document.getElementById('math-problem');
  const challengeText = `${challenge.a} ${challenge.op} ${challenge.b} = ?`;
  spinElement(
    challengeEl,
    () => String(generateOperand()),
    challengeText,
    0,
    () => setGameButtonsDisabled(false)
  );
}

// ── Bootstrap ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Config
  ['cfg-number-count', 'cfg-math-digits', 'cfg-math-max', 'cfg-timer-min'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyConfig);
  });
  ['cfg-op-add', 'cfg-op-sub', 'cfg-op-mul'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyConfig);
  });

  // Game buttons
  document.getElementById('btn-refresh').addEventListener('click', () => {
    readConfig();
    spinAndReveal(generateNumbers(), generateChallenge());
  });
  document.getElementById('btn-new-challenge').addEventListener('click', () => {
    readConfig();
    spinChallengeOnly(generateChallenge());
  });

  // Timer buttons
  document.getElementById('btn-start').addEventListener('click', startTimer);
  document.getElementById('btn-pause').addEventListener('click', pauseTimer);
  document.getElementById('btn-reset').addEventListener('click', resetTimer);

  // Settings bottom-sheet backdrop (mobile/tablet)
  const settingsDetails = document.getElementById('settings-details');
  const settingsBackdrop = document.getElementById('settings-backdrop');
  if (settingsDetails && settingsBackdrop) {
    settingsDetails.addEventListener('toggle', () => {
      settingsBackdrop.classList.toggle('active', settingsDetails.open);
    });
    settingsBackdrop.addEventListener('click', () => {
      settingsDetails.open = false;
      settingsBackdrop.classList.remove('active');
    });
  }

  // Mute toggle
  const muteBtn = document.getElementById('btn-mute');
  if (muteBtn) {
    muteBtn.addEventListener('click', toggleMute);
  }
  updateMuteButton();

  // Initial render
  timerRemaining = config.timerMinutes * 60;
  updateTimerDisplay();
  setTimerButtons(false);
  refresh();
});
