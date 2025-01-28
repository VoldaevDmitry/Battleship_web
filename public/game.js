import { createEmptyBoard, renderBoard, clearBoard } from './board.js';
import { placeShipsRandomly, canPlaceShip, placeShip } from './ship.js';
import { updateMessage, showGameOverModal } from './ui.js';

const BOARD_SIZE = 10;

let playerBoardState = createEmptyBoard(BOARD_SIZE);
let enemyBoardState = createEmptyBoard(BOARD_SIZE);

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

let isPlayerTurn = false;
let playerNumber = null;
let currentPlayer = 1;

let manualPlacementMode = true;
let currentShipIndex = 0;
let placementDirection = 'horizontal';

const socket = io('http://localhost:3000');

// Функция для обновления подсказок о кораблях
function updateShipHints() {
  document.getElementById('ship-4').textContent = playerShips.filter(ship => ship.size === 4 && ship.positions.length === 0).length;
  document.getElementById('ship-3').textContent = playerShips.filter(ship => ship.size === 3 && ship.positions.length === 0).length;
  document.getElementById('ship-2').textContent = playerShips.filter(ship => ship.size === 2 && ship.positions.length === 0).length;
  document.getElementById('ship-1').textContent = playerShips.filter(ship => ship.size === 1 && ship.positions.length === 0).length;
}

// Инициализация игры
export function initGame() {
  // Рендерим доску для расстановки кораблей
  renderBoard(document.getElementById('setup-board'), playerBoardState);
  updateShipHints();

  // Обработчик для ручной расстановки кораблей
  document.getElementById('setup-board').addEventListener('click', (e) => {
    if (!manualPlacementMode) return;

    const cell = e.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    const direction = document.querySelector('input[name="direction"]:checked').value;

    if (canPlaceShip(playerBoardState, playerShips[currentShipIndex].size, row, col, direction)) {
      placeShip(playerBoardState, playerShips[currentShipIndex], row, col, direction);
      currentShipIndex++;

      if (currentShipIndex >= playerShips.length) {
        manualPlacementMode = false;
        document.getElementById('start-game').disabled = false;
        updateMessage('Корабли расставлены! Нажмите "Старт".');
      }

      updateShipHints();
    } else {
      updateMessage('Невозможно разместить корабль здесь!');
    }
  });

  // Кнопка автоматической расстановки
  document.getElementById('random-placement').addEventListener('click', () => {
    clearBoard(playerBoardState);
    playerShips.forEach(ship => ship.positions = []);
    renderBoard(document.getElementById('setup-board'), playerBoardState); // Перерендерим доску
    placeShipsRandomly(playerBoardState, playerShips);
    updateMessage('Корабли расставлены автоматически!');
    document.getElementById('start-game').disabled = false;
    updateShipHints();
  });

  // Кнопка старта игры
  document.getElementById('start-game').addEventListener('click', () => {
    document.getElementById('setup-phase').style.display = 'none';
    document.getElementById('game-phase').style.display = 'block';

    // Рендерим игровое поле с кораблями
    renderBoard(document.getElementById('player-board'), playerBoardState);

    const mode = document.querySelector('input[name="mode"]:checked').value;
    if (mode === 'singleplayer') {
      renderBoard(document.getElementById('enemy-board'), enemyBoardState);
      placeShipsRandomly(enemyBoardState, enemyShips);
      renderBoard(document.getElementById('enemy-board'), enemyBoardState); // Рендерим доску противника
      updateMessage('Игра началась! Ваш ход.');
    } else {
      updateMessage('Ожидайте второго игрока...');
    }

    document.getElementById('enemy-board').addEventListener('click', handlePlayerTurn);

    playerNumber=1
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
        updateMessage('Корабли расставлены! Нажмите "Начать игру".');
      }
    } else {
      updateMessage('Невозможно разместить корабль здесь!');
    }
  });
}

function handlePlayerTurn(e) {
  if (currentPlayer !== playerNumber) return; // Проверяем, чей сейчас ход

  const cell = e.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
    const hit = attack(enemyBoardState, row, col);

    if (hit) {
      if (isGameOver(enemyShips)) {
        showGameOverModal('Вы победили!');
        socket.emit('gameOver', { message: 'Вы победили!' });
        document.getElementById('enemy-board').removeEventListener('click', handlePlayerTurn);
        return;
      } else {
        updateMessage('Попадание! Ваш ход!');
      }
    } else {
      updateMessage('Промах! Ход противника.');
    }

    // Отправляем ход на сервер
    socket.emit('playerMove', { row, col, player: playerNumber });
  }
}

export function attack(board, row, col) {
  const cell = board[row][col];
  if (cell.hit) return false;

  cell.hit = true;
  if (cell.hasShip) {
    cell.cell.classList.add('hit');
    return true;
  } else {
    cell.cell.classList.add('miss');
    return false;
  }
}

export function isGameOver(ships) {
  return ships.every(ship => ship.positions.every(cell => cell.hit));
}

// Инициализация игры
initGame();