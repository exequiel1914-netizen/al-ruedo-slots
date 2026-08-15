// reels.js - manejo simple de function getRandomSymbol(symbols) {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function generateReel(symbols, rows = 3) {
  const result = [];

  for (let i = 0; i < rows; i++) {
    result.push(getRandomSymbol(symbols));
  }

  return result;
}

function generateReels(symbols, reelCount = 5, rows = 3) {
  const result = [];

  for (let i = 0; i < reelCount; i++) {
    result.push(generateReel(symbols, rows));
  }

  return result;
}

window.AlRuedoReels = {
  getRandomSymbol,
  generateReel,
  generateReels
};
