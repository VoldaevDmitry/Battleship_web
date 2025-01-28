export function updateMessage(text) {
  document.getElementById('message').textContent = text;
}

export function showGameOverModal(messageText) {
  const modal = document.getElementById('game-over-modal');
  const gameOverMessage = document.getElementById('game-over-message');
  gameOverMessage.textContent = messageText;
  modal.style.display = 'flex';
}