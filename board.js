export function createEmptyBoard(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ hasShip: false, hit: false }))
  );
}

export function renderBoard(boardElement, boardState) {
  boardElement.innerHTML = '';
  boardState.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellElement = document.createElement('div');
      cellElement.classList.add('cell');
      cellElement.dataset.row = rowIndex;
      cellElement.dataset.col = colIndex;
      boardElement.appendChild(cellElement);
      cell.cell = cellElement;
    });
  });
}

export function clearBoard(board) {
  board.forEach(row => row.forEach(cell => {
    cell.hasShip = false;
    cell.hit = false;
    cell.cell.className = 'cell';
  }));
}