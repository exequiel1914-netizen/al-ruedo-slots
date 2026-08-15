// ui.js - audio manager and simple UI hdocument.addEventListener("DOMContentLoaded", () => {
  const spinButton = document.getElementById("spin");
  const muteButton = document.getElementById("mute");
  const betPlus = document.getElementById("bet-plus");
  const betMinus = document.getElementById("bet-minus");
  const betDisplay = document.getElementById("bet");

  let muted = localStorage.getItem("alRuedoMuted") === "true";
  let bet = 100;

  function updateMuteButton() {
    if (!muteButton) return;
    muteButton.textContent = muted ? "🔇" : "🔊";
  }

  function updateBet() {
    if (!betDisplay) return;
    betDisplay.textContent = bet;
  }

  if (muteButton) {
    muteButton.addEventListener("click", () => {
      muted = !muted;
      localStorage.setItem("alRuedoMuted", muted);
      updateMuteButton();
    });
  }

  if (betPlus) {
    betPlus.addEventListener("click", () => {
      bet += 100;
      updateBet();
    });
  }

  if (betMinus) {
    betMinus.addEventListener("click", () => {
      bet = Math.max(100, bet - 100);
      updateBet();
    });
  }

  updateMuteButton();
  updateBet();

  window.AlRuedoUI = {
    isMuted: () => muted,
    getBet: () => bet
  };
});
