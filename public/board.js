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

      // Добавляем класс 'ship', если в ячейке есть корабль
      if (cell.hasShip) {
        cellElement.classList.add('ship');
      }

       // Добавляем класс 'hit' или 'miss', если ячейка была атакована
       if (cell.hit) {
        cellElement.classList.add(cell.hasShip ? 'hit' : 'miss');
      }

      // Сохраняем ссылку на DOM-элемент в объекте клетки
      cell.cell = cellElement;
    });
  });
}

export function clearBoard(board) {
  board.forEach(row => row.forEach(cell => {
    cell.hasShip = false;
    cell.hit = false;

    // Проверяем, что cellElement существует
    if (cell.cell) {
      cell.cell.className = 'cell';
    } else {
      console.error('cellElement не определен для клетки:', cell);
    }
  }));
}