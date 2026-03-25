const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic matchmaking for TicTacToe and Pong
let waitingPlayers = {
    tictactoe: null,
    pong: null
};

let onlineUsers = 0;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    onlineUsers++;
    io.emit('online_users_update', onlineUsers);

    // General lobby logic
    socket.on('join_game', (gameType) => {
        if (!waitingPlayers[gameType]) {
            // First player waiting
            waitingPlayers[gameType] = socket;
            socket.emit('waiting', 'Waiting for an opponent...');
        } else {
            // Second player joins
            const opponent = waitingPlayers[gameType];
            waitingPlayers[gameType] = null; // Clear waiting slot

            // Create a unique room for the game
            const roomName = `${gameType}_${socket.id}_${opponent.id}`;
            socket.join(roomName);
            opponent.join(roomName);

            // Notify both players
            // For TicTacToe: X goes first, O goes second
            // For Pong: P1 is left, P2 is right
            if (gameType === 'tictactoe') {
                opponent.emit('game_start', { role: 'X', room: roomName });
                socket.emit('game_start', { role: 'O', room: roomName });
            } else if (gameType === 'pong') {
                opponent.emit('game_start', { role: 'p1', room: roomName });
                socket.emit('game_start', { role: 'p2', room: roomName });
            }
        }
    });

    // --- Tic-Tac-Toe Events ---
    socket.on('ttt_move', (data) => {
        // Broadcast the move to the other player in the room
        socket.to(data.room).emit('ttt_move', data);
    });

    socket.on('ttt_restart', (data) => {
        socket.to(data.room).emit('ttt_restart');
    });

    // --- Pong Events ---
    // Only player 1 controls the ball initially
    socket.on('pong_paddle_move', (data) => {
        socket.to(data.room).emit('pong_paddle_move', data);
    });

    socket.on('pong_ball_sync', (data) => {
        socket.to(data.room).emit('pong_ball_sync', data);
    });

    socket.on('pong_score', (data) => {
        socket.to(data.room).emit('pong_score', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        onlineUsers--;
        io.emit('online_users_update', onlineUsers);

        // Clean up waiting queues
        if (waitingPlayers.tictactoe === socket) waitingPlayers.tictactoe = null;
        if (waitingPlayers.pong === socket) waitingPlayers.pong = null;

        // Let opponent know if they disconnect mid-game
        // A simple way is to broadcast to all rooms they were in
        for (const room of socket.rooms) {
             socket.to(room).emit('opponent_disconnected');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
