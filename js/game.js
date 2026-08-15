import Reels from './reels.js';
import { AudioManager, UI } from './ui.js';

const SYMBOLS = [
  'moto','casco','rueda','motor','llave','billetes','siete','logo-bonus'
];

const startCredits = 1000;
const startBet = 10;

const app = document.getElementById('app');
const creditsEl = document.getElementById('credits');
const betEl = document.getElementById('bet');
const spinBtn = document.getElementById('spin');
const betInc = document.getElementById('betInc');
const betDec = document.getElementById('betDec');
const muteBtn = document.getElementById('mute');
const messageEl = document.getElementById('message');

let credits = startCredits;
let bet = startBet;

const audio = new AudioManager();
const ui = new UI({creditsEl,betEl,messageEl});

const reels = new Reels({containerId:'reels',symbols:SYMBOLS,cols:5,rows:3});

function updateUI(){
  creditsEl.textContent = credits;
  betEl.textContent = bet;
}

function showMsg(text, timeout=1500){
  ui.showMessage(text, timeout);
}

spinBtn.addEventListener('click', async ()=>{
  if(ui.isSpinning) return;
  if(credits < bet){
    showMsg('Créditos insuficientes');
    audio.play('error');
    return;
  }
  ui.setSpinning(true);
  credits -= bet;
  updateUI();

  audio.play('spin');

  // Spin: each reel will spin for slightly different durations
  const spinPromises = [];
  for(let i=0;i<5;i++){
    const dur = 900 + i*220 + Math.random()*200;
    spinPromises.push(reels.spinReel(i,dur));
  }

  const results = await Promise.all(spinPromises);
  audio.play('stop');

  // read visible grid
  const grid = reels.getGrid(); // [rows][cols]
  const evaluation = evaluateGrid(grid);

  // apply results
  if(evaluation.totalWin>0){
    credits += evaluation.totalWin;
    updateUI();
    audio.play('win');
    showMsg(`Ganaste ${evaluation.totalWin} (x${evaluation.multiplier})`,2000);
  } else if(evaluation.bonusCount>=3){
    showMsg(`BONUS ${evaluation.bonusCount} logos! (pendiente)` ,2500);
    audio.play('bonus');
  } else {
    showMsg('No hay combinación',1200);
  }

  ui.setSpinning(false);
});

betInc.addEventListener('click', ()=>{
  if(ui.isSpinning) return;
  bet = Math.min(credits, bet + 10);
  updateUI();
});
betDec.addEventListener('click', ()=>{
  if(ui.isSpinning) return;
  bet = Math.max(1, bet - 10);
  updateUI();
});

muteBtn.addEventListener('click', ()=>{
  audio.toggleMute();
  muteBtn.textContent = audio.muted ? '🔇' : '🔊';
});

// Simple evaluation: per row, count occurrences of same symbol. If any symbol occurs >=3 in that row -> win
function evaluateGrid(grid){
  let totalWin = 0;
  let multiplier = 0;
  let bonusCount = 0;

  for(let r=0;r<grid.length;r++){
    const row = grid[r];
    const counts = {};
    for(let c=0;c<row.length;c++){
      const s = row[c];
      counts[s] = (counts[s]||0)+1;
      if(s==='logo-bonus') bonusCount++;
    }
    for(const [sym,cnt] of Object.entries(counts)){
      if(cnt>=3){
        // simple multipliers
        const base = (cnt===3?5:cnt===4?12:30);
        totalWin += bet * base;
        multiplier = Math.max(multiplier, base);
      }
    }
  }
  return {totalWin,multiplier,bonusCount};
}

// init
updateUI();
reels.render();

// expose for debugging
window.__AlRuedo = {reels,audio};
