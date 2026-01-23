# Learning Log & Deployment Guide

This document tracks every technical decision, command, and package used in the "Aakash Battleground" project. It is designed to help Product Managers understand the "black box" of code.

## 1. Project Initialization (Backend)

We started by creating the server (the "brain" of the game).

### Concepts
*   **Backend**: The computer program that runs on the server (or your laptop). It decides who wins, who loses, and stores the questions.
*   **Node.js**: A tool that lets us run JavaScript outside of a browser (like on a server). We use it because it's great at handling many simultaneous connections (like a chat or a game).
*   **NPM (Node Package Manager)**: A tool installed with Node.js. It's like an "App Store" for code libraries. We use it to download tools others have written.

### Commands Used
```bash
# 1. Create a folder for the server code
mkdir -p "game-server"

# 2. Go into that folder
cd "game-server"

# 3. Initialize a new project
# 'npm init -y' creates a 'package.json' file.
# This file is like a "receipt" that lists all the libraries we use.
# The '-y' flag just says "yes" to all default questions (name, version, etc.) to save time.
npm init -y

# 4. Install the necessary tools (libraries)
# 'express': A framework that makes it easy to create a web server.
# 'socket.io': The magic library for real-time, two-way communication (Client <-> Server).
# 'cors': Stands for "Cross-Origin Resource Sharing". It's a security feature.
#         By default, a server blocks requests from other websites/apps.
#         Installing this lets us tell the server "It's okay to talk to our mobile app."
npm install express socket.io cors
```

### Key Files Created
*   **`package.json`**: The project manifest. It lists our dependencies (Express, Socket.io). If you give this project to a teammate, they just run `npm install`, and NPM reads this file to download everything automatically.

## 2. The Game Server (`index.js`)

We created the main server file `index.js`. This is the program that runs constantly, listening for player connections.

### Code Breakdown
*   **Setup**: We load `express` and `socket.io`. We start a server on port `3000`.
*   **Memory (`players`, `queue`)**: Instead of a database, we use simple variables. `players` is an object (dictionary) tracking connected users. `queue` is a list (array) of people waiting to play.
*   **`io.on('connection')`**: This is the "Doorbell". Every time a phone connects, this code runs. It gives us a `socket` object, which is like a direct telephone line to *that specific phone*.
*   **Matchmaking Logic**:
    *   When a user sends `'join_game'`, we put them in the `queue`.
    *   We check: `if (queue.length >= 2)`.
    *   If yes, we take the first two, assign them a unique `roomId`, and put them in a private channel.
    *   We send `'game_start'` to only those two people.

### Why this architecture?
It's **Event-Driven**. We don't constantly check "Are there players?". We wait for the "Event" of a player joining. This is highly efficient and scalable.

## 3. Project Initialization (Frontend/Mobile)

We created the mobile app using **Expo**, which is the fastest way to build React Native apps.

### Concepts
*   **React Native**: A framework for building real mobile apps (for iOS and Android) using JavaScript and React.
*   **Expo**: A set of tools built around React Native that makes development much easier. It handles the complex mobile build processes so we can focus on code.
*   **Socket.io-client**: The counterpart to our server-side library. It allows the phone to "call" the server and listen for updates.

### Commands Used
```bash
# 1. Create the mobile app project
# We use the 'blank' template to keep things clean.
npx create-expo-app mobile-app --template blank

# 2. Go into the folder
cd mobile-app

# 3. Install the socket client
# This lets the app talk to our game server.
npm install socket.io-client
```

### Key Files Created
*   **`App.js`**: The entry point of our mobile app. This is where we will write the code for the quiz screens.
*   **`app.json`**: Configuration for the Expo app (name, icon, etc.).

## 4. Building the Mobile Interface (`App.js`)

We transformed the empty "Hello World" app into a functional game lobby.

### Concepts
*   **State (`useState`)**: Think of this as the "Short-term memory" of the app. It tracks things that change, like the user's name or if they are currently in a game.
*   **Effects (`useEffect`)**: This is for code that needs to run when the app starts. We use it to open the connection to the server.
*   **Components**:
    *   `View`: Like a "box" or container.
    *   `Text`: For displaying letters and numbers.
    *   `TouchableOpacity`: A button that "glows" or fades when you tap it.
    *   `TextInput`: A box where the user can type their name.

### Code Breakdown
1.  **Connecting**: `const newSocket = io(SOCKET_URL);` starts the connection.
2.  **Listening**: `newSocket.on('game_start', ...)` tells the app: "Whenever the server screams 'GAME START', update our memory to show the game screen."
3.  **Sending**: `socket.emit('join_game', ...)` is how we tell the server "I'm ready to play!"
4.  **Conditional Rendering**: We use `{gameState === 'LOBBY' && (...)}` to swap screens without navigating to new pages. It's fast and smooth.

## 6. Connectivity: Exposing to the Public Internet (Ngrok)

To test the app on two different devices (e.g., your laptop and your friend's phone), the phone needs a way to find your laptop on the internet.

### Concepts
*   **Localhost**: This means "this computer only." Other devices cannot see it.
*   **Ngrok**: A tool that creates a secure, public URL for a port on your local machine. It's like building a temporary tunnel from the public internet directly to your laptop.

### Workflow
1.  **Start Server**: Run the Node.js backend on port 3000.
2.  **Start Tunnel**: Run `ngrok http 3000`. Ngrok provides a URL like `https://xyz.ngrok.io`.
3.  **Update App**: We point the `SOCKET_URL` in our mobile app to this new public URL.
4.  **Battle**: Now, anyone with the app can join the same game room from anywhere in the world.

### Why use this?
It's perfect for prototypes. You don't have to deal with complex AWS/GCP cloud configurations, SSL certificates, or firewalls. It just works.

---

# Deep Dive: Understanding the Code

This section provides a line-by-line explanation of the core logic for non-programmers.

## Part A: The Backend (`game-server/index.js`)

This file is the "Traffic Controller". It connects players and manages the game rooms.

### 1. The Setup (Loading Tools)
```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
```
*   **What**: We are importing tools (libraries) we downloaded earlier.
    *   `express`: The web server framework (handles standard website requests).
    *   `socket.io`: The real-time chat engine.
    *   `cors`: Security settings (who is allowed to talk to us).
*   **Analogy**: Like gathering your hammer, drill, and saw before starting a project.

### 2. The Server Configuration
```javascript
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
```
*   **What**: We turn on the server and attach `socket.io` to it. We tell it to accept connections from `*` (Everyone/Anywhere).
*   **Production Note**: In a real app, `origin: "*"` is dangerous. We would replace `*` with `https://aakash.ac.in` so only our official app can connect.

### 3. The Database (In-Memory)
```javascript
let players = {}; 
let queue = [];
```
*   **What**:
    *   `players`: A dictionary (key-value store). Keeps track of every active user.
    *   `queue`: A simple list. When you click "Join", you get in line here.
*   **Why**: It's fast and requires no setup.
*   **Production Note**: If the server crashes, this data vanishes. In production, we use **Redis** (a super-fast memory database) so data survives restarts and multiple servers can share the same queue.

### 4. The Event Listener (`io.on`)
```javascript
io.on('connection', (socket) => {
    // ... code here runs whenever a phone connects ...
});
```
*   **What**: This is the main loop. `socket` is the specific connection to ONE user's phone.

### 5. Matchmaking Logic
```javascript
socket.on('join_game', (data) => {
    queue.push(socket.id); // Add user to line
    if (queue.length >= 2) {
        // ... match them ...
    }
});
```
*   **What**:
    1.  User says "I want to play" (`join_game`).
    2.  We put them in the `queue`.
    3.  We check: "Are there 2 people waiting?"
    4.  If yes, we pull the first two out, put them in a private "Room" (using `socket.join(roomId)`), and tell them "Game Start!".

### 6. Real-Time Score Updates
```javascript
socket.on('submit_answer', (data) => {
    // ... update score ...
    socket.to(player.roomId).emit('opponent_score_update', { score: ... });
});
```
*   **What**: When Player A answers:
    1.  Server receives the answer.
    2.  Server calculates the new score.
    3.  `socket.to(roomId).emit(...)` sends a message ONLY to the *other* person in the room (Player B) saying "Hey, your opponent just got 10 points!".
*   **Magic Moment**: This is how Player B sees Player A's score update instantly without refreshing the screen.

---

## Part B: The Frontend (`mobile-app/App.js`)

This is the interface the student touches. It's built with **React**, which thinks in terms of "Components" (UI blocks) and "State" (Data).

### 1. State Variables (`useState`)
```javascript
const [name, setName] = useState('');
const [gameState, setGameState] = useState('LOBBY');
const [score, setScore] = useState(0);
```
*   **What**: "State" is the app's short-term memory.
    *   `gameState`: Are we in the Lobby? Waiting? Playing? This single variable decides which screen is visible.
    *   `score`: The current player's score.
*   **Why**: In React, when you update a State variable (e.g., `setScore(10)`), the screen *automatically* repaints itself to show the new number. We don't have to manually tell the screen to update.

### 2. The Connection (`useEffect`)
```javascript
useEffect(() => {
    const newSocket = io(SOCKET_URL);
    // ... listen for events ...
    return () => newSocket.close();
}, []);
```
*   **What**: `useEffect` runs code *once* when the app first loads.
*   **Action**: It dials the server (`io(SOCKET_URL)`). It then sets up listeners: "If the server says 'game_start', change my screen to 'PLAYING'."

### 3. Rendering the UI (The `return` block)
```javascript
return (
    <View style={styles.container}>
        {gameState === 'LOBBY' && ( ... Show Login Box ... )}
        {gameState === 'PLAYING' && ( ... Show Quiz ... )}
    </View>
);
```
*   **What**: This is JSX (JavaScript XML). It looks like HTML but is actually JavaScript.
*   **Logic**: We use conditional rendering (`gameState === 'LOBBY' && ...`).
    *   If `gameState` is 'LOBBY', the app draws the Login Box.
    *   If `gameState` changes to 'PLAYING', the Login Box instantly disappears, and the Quiz appears.
*   **Why**: This makes the app feel incredibly fast. We aren't loading new pages; we are just swapping visible components instantly.

### 4. Handling Answers
```javascript
const handleAnswer = (optionIndex) => {
    // Check if correct locally
    if (isCorrect) setScore(score + 10);
    
    // Tell server
    socket.emit('submit_answer', ...);
    
    // Next question
    setCurrentQIndex(prev => prev + 1);
};
```
*   **What**: This runs when a button is tapped.
*   **Optimistic UI**: We update the score *immediately* on the phone (`setScore`). We don't wait for the server to confirm "Yes, that's correct." This makes the game feel "lag-free."
*   **Production Note**: In a real money game or exam, we *would* wait for the server to confirm to prevent hacking. For a fun quiz, "Optimistic UI" is better.
