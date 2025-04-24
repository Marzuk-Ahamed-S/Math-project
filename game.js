let z = 0, target = 0, score = 0, level = 1, timeLeft = 30, timer;
const ctx = document.getElementById('graph').getContext('2d');
let chart = null;

function getRandomValue(difficulty) {
  switch (difficulty) {
    case 'easy': return Math.floor(Math.random() * 10 + 1);
    case 'medium': return (Math.random() * 10).toFixed(2);
    case 'hard': return (Math.random() * 20 - 10).toFixed(2); // can be negative
  }
}

function generateTarget() {
  const difficulty = document.getElementById('difficulty').value;
  z = parseFloat(getRandomValue(difficulty));
  target = parseFloat(getRandomValue(difficulty));
  document.getElementById('z-value').textContent = z;
  document.getElementById('target-value').textContent = target;
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 30;
  document.getElementById('timer').textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft === 0) {
      clearInterval(timer);
      document.getElementById('result').textContent = "⏰ Time's up!";
      saveScore();
    }
  }, 1000);
}

function checkTransformation() {
  const a = parseFloat(document.getElementById('a').value);
  const b = parseFloat(document.getElementById('b').value);
  const c = parseFloat(document.getElementById('c').value);
  const d = parseFloat(document.getElementById('d').value);

  const numerator = a * z + b;
  const denominator = c * z + d;

  if (denominator === 0) {
    document.getElementById('result').textContent = "⚠ Denominator can't be zero!";
    return;
  }

  const result = numerator / denominator;
  const diff = Math.abs(result - target);

  plotGraph(a, b, c, d);

  if (diff < 0.01) {
    document.getElementById('result').textContent = `✅ You Win! f(${z}) = ${result.toFixed(3)}`;
    document.getElementById("win-sound").play();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    score += 10;
    level++;
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    clearInterval(timer);
    saveScore();
  } else {
    document.getElementById('result').textContent = `f(${z}) = ${result.toFixed(3)}. Try again!`;
  }
}

function plotGraph(a, b, c, d) {
  const xValues = [], yValues = [];
  for (let x = -10; x <= 10; x += 0.5) {
    const denom = c * x + d;
    const y = denom !== 0 ? (a * x + b) / denom : null;
    if (y !== null && Math.abs(y) < 100) {
      xValues.push(x);
      yValues.push(y);
    }
  }
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xValues,
      datasets: [{
        label: 'f(z)',
        data: yValues,
        borderColor: 'cyan',
        tension: 0.4
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'z' } },
        y: { title: { display: true, text: 'f(z)' } }
      }
    }
  });
}

function nextLevel() {
  generateTarget();
  startTimer();
  document.getElementById('result').textContent = '';
}

function resetGame() {
  score = 0;
  level = 1;
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = level;
  nextLevel();
}

function saveScore() {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  leaderboard.push({ score, level, date: new Date().toLocaleString() });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 5)));
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboard');
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  list.innerHTML = leaderboard.map(entry =>
    `<li>⭐ ${entry.score} pts - Level ${entry.level} (${entry.date})</li>`
  ).join('');
}

function toggleDarkMode() {
  const body = document.getElementById('body');
  const thumb = document.getElementById('toggle-thumb');
  body.classList.toggle('bg-white');
  body.classList.toggle('text-black');
  thumb.classList.toggle('translate-x-5');
}

// Style input boxes on load
document.querySelectorAll('.input-box').forEach(input => {
  input.classList.add('w-full', 'p-2', 'rounded', 'bg-gray-700', 'text-white');
  input.value = 1;
});

// Start game when loaded
resetGame();
renderLeaderboard();

