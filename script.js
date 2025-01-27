const BOARD_SIZE = 10;

// Создание пустых досок
let playerBoardState = createEmptyBoard();
let enemyBoardState = createEmptyBoard();

let playerShips = [
  { size: 4, positions: [] },
  { size: 3, positions: [] },
  { size: 3, positions: [] },
  { size: 2, positions: [] },
  { size: 2, positions: [] },
  { size: 2, positions: [] },
  { size: 1, positions: [] },
  { size: 1, positions: [] },
  { size: 1, positions: [] },
  { size: 1, positions: [] },
];

let enemyShips = JSON.parse(JSON.stringify(playerShips));

let manualPlacementMode = false;
let currentShipIndex = 0;
let placementDirection = 'horizontal';
let isPlayerTurn = true; // Флаг хода игрока
let lastHit = null; // Для улучшенного ИИ

const message = document.getElementById('message');
const playerBoard = document.getElementById('player-board');
const enemyBoard = document.getElementById('enemy-board');

// Отрисовка досок
renderBoard(playerBoard, playerBoardState);
renderBoard(enemyBoard, enemyBoardState);

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ hasShip: false, hit: false }))
  );
}

function renderBoard(boardElement, boardState) {
  boardElement.innerHTML = '';
  boardState.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellElement = document.createElement('div');
      cellElement.classList.add('cell');
      cellElement.dataset.row = rowIndex;
      cellElement.dataset.col = colIndex;
      boardElement.appendChild(cellElement);
      cell.cell = cellElement; // Ссылка на DOM-элемент для удобства
    });
  });
}

function canPlaceShip(board, size, row, col, direction) {
  const deltas = [-1, 0, 1];

  for (let i = 0; i < size; i++) {
    const currentRow = direction === 'horizontal' ? row : row + i;
    const currentCol = direction === 'horizontal' ? col + i : col;

    if (
      currentRow < 0 || currentRow >= BOARD_SIZE ||
      currentCol < 0 || currentCol >= BOARD_SIZE
    ) {
      return false;
    }

    for (const dr of deltas) {
      for (const dc of deltas) {
        const neighborRow = currentRow + dr;
        const neighborCol = currentCol + dc;

        if (
          neighborRow >= 0 && neighborRow < BOARD_SIZE &&
          neighborCol >= 0 && neighborCol < BOARD_SIZE &&
          board[neighborRow][neighborCol].hasShip
        ) {
          return false;
        }
      }
    }
  }

  return true;
}

function placeShip(board, ship, row, col, direction) {
  for (let i = 0; i < ship.size; i++) {
    const currentRow = direction === 'horizontal' ? row : row + i;
    const currentCol = direction === 'horizontal' ? col + i : col;

    const cell = board[currentRow][currentCol];
    cell.hasShip = true;
    ship.positions.push(cell);
    cell.cell.classList.add('ship');
  }
}

function clearBoard(board) {
  board.forEach(row => row.forEach(cell => {
    cell.hasShip = false;
    cell.hit = false;
    cell.cell.className = 'cell';
  }));
}

function placeShipsRandomly(board) {
  playerShips.forEach(ship => {
    let placed = false;

    while (!placed) {
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);

      if (canPlaceShip(board, ship.size, row, col, direction)) {
        placeShip(board, ship, row, col, direction);
        placed = true;
      }
    }
  });
}

function isGameOver(board, ships) {
  return ships.every(ship =>
    ship.positions.every(cell => cell.hit)
  );
}

function attack(board, row, col) {
  const cell = board[row][col];
  if (cell.hit) return false; // Клетка уже атакована

  cell.hit = true;
  if (cell.hasShip) {
    cell.cell.classList.add('hit');
    return true; // Попадание
  } else {
    cell.cell.classList.add('miss');
    return false; // Промах
  }
}

function enemyTurn() {
  let row, col, successfulAttack;

  if (lastHit) {
    // Стреляем вокруг последнего попадания
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of directions) {
      row = lastHit.row + dr;
      col = lastHit.col + dc;

      if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && !playerBoardState[row][col].hit) {
        successfulAttack = attack(playerBoardState, row, col);
        if (successfulAttack) break;
      }
    }
  }

  if (!successfulAttack) {
    // Если не удалось найти попадание, стреляем случайно
    do {
      row = Math.floor(Math.random() * BOARD_SIZE);
      col = Math.floor(Math.random() * BOARD_SIZE);
      successfulAttack = attack(playerBoardState, row, col);
    } while (playerBoardState[row][col].hit);
  }

  if (successfulAttack) {
    lastHit = { row, col };
  } else {
    lastHit = null;
  }

  if (isGameOver(playerBoardState, playerShips)) {
    showGameOverModal('Противник победил!');
    enemyBoard.removeEventListener('click', handlePlayerTurn);
    return;
  }

  if (!successfulAttack) {
    isPlayerTurn = true;
    message.textContent = 'Ваш ход!';
  } else {
    message.textContent = 'Противник попал! Его следующий ход.';
    setTimeout(enemyTurn, 1000);
  }
}

function handlePlayerTurn(e) {
  if (!isPlayerTurn) return;

  const cell = e.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
    const hit = attack(enemyBoardState, row, col);

    if (isGameOver(enemyBoardState, enemyShips)) {
      showGameOverModal('Вы победили!');
      enemyBoard.removeEventListener('click', handlePlayerTurn);
      return;
    }

    if (!hit) {
      isPlayerTurn = false;
      message.textContent = 'Промах! Ход противника.';
      setTimeout(enemyTurn, 1000);
    } else {
      message.textContent = 'Попадание! Ваш ход!';
    }
  }
}

function showGameOverModal(messageText) {
  const modal = document.getElementById('game-over-modal');
  const gameOverMessage = document.getElementById('game-over-message');
  gameOverMessage.textContent = messageText;
  modal.style.display = 'flex';
}

document.getElementById('random-placement').addEventListener('click', () => {
  clearBoard(playerBoardState);
  placeShipsRandomly(playerBoardState);
  manualPlacementMode = false;
  currentShipIndex = 0;
  document.getElementById('start-game').disabled = false;
  message.textContent = 'Корабли расставлены автоматически!';
});

document.getElementById('manual-placement').addEventListener('click', () => {
  clearBoard(playerBoardState);
  manualPlacementMode = true;
  currentShipIndex = 0;
  document.getElementById('start-game').disabled = true;
  message.textContent = 'Кликайте по клеткам для расстановки кораблей!';
});

document.getElementById('start-game').addEventListener('click', () => {
  placeShipsRandomly(enemyBoardState);
  message.textContent = 'Игра началась! Ваш ход.';
  enemyBoard.addEventListener('click', handlePlayerTurn);
});

document.getElementById('player-board').addEventListener('click', (e) => {
  if (!manualPlacementMode) return;

  const cell = e.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  if (canPlaceShip(playerBoardState, playerShips[currentShipIndex].size, row, col, placementDirection)) {
    placeShip(playerBoardState, playerShips[currentShipIndex], row, col, placementDirection);
    currentShipIndex++;

    if (currentShipIndex >= playerShips.length) {
      manualPlacementMode = false;
      document.getElementById('start-game').disabled = false;
      message.textContent = 'Корабли расставлены! Нажмите "Начать игру".';
    }
  } else {
    message.textContent = 'Невозможно разместить корабль здесь!';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'r' && manualPlacementMode) {
    placementDirection = placementDirection === 'horizontal' ? 'vertical' : 'horizontal';
    message.textContent = `Направление размещения: ${placementDirection === 'horizontal' ? 'Горизонтальное' : 'Вертикальное'}.`;
  }
});

document.getElementById('modal-restart').addEventListener('click', () => {
  location.reload();
});