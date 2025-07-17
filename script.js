const board = document.getElementById("board");
const canvas = document.getElementById("lineCanvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");
const nameInput = document.getElementById("playerName");
const playerLabel = document.getElementById("playerLabel");
const themeBtn = document.getElementById("themeBtn");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");

let currentPlayer = "X";
let playerSymbol = "X";
let aiSymbol = "O";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let playerName = "";

const winConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

document.querySelectorAll(".symbol").forEach(btn => {
  btn.addEventListener("click", () => {
    if (!nameInput.value.trim()) {
      alert("Please enter your name!");
      return;
    }
    playerName = nameInput.value.trim();
    playerSymbol = btn.dataset.choice;
    aiSymbol = playerSymbol === "X" ? "O" : "X";
    currentPlayer = "X";
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
    playerLabel.textContent = `${playerName} (${playerSymbol})`;
    initGame();
  });
});

function initGame() {
  gameState = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  statusText.textContent = `${playerName}'s Turn`;
  canvas.width = board.offsetWidth;
  canvas.height = board.offsetHeight;
  document.getElementById("particles").getContext("2d").clearRect(0, 0, 500, 500);
  drawBoard();
}

function drawBoard() {
  board.innerHTML = "";
  gameState.forEach((val, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.textContent = val;
    cell.addEventListener("click", handleMove);
    board.appendChild(cell);
  });
}

function handleMove(e) {
  const i = e.target.dataset.index;
  if (!gameActive || gameState[i] || currentPlayer !== playerSymbol) return;

  gameState[i] = currentPlayer;
  clickSound.play();
  drawBoard();
  if (checkWinner()) return;
  currentPlayer = aiSymbol;
  statusText.textContent = "AI's Turn";
  setTimeout(aiMove, 500);
}

function aiMove() {
  let empty = gameState.map((v, i) => v === "" ? i : null).filter(i => i !== null);
  let rand = empty[Math.floor(Math.random() * empty.length)];
  gameState[rand] = aiSymbol;
  clickSound.play();
  drawBoard();
  if (checkWinner()) return;
  currentPlayer = playerSymbol;
  statusText.textContent = `${playerName}'s Turn`;
}

function checkWinner() {
  for (let combo of winConditions) {
    const [a, b, c] = combo;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      statusText.textContent = `${gameState[a] === playerSymbol ? playerName : "AI"} Wins! 🎉`;
      gameActive = false;
      animateWinLine(combo);
      highlightWinningCells(combo);
      winSound.play();
      triggerParticles();
      return true;
    }
  }
  if (!gameState.includes("")) {
    statusText.textContent = "It's a Draw!";
    gameActive = false;
    return true;
  }
  return false;
}

function highlightWinningCells(indices) {
  indices.forEach(i => {
    const cell = document.querySelector(`.cell[data-index="${i}"]`);
    if (cell) cell.classList.add("winner");
  });
}

function animateWinLine([a, b, c]) {
  const cells = document.querySelectorAll(".cell");
  const getCenter = idx => {
    const rect = cells[idx].getBoundingClientRect();
    return [
      rect.left + rect.width/2 - board.getBoundingClientRect().left,
      rect.top + rect.height/2 - board.getBoundingClientRect().top
    ];
  };
  const [x1, y1] = getCenter(a);
  const [x2, y2] = getCenter(c);
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

restartBtn.addEventListener("click", () => {
  currentPlayer = "X";
  gameActive = true;
  document.getElementById("lineCanvas").getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("particles").getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  initGame();
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

function triggerParticles() {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  canvas.width = board.offsetWidth;
  canvas.height = board.offsetHeight;

  let particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: Math.random() * 4 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      velocityX: (Math.random() - 0.5) * 6,
      velocityY: (Math.random() - 0.5) * 6,
      life: 100
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x += p.velocityX;
      p.y += p.velocityY;
      p.life--;
    });
    particles = particles.filter(p => p.life > 0);
    if (particles.length > 0) requestAnimationFrame(animate);
  }

  animate();
}
