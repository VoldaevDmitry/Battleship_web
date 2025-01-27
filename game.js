import { createEmptyBoard, renderBoard, clearBoard } from './board.js';
import { placeShipsRandomly, canPlaceShip, placeShip } from './ship.js';
import { enemyTurn } from './ai.js';
import { showGameOverModal, updateMessage } from './ui.js';

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

let isPlayerTurn = true;
let lastHit = null;

export function initGame() {
  renderBoard(document.getElementById('player-board'), playerBoardState);
  renderBoard(document.getElementById('enemy-board'), enemyBoardState);

  document.getElementById('random-placement').addEventListener('click', () => {
    clearBoard(playerBoardState);
    placeShipsRandomly(playerBoardState, playerShips);
    updateMessage('Корабли расставлены автоматически!');
  });

  document.getElementById('start-game').addEventListener('click', () => {
    placeShipsRandomly(enemyBoardState, enemyShips);
    updateMessage('Игра началась! Ваш ход.');
    document.getElementById('enemy-board').addEventListener('click', handlePlayerTurn);
  });
}

function handlePlayerTurn(e) {
  if (!isPlayerTurn) return;

  const cell = e.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
    const hit = attack(enemyBoardState, row, col);

    if (hit) {
      if (isGameOver(enemyShips)) {
        showGameOverModal('Вы победили!');
        document.getElementById('enemy-board').removeEventListener('click', handlePlayerTurn);
        return;
      } else {
        updateMessage('Попадание! Ваш ход!');
      }
    } else {
      isPlayerTurn = false;
      updateMessage('Промах! Ход противника.');
      setTimeout(() => enemyTurn(playerBoardState, playerShips), 1000);
    }
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

// Инициализация игры при загрузке модуля
initGame();