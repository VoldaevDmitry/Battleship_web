export function canPlaceShip(board, size, row, col, direction) {
  const deltas = [-1, 0, 1];

  for (let i = 0; i < size; i++) {
    const currentRow = direction === 'horizontal' ? row : row + i;
    const currentCol = direction === 'horizontal' ? col + i : col;

    if (
      currentRow < 0 || currentRow >= board.length ||
      currentCol < 0 || currentCol >= board.length
    ) {
      return false;
    }

    for (const dr of deltas) {
      for (const dc of deltas) {
        const neighborRow = currentRow + dr;
        const neighborCol = currentCol + dc;

        if (
          neighborRow >= 0 && neighborRow < board.length &&
          neighborCol >= 0 && neighborCol < board.length &&
          board[neighborRow][neighborCol].hasShip
        ) {
          return false;
        }
      }
    }
  }

  return true;
}

export function placeShip(board, ship, row, col, direction) {
  for (let i = 0; i < ship.size; i++) {
    const currentRow = direction === 'horizontal' ? row : row + i;
    const currentCol = direction === 'horizontal' ? col + i : col;

    const cell = board[currentRow][currentCol];
    cell.hasShip = true;
    ship.positions.push(cell);
    cell.cell.classList.add('ship');
  }
}

export function placeShipsRandomly(board, ships) {
  ships.forEach(ship => {
    let placed = false;

    while (!placed) {
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const row = Math.floor(Math.random() * board.length);
      const col = Math.floor(Math.random() * board.length);

      if (canPlaceShip(board, ship.size, row, col, direction)) {
        placeShip(board, ship, row, col, direction);
        placed = true;
      }
    }
  });
}