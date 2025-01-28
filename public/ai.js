import { attack } from './game.js';
import { isGameOver } from './game.js';
import { showGameOverModal, updateMessage } from './ui.js';

let lastHit = null;

export function enemyTurn(playerBoardState, playerShips, callback) {
  let row, col, successfulAttack;

  if (lastHit) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of directions) {
      row = lastHit.row + dr;
      col = lastHit.col + dc;

      if (row >= 0 && row < playerBoardState.length && col >= 0 && col < playerBoardState.length && !playerBoardState[row][col].hit) {
        successfulAttack = attack(playerBoardState, row, col);
        if (successfulAttack) break;
      }
    }
  }

  if (!successfulAttack) {
    do {
      row = Math.floor(Math.random() * playerBoardState.length);
      col = Math.floor(Math.random() * playerBoardState.length);
    } while (playerBoardState[row][col].hit);

    successfulAttack = attack(playerBoardState, row, col);
  }

  if (successfulAttack) {
    lastHit = { row, col };
  } else {
    lastHit = null;
  }

  if (isGameOver(playerShips)) {
    showGameOverModal('Противник победил!');
    return;
  }

  if (successfulAttack) {
    updateMessage('Противник попал! Его следующий ход.');
    setTimeout(() => enemyTurn(playerBoardState, playerShips, callback), 1000);
  } else {
    callback();
  }
}