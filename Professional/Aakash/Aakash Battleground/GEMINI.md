# Aakash Battleground

## Project Overview
A competitive, topic-wise quiz battleground prototype designed to drive organic lead generation and student retention for Aakash (Foundation: Class 5th-10th).

**Status**: Prototype Complete (v1.1 Stable).

## Educational Mandate (Project "Glass Box")
**Goal**: Enable Product Managers to understand, replicate, and deploy this project without a dedicated engineer.
1.  **Explain Everything**: Every line of code or shell command must be explained (The "What" and the "Why").
2.  **Maintain the Log**: All technical decisions, package choices, and setup steps must be documented in `LEARNING_LOG.md`.
3.  **No Black Boxes**: Avoid complex abstractions where simple, readable code will suffice.

## Tech Stack (The "Vibe Coding" Stack)

| Component | Choice | Why? | Production Path |
| :--- | :--- | :--- | :--- |
| **Frontend** | **React Native (Expo)** | Zero-config native app; instant feedback on real phones; AI-friendly. | Eject to standard Android/iOS project; used by Discord/Tesla. |
| **Backend** | **Node.js + Socket.io** | Industry standard for real-time; single language (JS) for whole project. | Scale via Redis & Docker containers on AWS. |
| **Real-Time** | **WebSockets** | Instant state sync between two devices. | Same protocol; just requires better load balancing. |
| **Connectivity** | **Ngrok** | Public URL for local backend; bypasses complex cloud config/firewalls. | Move to AWS Fargate/ECS with a Load Balancer. |
| **Database** | **In-Memory (JS Variables)** | Zero latency; no setup; perfect for a transient prototype. | Migrate to PostgreSQL (Accounts) and Redis (Live Game). |

## Target Scope (Hackathon Goal)

We are optimizing for the **"Magic Moment"**: *Seeing your opponent's action impact your screen in real-time.*

1.  **Zero-Auth Entry**: User enters a nickname; no complex login.
2.  **Hardcoded Topic**: Focused on "Physics: Rotational Motion" (Foundation level).
3.  **Basic Matchmaking**: First two connected users are paired into a "Battle Room."
4.  **The Synchronized Battle**:
    *   3-5 Questions triggered simultaneously on both devices.
    *   10-second timer per question.
    *   **Visual Tension**: "Opponent answered!" indicators to build pressure.
    *   **Real-time Scoring**: Speed + Accuracy = Total Points.
5.  **Result Screen**: Clear Win/Loss state with final scores.

## Version History & Changelog

### v1.0 (Initial Prototype)
*   **Basic Connectivity**: Node.js Server + Socket.io + Expo Client.
*   **Simple Matchmaking**: FIFO Queue (First-In-First-Out).
*   **Q&A Logic**: 3 Hardcoded questions; immediate score updates.
*   **Result Screen**: Win/Loss based on final score.

### v1.1 (Stabilization & Resilience)
*   **Robust Matchmaking**: The server now verifies that both players are active before creating a room, eliminating "Ghost Matches".
*   **Graceful Disconnection**: If an opponent quits mid-game, the remaining player is instantly notified and declared the winner.
*   **Cancel Search**: Users can now leave the queue from the "Waiting" screen if matchmaking takes too long.
*   **Named Opponents**: Players now see the specific name of their opponent instead of a generic label.
*   **Visual Feedback**: Answers now highlight Green (Correct) or Red (Wrong) for 1 second before progressing.
*   **Input Debouncing**: Added protection against double-tapping options (multitouch bug).
*   **End-Game Sync**: The game now waits for BOTH players to finish before declaring a winner, preventing premature result screens.
*   **Room Cleanup**: Players are automatically removed from previous rooms when starting a new match, preventing data leaks and cross-talk.
*   **Keyboard Handling**: Implemented `KeyboardAvoidingView` so the "Join" button isn't hidden by the keyboard on small screens.
*   **The Timer (Speed Bonus)**: Each question now has a 10-second countdown. Faster answers earn more points (Base 10 + seconds left).
*   **Race Bars UI (Visual Tension)**: Replaced text scores with vertical progress bars. Opponent's bar flashes Green (Correct) or Red (Wrong) in real-time, simulating a live race.
*   **Resilience Layer**:
    *   **Blind Join Prevention**: Lobby button is disabled until connected.
    *   **Server Amnesia Handling**: If the server restarts, clients are forced back to the lobby gracefully.
    *   **Connection Loss Warning**: A "Reconnecting..." banner appears if internet drops mid-game.

## Remaining Issues (Backlog)

1.  **Security (Time Trust)**: The server validates the *answer* correctness (Fixed in v1.1), but it still trusts the client's `timeRemaining` for score calculation. A hacked client could always send "10 seconds left". (Requires server-side timestamping).

## Future Roadmap (Enhancements)

### Phase 2: Game Feel (Good to Have)
These features will increase engagement and the "fun factor" without requiring complex architecture changes.
1.  **Sound Effects**: Simple sounds for Correct, Wrong, and Win/Loss.
2.  **Haptic Feedback**: Vibrate the phone on Wrong answer or Game Over.
3.  **Avatars**: Let users pick a simple emoji avatar in the lobby.

### Phase 3: Production Readiness (Architecture)
These features are required for a real-world launch to thousands of students.
1.  **Server-Side Validation**: Move all answer checking and score calculation to the backend to prevent cheating.
2.  **Database Integration**: Migrate from In-Memory variables to **Redis** (for Game State) and **PostgreSQL** (for User Accounts/History).
3.  **CMS Integration**: Fetch questions dynamically from the Aakash CMS instead of hardcoding them.
4.  **Auth & Profiles**: Integrate with Aakash student accounts to track progress and leaderboards over time.
5.  **Ghost Engine**: Implement "Bots" (recorded gameplay from previous users) to ensure a user never waits more than 5 seconds for a match.

## Current Focus
*   **Active Task**: V1.1 Stabilization Complete.
*   **Immediate Next Step**: Review "Phase 2" enhancements or prepare for user testing.