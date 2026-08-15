const symbols = [
  "moto",
  "casco",
  "rueda",
  "herramientas",
  "estrella"
];

const reels = document.querySelectorAll(".reel");
const spinButton = document.getElementById("spin");

function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function createSymbol(name) {
  const img = document.createElement("img");
  img.src = `assets/symbols/${name}.svg`;
  img.alt = name;
  img.className = "slot-symbol";
  return img;
}

function spin() {
  if (!reels.length) return;

  if (spinButton) {
    spinButton.disabled = true;
    spinButton.textContent = "GIRANDO...";
  }

  reels.forEach((reel, reelIndex) => {
    reel.classList.add("spinning");

    setTimeout(() => {
      reel.innerHTML = "";

      for (let row = 0; row < 3; row++) {
        reel.appendChild(createSymbol(randomSymbol()));
      }

      reel.classList.remove("spinning");

      if (reelIndex === reels.length - 1 && spinButton) {
        spinButton.disabled = false;
        spinButton.textContent = "GIRAR";
      }
    }, 500 + reelIndex * 180);
  });
}

if (spinButton) {
  spinButton.addEventListener("click", spin);
}

reels.forEach((reel) => {
  for (let row = 0; row < 3; row++) {
    reel.appendChild(createSymbol(randomSymbol()));
  }
});
