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

## Part C: The "Magic" of Concurrency (How it handles multiple players)

**The Question:**
"How does this code handle 100 players at once? Does it create 100 threads like Python?"

**The Answer:**
No. Node.js is **Single-Threaded**. This means it has only **one** brain working at a time.

**The "Waiter" Analogy:**
*   **Multi-Threaded Server (e.g., Python/Java default)**:
    *   Imagine a restaurant with 100 tables.
    *   You hire **100 Waiters**. Each waiter stands at one table. If the customer is thinking, the waiter just stands there doing nothing.
    *   *Pros*: Simple to understand. *Cons*: Heavy memory usage (100 waiters!).
*   **Node.js (Event Loop)**:
    *   You have **1 Super-Fast Waiter**.
    *   The waiter runs to Table 1: "Order?" -> "Hang on..." -> Waiter immediately runs to Table 2.
    *   Table 2: "Here's my order" -> Waiter gives it to the kitchen and immediately runs to Table 3.
    *   Kitchen: "Order for Table 2 ready!" -> Waiter runs back to Table 2.
    *   This waiter **never waits**. They only handle the *events* (Order placed, Food ready).

**Why this works for us:**
In our game, the server does very little "thinking" (CPU work). It just routes messages.
*   Player A sends answer -> Server updates score -> Server tells Player B.
*   This takes microseconds. The "Waiter" handles Player A, then is instantly free to handle Player B.
*   It can handle thousands of concurrent connections because it's not holding memory for "waiting" threads.

## Part D: Scaling to Millions (The Production Path)

**The Problem:**
Our current code stores everything in **variables** (`players`, `queue`).
*   **Limitation 1 (CPU)**: One Node.js process uses only 1 CPU core. If 1 million users join, that one core will melt.
*   **Limitation 2 (Memory)**: If we start 10 servers to handle the load, Server A has its own `queue` and Server B has *its* own `queue`. Player 1 (on Server A) will never be matched with Player 2 (on Server B).

**The Solution: The "Shared Brain" Architecture**

1.  **Horizontal Scaling (Many Servers)**:
    *   Instead of 1 server, we run 100 servers (e.g., using AWS ECS or Kubernetes).
    *   We use a **Load Balancer** (like Nginx) to distribute traffic: User 1 -> Server A, User 2 -> Server B.

2.  **Redis (The Shared Memory)**:
    *   We stop using variables (`let queue = []`).
    *   Instead, we use **Redis**. Redis is a lightning-fast, external memory database.
    *   *New Logic*: "Server A, please write 'User 1' to the *Redis* queue."
    *   Now, Server B looks at Redis, sees 'User 1', and matches them with 'User 2'.

3.  **The Socket.io Redis Adapter**:
    *   **Scenario**: User 1 is connected to Server A. User 2 is connected to Server B.
    *   Server A needs to tell User 2 (on Server B) "You lost!".
    *   We install `@socket.io/redis-adapter`.
    *   Server A sends a message to Redis -> Redis broadcasts it to ALL servers -> Server B hears it and tells User 2.

**Summary**: To scale, we move "State" (Memory) out of the app and into a shared database (Redis).

## Part E: "But won't Redis explode?" (Advanced Scaling)

**The Doubt:**
"If we have millions of users, won't Redis become a bottleneck? And won't broadcasting every move to every server create a traffic jam?"

**The Answer:**
You are 100% correct. The "Naive Redis" approach works for ~50k users, but fails at 1 million. Here is how the big players (Discord, WhatsApp) fix it:

1.  **Redis Clustering (Sharding)**:
    *   We don't use *one* Redis. We use 100 Redis nodes.
    *   We split data alphabetically (or by ID). Users A-C go to Redis #1. Users D-F go to Redis #2.
    *   This way, no single database gets overwhelmed.

2.  **Server Sharding (The "Islands" Strategy)**:
    *   We don't let every server handle every room. We divide the world into "Islands".
    *   **Island A** (10 Servers) handles only "Physics Rooms".
    *   **Island B** (10 Servers) handles only "Math Rooms".
    *   If you are playing Physics, you are routed to Island A. Server 5 in Island A doesn't care about what's happening in Island B.
    *   This eliminates the "Broadcast Storm" because messages stay local to their Island.

3.  **Sticky Sessions**:
    *   We try our hardest to put Player 1 and Player 2 on the **exact same server** using a Load Balancer.
    *   If they are on the same server, we don't need Redis at all! The server just passes the message in memory (microsecond speed). Redis is only the fallback if they end up on different machines.

---

# Syntax Guide: JavaScript for Python Developers

This section translates weird JavaScript syntax into Python concepts.

## 1. Importing Modules (`require` vs `import`)

**The Backend (Node.js / CommonJS):**
```javascript
const express = require('express');
```

**The Frontend (React / ES Modules):**
```javascript
import React, { useState, useEffect } from 'react';
```

**The Breakdown:**
*   **Backend (`require`)**: This is the older "CommonJS" standard. It's like a function call that returns a module.
*   **Frontend (`import`)**: This is the modern "ES Modules" (ESM) standard. It is now the official way to do imports in JavaScript.
*   **`{ useState, useEffect }`**: Just like before, the curly brackets mean we are **destructuring**. We are grabbing specific functions (`useState` and `useEffect`) from the 'react' package instead of the whole library.

**Python Comparison:**

| JavaScript | Python |
| :--- | :--- |
| `const express = require('express');` | `import express` |
| `const { Server } = require('socket.io');` | `from socket.io import Server` |

## 2. Variables: `const` vs `let` (and the death of `var`)

**The Breakdown:**
In Python, you just write `x = 5`. In JavaScript, you must decide how "sticky" the variable is.

1.  **`const` (Constant)**:
    *   **Behavior**: Cannot be changed after the first time.
    *   **When to use**: 90% of the time.
2.  **`let`**:
    *   **Behavior**: Can be reassigned.
    *   **When to use**: When the value needs to be updated.
3.  **`var` (The Legacy Way)**:
    *   **What about `var`?**: You will see `var` in older tutorials. **Do not use it.**
    *   **Why?**: `var` has "bad manners." It doesn't respect "Block Scope."

**What is Block Scope?**
In JS, a "Block" is anything inside curly brackets `{ }` (like an `if` statement or a `for` loop).
*   **`let` & `const`**: If you define them inside an `if` block, they "die" when the block ends. They stay tidy.
*   **`var`**: If you define it inside an `if` block, it "leaks" out and stays alive even after the block is done. This causes mysterious bugs.

**Summary**: Use `const` by default. Use `let` if you need to change the value. Forget `var` exists.

## 3. Curly Brackets (`{ }`) in Imports: Destructuring

**The Code:**
```javascript
const { Server } = require('socket.io');
```

**The Breakdown:**
This is called **Destructuring**. 
In Python, when you do `from socket.io import Server`, you are reaching into the module and grabbing just one piece. 

In JavaScript, most modules are just big "Dictionaries" (called Objects). `require('socket.io')` returns that big dictionary. 
By putting `{ Server }` on the left side, you are saying: "I know the dictionary returned by this function has a key named 'Server'. Please extract that value and save it into a new variable called 'Server'."

**Comparison:**
*   **Without Destructuring (The long way)**:
    ```javascript
    const socketio = require('socket.io');
    const Server = socketio.Server;
    ```
*   **With Destructuring (The shorthand)**:
    ```javascript
    const { Server } = require('socket.io');
    ```

## 3. The Server Sandwich: Express, HTTP, and Socket.io

**The Code:**
```javascript
const app = express();
const server = http.createServer(app);
const io = new Server(server, ...);
```

**The Breakdown:**
*   **`express` (`app`)**: Think of this as the **Head Chef**. It handles the logic: "If a user orders a burger (goes to `/burger`), make a burger." It doesn't know how to talk to the internet directly; it just processes orders.
*   **`http`**: This is the **Restaurant Building**. It handles the low-level networking (opening doors, accepting connections on Port 3000).
*   **Why connect them manually?**
    *   Normally, Express is smart enough to build its own restaurant (`app.listen()`).
    *   **BUT**, we are using **Socket.io** (The Real-Time Engine).
    *   Socket.io acts like a **Drive-Thru window** attached to the same building. It needs access to the *raw* server structure, not just the Chef.
    *   So we build the `server` (Building) manually using `http`, put `app` (Chef) inside it to handle normal requests, and then attach `io` (Drive-Thru) to the side.

## 4. Data Types: Brackets & Parentheses

**The Code:**
```javascript
let players = {}; 
let queue = [];
```

**The Breakdown:**
*   **`{}` (Curly Brackets)**: This creates an **Object**. 
    *   *Python Equivalent*: **Dictionary** (`dict`). 
    *   In JS, we say "Key-Value Pairs". e.g., `{ "name": "Laksh" }`.
*   **`[]` (Square Brackets)**: This creates an **Array**.
    *   *Python Equivalent*: **List**.
    *   Just like Python, it's an ordered sequence: `[1, 2, 3]`.
*   **`()` (Parentheses)**: Used for **Functions**, exactly like Python.
    *   `print("Hello")` in Python becomes `console.log("Hello")` in JS.

**Variable Keywords:**
*   **`let`**: Unlike `const`, variables declared with `let` **can be changed**. 
    *   We use `let` for the `queue` because we will be adding and removing people from it constantly.

## 5. Functions: The Arrow Syntax (`=>`)

**The Code:**
```javascript
io.on('connection', (socket) => { ... });
```

**The Breakdown:**
*   **`(socket) => { ... }`**: This is a **Function**. 
    *   In Python, you define a function with `def my_func(socket):`.
    *   In modern JavaScript, we often write "Anonymous Functions" (functions with no name) right inside other code using the **Arrow Syntax**.
*   **Translation**:
    *   `(socket)`: The inputs (arguments).
    *   `=>`: "Goes into..."
    *   `{ ... }`: The actual code to run.

**Python Comparison:**
It's like passing a function as an argument (Callbacks).

*   **Python (Conceptual):**
    ```python
    def handle_connection(socket):
        print("User connected")

    io.on('connection', handle_connection)
    ```

*   **JavaScript (Arrow):**
    ```javascript
    io.on('connection', (socket) => {
        console.log("User connected");
    });
    ```
This creates the function *right there* and passes it to `io.on` without needing to name it.

## 6. Modern JS Features: Defaults & Templates

**The Code:**
```javascript
const playerName = data.name || `Player ${socket.id.substr(0,4)}`;
```

**The Breakdown:**
*   **`||` (Logical OR)**: This is a clever trick for **Default Values**. 
    *   It means: "Use `data.name` if it exists. If it's empty/null, use the thing on the right instead."
    *   *Python Equivalent*: `data.get('name') or "Default"`
*   **Backticks (`` ` ``)**: These are **Template Literals**. 
    *   Unlike normal quotes (`'` or `"`), backticks let you put variables directly inside a string.
    *   *Python Equivalent*: **f-strings** (`f"Player {name}"`).
*   **`${ ... }`**: This is how you tell JS: "Stop treating this as text and evaluate the variable inside."
*   **`.substr(0,4)`**: This is **String Slicing**.
    *   *Python Equivalent*: `socket.id[:4]` (Get the first 4 characters).

## 7. Array Methods: Managing the Queue

**The Code:**
```javascript
queue.push(socket.id);
const p1Id = queue.shift();
```

**The Breakdown:**
These are the standard ways to add and remove items from a "List" (Array) in JS.

*   **`.push(value)`**: Adds an item to the **end** of the list.
    *   *Python Equivalent*: `list.append(value)`
*   **`.shift()`**: Removes the **first** item (at index 0) and returns it.
    *   *Python Equivalent*: `list.pop(0)`

**Queue Logic (FIFO - First In, First Out):**
By using `push` to add people and `shift` to take them out, we ensure that the person who has been waiting the longest gets matched first.

**Direct Translation:**

| Action | JavaScript | Python |
| :--- | :--- | :--- |
| Add to end | `list.push(x)` | `list.append(x)` |
| Remove from start | `list.shift()` | `list.pop(0)` |
| Remove from end | `list.pop()` | `list.pop()` |

## 8. Modern JS Features: Optional Chaining (`?.`)

**The Code:**
```javascript
io.sockets.sockets.get(player1Id)?.join(roomId);
```

**The Breakdown:**
*   **`?.` (Question Mark Dot)**: This is called **Optional Chaining**.
    *   It effectively says: "Try to do the next thing... BUT if the thing before the dot is `null` or `undefined` (doesn't exist), just stop immediately and don't crash."
*   **Why use it here?**
    *   We are trying to find a player's socket connection using `.get(player1Id)`.
    *   **The Risk**: What if that player disconnected 1 millisecond ago? `.get()` would return `undefined`. Calling `.join()` on `undefined` would crash the whole server.
    *   **The Solution**: The `?.` acts as a safety guard. If the player is gone, the code just stops at the `?` and moves to the next line safely.

**Direct Translation:**

*   **JavaScript (Safe):**
    ```javascript
    player?.join(room);
    ```

*   **Python (Safe):**
    ```python
    if player is not None:
        player.join(room)
    ```

## 9. Socket.io Broadcasting: "Me vs. Everyone"

**The Code:**
```javascript
socket.to(player.roomId).emit('opponent_score_update', ...);
```

**The Confusion:**
"If I send a message to the room, don't *I* get it too?"

**The Answer:**
No, not with `socket.to`. Socket.io has specific "verbiage" for who gets the message:

1.  **`socket.emit(...)`**: Sends ONLY to the **Sender** (Reply).
    *   *Analogy*: Whispering back to the person who spoke to you.
2.  **`io.to(room).emit(...)`**: Sends to **EVERYONE** in the room (including the sender).
    *   *Analogy*: Using a loudspeaker in the room. Everyone hears it.
3.  **`socket.to(room).emit(...)`**: Sends to **EVERYONE ELSE** in the room (EXCEPT the sender).
    *   *Analogy*: Turning to the crowd and saying "He said..." (The sender doesn't need to hear it, they just said it).

**Why use it here?**
When I score 10 points, I already know I scored 10 points (my app updated instantly). I only need to tell my **opponent** so their screen updates. Sending it back to me is redundant.

## Part B: The Frontend (`mobile-app/App.js`)

This is the interface the student touches. It's built with **React**, which thinks in terms of "Components" (UI blocks) and "State" (Data).

### 1. The Hierarchy: JS vs. React vs. React Native

**The Confusion:**
"Why do we need three things? Isn't it all just code?"

**The Stack:**
1.  **Vanilla JavaScript (The Language)**:
    *   *What*: Loops, Variables, Functions, Math.
    *   *Role*: The raw logic. It's the "bricks" of the house.
    *   *Example*: `const sum = 1 + 2;`
2.  **React (The Architect)**:
    *   *What*: A library for building User Interfaces (UI).
    *   *Role*: It organizes your bricks into "Rooms" (Components). It handles the "State" (e.g., If score changes, repaint the score text).
    *   *Why needed?*: Writing UI updates in vanilla JS is messy. React automates it.
3.  **React Native (The Builder)**:
    *   *What*: A framework that takes React designs and builds them for **Phones**.
    *   *Role*: Instead of building a Website (`<div>`, `<h1>`), it builds a Native Mobile App (`<View>`, `<Text>`) that runs on iOS and Android.

**Summary**: We write **JavaScript** logic, organized by **React**, rendered by **React Native**.

### 2. Syntax: `export default function App()`

**The Code:**
```javascript
export default function App() { ... }
```

**The Breakdown:**
*   **`function App() { ... }`**: This defines a **Component**. In React, every UI screen or part (Button, Header, Screen) is just a function.
    *   *Rule*: Component names MUST start with a Capital Letter (`App`, not `app`).
*   **`export default`**: This makes the function available to the outside world.
    *   The `index.js` file (hidden by Expo) needs to import this `App` to start the application.
    *   *Python Equivalent*: It's like having a `main()` function that is imported and run by the system.

### 3. State Variables (`useState`)

**The Code:**
```javascript
const [socket, setSocket] = useState(null);
```

**The Breakdown:**
*   **`useState(null)`**: This is a **Hook**. It creates a piece of "Memory" for this component. We start it with the value `null`.
*   **`const [socket, setSocket]`**: This is **Array Destructuring** again!
    *   `useState` returns an array with exactly two items: `[currentValue, functionToUpdateIt]`.
    *   **`socket`**: The variable that holds the data (like `x`).
    *   **`setSocket`**: The function we MUST use to change the data (like `x = ...`).
*   **Why use `setSocket`?**
    *   In JS, if you do `socket = 'value'`, React **won't know**. The screen won't update.
    *   If you do `setSocket('value')`, React says: "Aha! Data changed! I need to re-draw the screen!"

**Python Translation:**
It's like a class property with a getter and setter.
```python
self._socket = None

def set_socket(self, value):
    self._socket = value
    self.redraw_screen() # The magic part
```

self.redraw_screen() # The magic part
```

### 4. The "Side Effect" Hook (`useEffect`)

**The Code:**
```javascript
useEffect(() => {
    const newSocket = io(SOCKET_URL);
    // ...
    return () => newSocket.close();
}, []);
```

**The Breakdown:**
*   **`useEffect`**: This tells React to run some code **after** the screen renders.
*   **The Dependency Array (`[]`)**: This is the magic part at the end.
    *   `[]` (Empty): Run this code **ONLY ONCE** when the component first appears (Mount).
    *   `[score]`: Run this code every time `score` changes.
    *   *(Missing)*: Run this code on *every single frame*. (Don't do this).
*   **The "Cleanup" Return**:
    *   `return () => newSocket.close();`
    *   React runs this function when the component disappears (Unmount). It's for cleaning up messes (closing connections, stopping timers) to prevent memory leaks.

**Translation**:
"When this app starts (`[]`), open a connection. When the app closes (`return`), close the connection."

### 5. Events vs. Effects (Why `joinGame` doesn't run automatically)

**The Question:**
"Does `joinGame` run automatically whenever `socket` or `name` changes?"

**The Answer:**
**No.** This is a common confusion.

*   **`useEffect` (The Watcher)**: Runs automatically when data changes.
    *   *Analogy*: A security guard watching a camera. If movement happens, they act immediately.
*   **Functions like `joinGame` (The Tool)**: These are just definitions. They sit there doing absolutely nothing until a human interaction triggers them.
    *   *Analogy*: A fire extinguisher. It doesn't go off just because there is a fire. Someone must pull the pin and squeeze.

**The Trigger:**
In the JSX (UI code) below, we explicitly wire the button to the function:
```javascript
<TouchableOpacity onPress={joinGame}>
```
This means: "Only run `joinGame` when the user **taps** this button."

### 6. Rendering the UI (The `return` block)
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

### 7. UI Fundamentals: Views, Text, & Flexbox (For Non-Designers)

**The Concept:**
In Mobile Dev, **Everything is a Box**.
*   A button is a box.
*   A text label is a box inside a bigger box.
*   The screen is one giant box.

**The Components (Your Bricks):**
1.  **`<View>`**: The generic "Box".
    *   It doesn't *do* anything. It just holds other things.
    *   *Analogy*: A `<div>` in HTML or a `Frame` in Tkinter/PyQt.
2.  **`<Text>`**: The only thing that can show words.
    *   *Rule*: You cannot put text inside a `<View>` directly. It MUST be wrapped in `<Text>`.
3.  **`<TouchableOpacity>`**: A Box that detects taps.
    *   When you touch it, it dims slightly (opacity changes) to give feedback. It's our "Button".

**The Styling System: Flexbox (The "Stretchy Glue")**
How do we arrange these boxes? We use **Flexbox**.

*   **`flex: 1`**: "Take up ALL available space."
    *   If the screen is the parent, `flex: 1` means "Fill the whole phone screen."
*   **`flexDirection`**:
    *   `'column'` (Default): Stack items vertically (Top to Bottom).
    *   `'row'`: Line items up horizontally (Left to Right).
*   **`justifyContent` (Main Axis Alignment)**:
    *   If direction is Column (vertical), this controls vertical alignment.
    *   `'center'`: Put everything in the middle.
    *   `'space-between'`: Push items to the far edges (Top and Bottom).
*   **`alignItems` (Cross Axis Alignment)**:
    *   If direction is Column (vertical), this controls horizontal alignment.
    *   `'center'`: Center items horizontally.

**Example from our Code:**
```javascript
container: {
  flex: 1,                 // Fill the whole phone screen
  backgroundColor: '#121212', // Dark Mode background
  alignItems: 'center',    // Center everything horizontally
  justifyContent: 'center', // Center everything vertically
},
```
This single style block guarantees our content is perfectly centered on ANY phone screen, big or small.

### 8. Cross-Platform Magic: How `<View>` works everywhere

**The Question:**
"Does writing `<View>` really work on Web, Android, and iOS automatically?"

**The Answer:**
**Yes.** This is the superpower of React Native (and Expo).

**The Translation Process:**
When you write `<View>`, you are writing an **abstraction**. You are telling React: "I want a container here."
*   **On Android**: React Native translates `<View>` into `android.view.ViewGroup`.
*   **On iOS**: React Native translates `<View>` into `UIView`.
*   **On Web**: The library `react-native-web` translates `<View>` into a standard HTML `<div>`.

**Why is this better than a generic website wrapper?**
Other frameworks (like Ionic or Cordova) just show a website inside a mobile app shell.
React Native creates **Real Native Components**. The button you see on the iPhone is a *real* Apple `UIButton`, not a fake HTML button. This ensures performance and the correct "feel" for each platform.

### 9. Conditional Rendering: The `{ && }` Magic

**The Code:**
```javascript
{gameState === 'LOBBY' && (
  <View style={styles.lobby}> ... </View>
)}
```

**The Question:**
"How does the app know to switch screens? Does it delete the old screen?"

**The Answer:**
1.  **The Trigger**: You call `setGameState('LOBBY')`.
2.  **The Re-Render**: React sees the State changed. It runs the entire `App()` function **again** from top to bottom.
3.  **The Logic**:
    *   It reaches the line: `gameState === 'LOBBY'`.
    *   **True**: It renders the `<View>` inside the parentheses.
    *   Then it reaches `gameState === 'PLAYING'`.
    *   **False**: It ignores that block completely.
4.  **The Result**: The "Lobby" View appears, and the "Playing" View disappears.

**The Syntax `{ condition && (Result) }`**:
*   This is a standard JavaScript logic trick called **Short-Circuit Evaluation**.
*   It means: "If the Left Side is TRUE, then do the Right Side. If the Left Side is FALSE, stop immediately (return null)."

**Why is this cool?**
You don't need complex `if/else` logic to hide/show things. You just describe the rules: *"Only show the Lobby if the state is Lobby."* React handles the adding/removing from the screen for you.

### 10. Double Protection: The `&&` Chain

**The Code:**
```javascript
{gameState === 'PLAYING' && currentQuestion && (
  <View> ... </View>
)}
```

**The Question:**
"Why do we check `currentQuestion` too? Isn't checking `PLAYING` enough?"

**The Answer:**
This is a **Safety Check** (Guard Clause).
*   **Scenario**: The game just started (`PLAYING`), but the internet is slow, so the `questions` list is still empty for a split second.
*   **The Crash**: If we try to render `<Text>{currentQuestion.question}</Text>` but `currentQuestion` is `undefined`, the app **Crashes**.
*   **The Fix**: We say:
    1.  "Are we playing?" (**YES**)
    2.  "AND... Do we actually have a question loaded?" (**YES**)
    3.  "Okay, THEN render the screen."

If `currentQuestion` is null, the chain stops, and nothing renders. The user sees a blank space for 0.1s instead of a crash.

**Translation**: `if (state == 'PLAYING' and current_question is not None): render()`

### 11. Resilience: Auto-Reconnection & Refs

**The Question:**
"If `useEffect` only runs once, how does the app know to reconnect when the internet comes back? And how does it know the *current* game state inside a function created hours ago?"

**1. The Invisible Helper (Socket.io Manager)**
*   You don't write `socket.connect()`. The library does it for you.
*   **Loop**: Connection Lost -> Wait 1s -> Retry -> Wait 2s -> Retry -> Success!
*   When it succeeds, it fires the `'connect'` event again. This triggers our listener, even if `useEffect` finished long ago.

**2. The Problem with Closures**
*   **Issue**: When we define `newSocket.on('connect', ...)` at startup, it takes a snapshot of the variables *at that moment*.
*   At startup, `gameState` is `'LOBBY'`.
*   Even if the game changes to `'PLAYING'`, the listener inside the socket remembers the old `'LOBBY'` value. This is called a **Stale Closure**.

**3. The Fix: `useRef` (The Magic Window)**
*   **The Code**: `const gameStateRef = useRef(gameState);`
*   **What is a Ref?**: It's a mutable box that React *doesn't* track for re-renders, but stays consistent.
*   **Analogy**: 
    *   `gameState` is a photograph (Static snapshot).
    *   `gameStateRef` is a live CCTV feed.
*   By looking at `gameStateRef.current`, the listener can see the *live* value of the state, allowing us to correctly check if we are mid-game when a reconnection happens.

### 12. Input Polish: Making Text Entry Feel Native

**The Props:**
```javascript
<TextInput
  autoCapitalize="words" // "Laksh Arora" instead of "laksh arora"
  autoCorrect={false}    // Don't change "Laksie" to "Lassie"
  returnKeyType="done"   // Show "Done" instead of "Enter" on keyboard
/>
```

**Why this matters:**
Default text inputs feel "web-like" and clunky. By tweaking these small settings, the keyboard behaves exactly how a user expects for a *Name* field (Capitalized, no spellcheck). It's the difference between a prototype and a product.

### 13. Developer Workflow: Hot Reloading & iOS Tips

**Backend (Node.js)**
*   **Problem**: `node index.js` runs once. You have to Ctrl+C and restart every time you change code.
*   **Solution**: Use `nodemon`. It watches files and restarts automatically.
    *   *Command*: `npx nodemon index.js`

**Frontend (Expo)**
*   **Feature**: Expo has "Fast Refresh". Save `App.js`, and your phone updates instantly.
*   **iOS Connection Issue**: Apple removed the QR code scanner feature from the iOS Camera app for Expo.
    *   *Fix 1 (Same Wi-Fi)*: Open "Expo Go" app -> Look for your computer under "Recently in Development".
    *   *Fix 2 (Manual)*: Copy the `exp://...` URL from the terminal -> Paste into Safari -> "Open in Expo Go".
    *   *Fix 3 (Tunnel)*: Run `npx expo start --tunnel`. This works even if your router blocks local connections.

## Part C: The "Magic" of Concurrency (How it handles multiple players)
