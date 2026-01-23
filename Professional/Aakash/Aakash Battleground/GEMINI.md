# Aakash Battleground

## Project Overview
A competitive, topic-wise quiz battleground prototype designed to drive organic lead generation and student retention for Aakash (Foundation: Class 5th-10th).

**Status**: Prototype Complete (V1).

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

## Product Features: Hackathon Scope (MVP)

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

## Future Roadmap (Production)
*   **User Profiles & Auth**: Permanent identity and progress tracking.
*   **CMS Integration**: Dynamic question fetching from a database.
*   **Ghost Engine**: Play against recorded games when no live opponent is available.
*   **Lead Scoring**: Tracking topics played to provide behavioral data for sales counselors.

## Current Focus
*   **Active Task**: Prototype (V1) testing and feedback.
*   **Immediate Next Step**: Demonstrate the "Magic Moment" by running two app instances and matching them.
