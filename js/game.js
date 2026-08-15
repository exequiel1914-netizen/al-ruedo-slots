import { AudioManager, UI } from './ui.js';

const SYMBOLS = [
  'moto',
  'casco',
  'rueda',
  'herramienta',
  'estrella',
  'logo-bonus'
];

const REEL_COUNT = 5;
const ROWS = 3;

let credits = 1000;
let bet = 10;
let isSpinning = false;

const reelsContainer = document.getElementById('reels');
const creditsEl = document.getElementById('credits');
const betEl = document.getElementById('bet');
const spinBtn = document.getElementById('spin');
const betIncBtn = document.getElementById('betInc');
const betDecBtn = document.getElementById('betDec');
const muteBtn = document.getElementById('mute');
const messageEl = document.getElementById('message');

const audio = new AudioManager();

const ui = new UI({
  creditsEl: 'credits',
  betEl: 'bet',
  messageEl: 'message'
});

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function setImageSymbol(img, symbol) {
  img.src = `assets/symbols/${symbol}.svg`;
  img.alt = symbol;
  img.dataset.symbol = symbol;
}

function createSlot(symbol) {
  const slot = document.createElement('div');
  slot.className = 'slot';

  const img = document.createElement('img');
  img.className = 'symbol';
  img.draggable = false;

  setImageSymbol(img, symbol);
  slot.appendChild(img);

  return slot;
}

function renderReels() {
  if (!reelsContainer) return;

  reelsContainer.innerHTML = '';

  for (let col = 0; col < REEL_COUNT; col++) {
    const reel = document.createElement('div');
    reel.className = 'reel';
    reel.dataset.index = col;

    for (let row = 0; row < ROWS; row++) {
      reel.appendChild(createSlot(randomSymbol()));
    }

    reelsContainer.appendChild(reel);
  }
}

function updateCreditsDisplay() {
  if (creditsEl) creditsEl.textContent = credits;
}

function updateBetDisplay() {
  if (betEl) betEl.textContent = bet;
}

function showMessage(text, timeout = 1500) {
  if (ui && typeof ui.showMessage === 'function') {
    ui.showMessage(text, timeout);
    return;
  }

  if (!messageEl) return;

  messageEl.hidden = false;
  messageEl.textContent = text;

  setTimeout(() => {
    messageEl.textContent = '';
    messageEl.hidden = true;
  }, timeout);
}

function updateMuteButton() {
  if (muteBtn) {
    muteBtn.textContent = audio.muted ? '🔇' : '🔊';
  }
}

function spinReel(reel, reelIndex) {
  return new Promise((resolve) => {
    const duration =
      900 +
      reelIndex * 220 +
      Math.floor(Math.random() * 200);

    const images = Array.from(
      reel.querySelectorAll('img.symbol')
    );

    const start = performance.now();

    reel.classList.add('spinning');

    const timer = setInterval(() => {
      images.forEach((img) => {
        setImageSymbol(img, randomSymbol());
      });

      if (performance.now() - start >= duration) {
        clearInterval(timer);

        images.forEach((img) => {
          setImageSymbol(img, randomSymbol());
        });

        reel.classList.remove('spinning');
        resolve();
      }
    }, 80);
  });
}

function getGrid() {
  const grid = Array.from(
    { length: ROWS },
    () => Array(REEL_COUNT).fill(null)
  );

  const reels = Array.from(
    reelsContainer.querySelectorAll('.reel')
  );

  reels.forEach((reel, col) => {
    const images = Array.from(
      reel.querySelectorAll('img.symbol')
    );

    images.forEach((img, row) => {
      grid[row][col] = img.dataset.symbol;
    });
  });

  return grid;
}

function evaluateGrid(grid) {
  let totalWin = 0;
  let multiplier = 0;
  let bonusCount = 0;

  for (let row = 0; row < grid.length; row++) {
    const counts = {};

    for (let col = 0; col < grid[row].length; col++) {
      const symbol = grid[row][col];

      counts[symbol] = (counts[symbol] || 0) + 1;

      if (symbol === 'logo-bonus') {
        bonusCount++;
      }
    }

    for (const count of Object.values(counts)) {
      if (count >= 3) {
        let currentMultiplier = 0;

        if (count === 3) currentMultiplier = 5;
        else if (count === 4) currentMultiplier = 12;
        else if (count >= 5) currentMultiplier = 30;

        totalWin += bet * currentMultiplier;

        multiplier = Math.max(
          multiplier,
          currentMultiplier
        );
      }
    }
  }

  return {
    totalWin,
    multiplier,
    bonusCount
  };
}

async function onSpin() {
  if (isSpinning) return;

  if (credits < bet) {
    showMessage('Créditos insuficientes');
    audio.play('error');
    return;
  }

  isSpinning = true;

  if (ui && typeof ui.setSpinning === 'function') {
    ui.setSpinning(true);
  }

  if (spinBtn) spinBtn.disabled = true;

  credits -= bet;
  updateCreditsDisplay();

  audio.play('spin');

  const reels = Array.from(
    reelsContainer.querySelectorAll('.reel')
  );

  await Promise.all(
    reels.map((reel, index) =>
      spinReel(reel, index)
    )
  );

  audio.play('stop');

  const result = evaluateGrid(getGrid());

  if (result.totalWin > 0) {
    credits += result.totalWin;
    updateCreditsDisplay();

    audio.play('win');

    showMessage(
      `Ganaste ${result.totalWin} (x${result.multiplier})`,
      2000
    );
  } else if (result.bonusCount >= 3) {
    audio.play('bonus');

    showMessage(
      `BONUS ${result.bonusCount} logos!`,
      2500
    );
  } else {
    showMessage('No hay combinación', 1200);
  }

  isSpinning = false;

  if (ui && typeof ui.setSpinning === 'function') {
    ui.setSpinning(false);
  }

  if (spinBtn) spinBtn.disabled = false;
}

function onBetInc() {
  if (isSpinning) return;

  bet += 10;
  updateBetDisplay();
}

function onBetDec() {
  if (isSpinning) return;

  bet = Math.max(10, bet - 10);
  updateBetDisplay();
}

function onMute() {
  audio.toggleMute();
  updateMuteButton();
}

function init() {
  renderReels();

  updateCreditsDisplay();
  updateBetDisplay();
  updateMuteButton();

  if (spinBtn) spinBtn.addEventListener('click', onSpin);
  if (betIncBtn) betIncBtn.addEventListener('click', onBetInc);
  if (betDecBtn) betDecBtn.addEventListener('click', onBetDec);
  if (muteBtn) muteBtn.addEventListener('click', onMute);
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    init,
    { once: true }
  );
} else {
  init();
}
