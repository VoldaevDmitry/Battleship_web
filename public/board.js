export function createEmptyBoard(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ hasShip: false, hit: false, cellElement: null }))
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

      // Сохраняем ссылку на DOM-элемент в объекте клетки
      cell.cellElement = cellElement;
    });
  });
}

export function clearBoard(board) {
  board.forEach(row => row.forEach(cell => {
    cell.hasShip = false;
    cell.hit = false;

    // Проверяем, что cellElement существует
    if (cell.cellElement) {
      cell.cellElement.className = 'cell';
    } else {
      console.error('cellElement не определен для клетки:', cell);
    }
  }));
}