const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Добавьте эту строку для обслуживания статических файлов
app.use(express.static(path.join(__dirname, 'public')));

let players = [];
let currentPlayer = 1; // Текущий игрок, который делает ход

io.on('connection', (socket) => {
  console.log('Новый игрок подключен:', socket.id);

  // Добавляем игрока в очередь
  players.push(socket.id);

  // Если два игрока подключены, начинаем игру
  if (players.length === 2) {
    io.to(players[0]).emit('startGame', { player: 1 });
    io.to(players[1]).emit('startGame', { player: 2 });
    players = []; // Очищаем очередь
  }

  // Обработка хода игрока
  socket.on('playerMove', (data) => {
    const { row, col, player } = data;

    // Проверяем, чей сейчас ход
    if (player === currentPlayer) {
      // Пересылаем ход другому игроку
      socket.broadcast.emit('opponentMove', { row, col });

      // Меняем текущего игрока
      currentPlayer = currentPlayer === 1 ? 2 : 1;
      io.emit('switchTurn', { currentPlayer });
    }
  });

  // Обработка завершения игры
  socket.on('gameOver', (data) => {
    socket.broadcast.emit('gameOver', data);
  });

  // Обработка отключения игрока
  socket.on('disconnect', () => {
    console.log('Игрок отключен:', socket.id);
    players = players.filter((id) => id !== socket.id);
  });
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Сервер запущен на http://localhost:3000');
});