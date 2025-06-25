const N = 6;
let grid = [];

function createGrid(n = N) {
  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";
  gridEl.style.gridTemplateColumns = `repeat(${n}, 32px)`;
  grid = [];

  for (let i = 0; i < n; i++) {
    let row = [];
    for (let j = 0; j < n; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.contentEditable = true;
      cell.dataset.row = i;
      cell.dataset.col = j;

      if (i === 0 && j === 0) {
        cell.classList.add("start");
        cell.contentEditable = false;
      } else if (i === n - 1 && j === n - 1) {
        cell.classList.add("end");
        cell.contentEditable = false;
      }

      row.push(cell);
      gridEl.appendChild(cell);
    }
    grid.push(row);
  }

  placeEnergyNearGoal(n);
}

function placeEnergyNearGoal(n) {
  const cells = [];

  for (let i = 0; i < n; ++i) {
    for (let j = 0; j < n; ++j) {
      if ((i === 0 && j === 0) || (i === n - 1 && j === n - 1)) continue;
      const distToGoal = Math.abs(i - (n - 1)) + Math.abs(j - (n - 1));
      cells.push({ x: i, y: j, dist: distToGoal });
    }
  }

  cells.sort((a, b) => a.dist - b.dist);
  const energyCount = 5;
  const nearGoalCells = cells.slice(0, Math.floor(cells.length * 0.3));

  const chosen = new Set();
  while (chosen.size < energyCount && nearGoalCells.length > 0) {
    const randIdx = Math.floor(Math.random() * nearGoalCells.length);
    const { x, y } = nearGoalCells[randIdx];
    grid[x][y].classList.add("energy");
    chosen.add(`${x},${y}`);
    nearGoalCells.splice(randIdx, 1);
  }
}

function solve() {
  const n = grid.length;
  const m = n;
  const teleport = {};
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  const used = Array(26).fill(false);
  const parent = Array.from({ length: n }, () => Array(m).fill(null));
  const dq = [[0, 0, 0]];
  const dx = [0, 0, 1, -1];
  const dy = [1, -1, 0, 0];

  for (let i = 0; i < n; ++i)
    for (let j = 0; j < m; ++j) {
      const val = grid[i][j].innerText.trim().toUpperCase();
      if (val >= 'A' && val <= 'Z') {
        teleport[val] = teleport[val] || [];
        teleport[val].push([i, j]);
        grid[i][j].classList.add("teleport");
      }
    }

  let found = false;

  while (dq.length > 0) {
    const [x, y, steps] = dq.shift();

    if (visited[x][y]) continue;
    visited[x][y] = true;

    if (x === n - 1 && y === m - 1) {
      found = true;
      const path = [];
      let cur = [x, y];
      while (cur) {
        path.push(cur);
        cur = parent[cur[0]][cur[1]];
      }
      animatePath(path.reverse());
      break;
    }

    for (let d = 0; d < 4; ++d) {
      const nx = x + dx[d], ny = y + dy[d];
      if (nx >= 0 && ny >= 0 && nx < n && ny < m) {
        const val = grid[nx][ny].innerText.trim();
        if (val !== "#" && !visited[nx][ny]) {
          parent[nx][ny] = [x, y];
          dq.push([nx, ny, steps + 1]);
        }
      }
    }

    const ch = grid[x][y].innerText.trim().toUpperCase();
    if (ch >= 'A' && ch <= 'Z' && !used[ch.charCodeAt(0) - 65]) {
      used[ch.charCodeAt(0) - 65] = true;
      for (const [tx, ty] of teleport[ch] || []) {
        if (!visited[tx][ty]) {
          parent[tx][ty] = [x, y];
          dq.unshift([tx, ty, steps]); // 0-cost teleport
        }
      }
    }
  }

  if (!found) {
    document.getElementById("stats").innerText = `❌ No path found`;
  }
}

function animatePath(path) {
  path.forEach(([x, y], i) => {
    setTimeout(() => {
      const cell = grid[x][y];
      if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
        cell.classList.add("path");
      }
    }, i * 100);
  });

  setTimeout(() => {
    document.querySelectorAll(".cell.energy").forEach(cell => {
      cell.classList.add("reveal");
    });
    document.getElementById("stats").innerText = `✅ Solved in ${path.length - 1} steps`;
  }, path.length * 100);
}

createGrid();
