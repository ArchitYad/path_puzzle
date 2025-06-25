    const N = 6;
    let grid = [], endX = 0, endY = 0, energyCells = [];

    function createGrid(n = N) {
      const gridEl = document.getElementById("grid");
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = `repeat(${n}, 32px)`;
      grid = [];
      energyCells = [];

      for (let i = 0; i < n; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
          const cell = document.createElement("div");
          cell.className = "cell";
          cell.contentEditable = true;
          cell.dataset.row = i;
          cell.dataset.col = j;
          row.push(cell);
          gridEl.appendChild(cell);
        }
        grid.push(row);
      }

      grid[0][0].classList.add("start");
      grid[0][0].contentEditable = false;

      do {
        endX = Math.floor(Math.random() * n);
        endY = Math.floor(Math.random() * n);
      } while (endX === 0 && endY === 0);

      grid[endX][endY].classList.add("end", "hidden");
      grid[endX][endY].contentEditable = false;

      placeEnergyByProximity(n);
    }

    function placeEnergyByProximity(n) {
      const cells = [];

      for (let i = 0; i < n; ++i) {
        for (let j = 0; j < n; ++j) {
          if ((i === 0 && j === 0) || (i === endX && j === endY)) continue;
          const dist = Math.abs(i - endX) + Math.abs(j - endY);
          cells.push({ x: i, y: j, dist });
        }
      }

      cells.sort((a, b) => a.dist - b.dist);
      const count = 6;
      let added = 0;

      while (added < count && cells.length) {
        const { x, y, dist } = cells.shift();
        const cell = grid[x][y];
        cell.classList.add("energy");
        if (dist <= 2) cell.dataset.cost = -5;
        else if (dist <= 4) cell.dataset.cost = -3;
        else cell.dataset.cost = -1;
        energyCells.push(cell);
        added++;
      }
    }

    function solve() {
      const n = grid.length, m = n;
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

        if (x === endX && y === endY) {
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
              dq.unshift([tx, ty, steps]);
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
        grid[endX][endY].classList.remove("hidden");
        grid[endX][endY].classList.add("reveal");
        energyCells.forEach(cell => cell.classList.add("reveal"));
        document.getElementById("stats").innerText = `✅ Solved in ${path.length - 1} steps`;
      }, path.length * 100);
    }

    createGrid();
