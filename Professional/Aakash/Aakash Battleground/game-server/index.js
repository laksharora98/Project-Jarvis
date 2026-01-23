const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// 1. App Setup
// We create an Express application to handle standard web requests.
const app = express();
app.use(cors()); // Allow all origins (for hackathon simplicity)

// 2. Server Setup
// We need a raw HTTP server to attach Socket.io to.
// Express handles the "request/response" logic, but 'http' handles the network connection.
const server = http.createServer(app);

// 3. Socket.io Setup
// We create the "Game Server" instance.
// cors: { origin: "*" } means "Accept connections from ANY phone/laptop".
// In production, we would lock this down to just our app's URL.
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 4. Game State (In-Memory Database)
let players = {}; 
let queue = [];   

const QUESTIONS = [
    {
        id: 1,
        question: "Which of the following is a vector quantity?",
        options: ["Mass", "Distance", "Displacement", "Time"],
        answer: 2 // Displacement
    },
    {
        id: 2,
        question: "The rate of change of momentum is equal to:",
        options: ["Work", "Force", "Power", "Energy"],
        answer: 1 // Force
    },
    {
        id: 3,
        question: "What is the SI unit of torque?",
        options: ["N-m", "N/m", "N-m^2", "J/s"],
        answer: 0 // N-m
    }
];

// 5. Connection Handler
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_game', (data) => {
        const playerName = data.name || `Player ${socket.id.substr(0,4)}`;
        
        players[socket.id] = {
            id: socket.id,
            name: playerName,
            score: 0,
            roomId: null
        };

        console.log(`${playerName} joined the queue.`);
        queue.push(socket.id);

        if (queue.length >= 2) {
            const player1Id = queue.shift();
            const player2Id = queue.shift();

            const roomId = `${player1Id}-${player2Id}`;
            players[player1Id].roomId = roomId;
            players[player2Id].roomId = roomId;

            io.sockets.sockets.get(player1Id)?.join(roomId);
            io.sockets.sockets.get(player2Id)?.join(roomId);

            console.log(`Match Started: ${players[player1Id].name} vs ${players[player2Id].name}`);

            // Send game start with questions
            io.to(roomId).emit('game_start', {
                roomId: roomId,
                opponentName: "An Opponent",
                questions: QUESTIONS
            });
        }
    });

    // Event: User submitted an answer
    socket.on('submit_answer', (data) => {
        const player = players[socket.id];
        if (player && player.roomId) {
            // Update score if correct (Simplified: just trusting the client for the prototype)
            if (data.isCorrect) {
                player.score += 10;
            }
            
            // Tell the OTHER person in the room about the new score
            socket.to(player.roomId).emit('opponent_score_update', {
                score: player.score
            });
        }
    });

    // Event: User disconnects (closes app)
    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
        // Remove from players list
        delete players[socket.id];
        // Remove from queue if they were waiting
        queue = queue.filter(id => id !== socket.id);
    });
});

// 6. Start the Server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`SERVER RUNNING on port ${PORT}`);
});
