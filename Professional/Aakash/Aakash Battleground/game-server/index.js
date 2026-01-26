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

const GAME_CONFIG = {
    TOTAL_QUESTIONS: 3,
    TIMER_DURATION: 10,
    POINTS_BASE: 10,
    POINTS_PER_SECOND: 1
};

const QUESTION_POOL = [
    { id: 1, question: "Which of the following is a vector quantity?", options: ["Mass", "Distance", "Displacement", "Time"], answer: 2 },
    { id: 2, question: "The rate of change of momentum is equal to:", options: ["Work", "Force", "Power", "Energy"], answer: 1 },
    { id: 3, question: "What is the SI unit of torque?", options: ["N-m", "N/m", "N-m^2", "J/s"], answer: 0 },
    { id: 4, question: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], answer: 2 },
    { id: 5, question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"], answer: 2 },
    { id: 6, question: "The chemical symbol for Gold is:", options: ["Au", "Ag", "Fe", "Gd"], answer: 0 },
    { id: 7, question: "Value of 'g' at the center of Earth is:", options: ["9.8 m/s^2", "Infinite", "Zero", "1 m/s^2"], answer: 2 },
    { id: 8, question: "Sound travels fastest in:", options: ["Vacuum", "Air", "Water", "Steel"], answer: 3 },
    { id: 9, question: "Light year is a unit of:", options: ["Time", "Distance", "Light", "Speed"], answer: 1 },
    { id: 10, question: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Nitrogen", "CO2", "Argon"], answer: 1 },
    { id: 11, question: "The pH of pure water is:", options: ["0", "7", "14", "10"], answer: 1 },
    { id: 12, question: "Which lens is used to correct Myopia?", options: ["Convex", "Concave", "Cylindrical", "Bifocal"], answer: 1 },
    { id: 13, question: "Electric current is measured in:", options: ["Volts", "Watts", "Amperes", "Joules"], answer: 2 },
    { id: 14, question: "Who discovered the electron?", options: ["Rutherford", "Thomson", "Bohr", "Newton"], answer: 1 },
    { id: 15, question: "Formula for Kinetic Energy is:", options: ["mv", "mgh", "1/2 mv^2", "ma"], answer: 2 },
    { id: 16, question: "Which blood cells fight infection?", options: ["RBC", "WBC", "Platelets", "Plasma"], answer: 1 },
    { id: 17, question: "The hardest natural substance is:", options: ["Gold", "Iron", "Diamond", "Platinum"], answer: 2 },
    { id: 18, question: "A convex mirror always forms an image that is:", options: ["Real", "Virtual", "Inverted", "Magnified"], answer: 1 },
    { id: 19, question: "Atomic number of Carbon is:", options: ["6", "12", "8", "14"], answer: 0 },
    { id: 20, question: "Device used to measure blood pressure:", options: ["Barometer", "Thermometer", "Sphygmomanometer", "Lactometer"], answer: 2 }
];

// Helper: Select random questions and shuffle options
function getRandomQuestions(count) {
    // 1. Shuffle the pool to get random questions
    const shuffledPool = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffledPool.slice(0, count);

    // 2. Shuffle options for each selected question
    return selected.map(q => {
        // Create a copy of options with their original index to track the answer
        const optionsWithIndex = q.options.map((opt, index) => ({ text: opt, originalIndex: index }));
        
        // Shuffle the options
        optionsWithIndex.sort(() => 0.5 - Math.random());
        
        // Find where the correct answer moved to
        const newAnswerIndex = optionsWithIndex.findIndex(item => item.originalIndex === q.answer);
        
        return {
            id: q.id,
            question: q.question,
            options: optionsWithIndex.map(o => o.text), // Send just the text
            answer: newAnswerIndex
        };
    });
}

// 5. Connection Handler
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_game', (data) => {
        const playerName = data.name || `Player ${socket.id.substr(0,4)}`;
        
        players[socket.id] = {
            id: socket.id,
            name: playerName,
            score: 0,
            answersCount: 0,
            isFinished: false,
            roomId: null,
            matchQuestions: [] // Store questions for server-side validation
        };

        console.log(`${playerName} joined the queue.`);
        queue.push(socket.id);

        // Robust Matchmaking Loop
        // We use a loop to ensure we find two LIVE players
        while (queue.length >= 2) {
            const p1Id = queue.shift();
            const p2Id = queue.shift();

            const p1Socket = io.sockets.sockets.get(p1Id);
            const p2Socket = io.sockets.sockets.get(p2Id);

            // Case 1: Player 1 is disconnected/ghost
            if (!p1Socket) {
                console.log(`Skipping Ghost Player 1: ${p1Id}`);
                queue.unshift(p2Id); // Put Player 2 back at the front
                continue; // Try again
            }

            // Case 2: Player 2 is disconnected/ghost
            if (!p2Socket) {
                console.log(`Skipping Ghost Player 2: ${p2Id}`);
                queue.unshift(p1Id); // Put Player 1 back at the front
                continue; // Try again
            }

            // Both Valid! Create Match
            const roomId = `${p1Id}-${p2Id}`;
            
            // Generate Questions for this match
            const matchQuestions = getRandomQuestions(GAME_CONFIG.TOTAL_QUESTIONS);

            if (players[p1Id]) {
                players[p1Id].roomId = roomId;
                players[p1Id].opponentId = p2Id;
                players[p1Id].matchQuestions = matchQuestions;
            }
            if (players[p2Id]) {
                players[p2Id].roomId = roomId;
                players[p2Id].opponentId = p1Id;
                players[p2Id].matchQuestions = matchQuestions;
            }

            // Cleanup: Leave ALL previous rooms before joining the new one
            // This prevents "cross-talk" from old games
            p1Socket.rooms.forEach(room => {
                if (room !== p1Id) p1Socket.leave(room);
            });
            p2Socket.rooms.forEach(room => {
                if (room !== p2Id) p2Socket.leave(room);
            });

            p1Socket.join(roomId);
            p2Socket.join(roomId);

            console.log(`Match Started: ${players[p1Id]?.name} vs ${players[p2Id]?.name}`);

            // Send custom start events so each player sees the *other* person's name
            // Also send GAME_CONFIG so client knows points/timer settings
            p1Socket.emit('game_start', {
                roomId: roomId,
                opponentName: players[p2Id]?.name,
                questions: matchQuestions,
                config: GAME_CONFIG
            });

            p2Socket.emit('game_start', {
                roomId: roomId,
                opponentName: players[p1Id]?.name,
                questions: matchQuestions,
                config: GAME_CONFIG
            });

            break; // Match found, exit loop
        }
    });

    // Event: User wants to leave the queue (Cancel Search)
    socket.on('leave_queue', () => {
        console.log(`${players[socket.id]?.name || socket.id} left the queue.`);
        queue = queue.filter(id => id !== socket.id);
    });

    // Event: Client checking if session is valid (after reconnect)
    socket.on('check_session', () => {
        if (!players[socket.id]) {
            // Server doesn't know this user (Amnesia)
            socket.emit('session_expired');
        }
    });

    // Event: User submitted an answer
    socket.on('submit_answer', (data) => {
        const player = players[socket.id];
        
        // Anti-Spam Check: Ignore if already finished or answering too many
        if (player && player.roomId && !player.isFinished && player.answersCount < GAME_CONFIG.TOTAL_QUESTIONS) {
            
            // 1. Server-Side Validation & Scoring
            // Retrieve the correct answer for the current question
            const currentQuestion = player.matchQuestions[player.answersCount];
            
            // Validate: Did they pick the right index?
            // data.answerIndex is sent by client
            const isCorrect = (currentQuestion.answer === data.answerIndex);
            
            if (isCorrect) {
                // Calculate Score: Base + Time Bonus
                // Trusting client timestamp for now (Simple Prototype)
                const timeBonus = (data.timeRemaining || 0) * GAME_CONFIG.POINTS_PER_SECOND;
                player.score += (GAME_CONFIG.POINTS_BASE + timeBonus);
            }
            player.answersCount += 1;
            
            // 2. Notify BOTH players of the updated score
            // To the player who answered (Reconciliation)
            socket.emit('player_score_update', {
                score: player.score,
                isCorrect: isCorrect
            });

            // To the opponent (Real-time sync)
            socket.to(player.roomId).emit('opponent_score_update', {
                score: player.score,
                isCorrect: isCorrect
            });

            // 3. Check for End Game
            if (player.answersCount >= GAME_CONFIG.TOTAL_QUESTIONS) {
                player.isFinished = true;

                const opponent = players[player.opponentId];
                
                if (opponent && opponent.isFinished) {
                    // BOTH finished! Game Over.
                    io.to(player.roomId).emit('game_over', {
                        results: [
                            { id: player.id, name: player.name, score: player.score },
                            { id: opponent.id, name: opponent.name, score: opponent.score }
                        ]
                    });
                } else {
                    // Only I finished. Wait.
                    socket.emit('waiting_for_opponent');
                }
            }
        }
    });

    // Event: User disconnects (closes app)
    socket.on('disconnect', () => {
        const player = players[socket.id];
        console.log(`User Disconnected: ${socket.id} (${player?.name})`);

        // 1. Notify opponent if mid-game
        if (player && player.roomId) {
            socket.to(player.roomId).emit('opponent_left', {
                message: "Opponent disconnected. You win!"
            });
        }

        // 2. Remove from players list
        delete players[socket.id];
        
        // 3. Remove from queue if they were waiting
        queue = queue.filter(id => id !== socket.id);
    });
});

// 7. Global Safety Net (Error Handling)
// Prevents server crashes from unexpected errors (like "try...catch" for the whole app)
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR (Uncaught Exception):', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL ERROR (Unhandled Rejection):', reason);
});

// 6. Start the Server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`SERVER RUNNING on port ${PORT}`);
});
