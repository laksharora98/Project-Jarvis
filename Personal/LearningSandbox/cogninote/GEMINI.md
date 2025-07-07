# CogniNote: A Simple Note-Taking App

This project is the practical application component of the Learning Sandbox. It is a simple note-taking application that will be used to generate the data needed for the data lakehouse project.

## 1. The Product: "CogniNote" - A Simple Note-Taking App

The core features will be:
*   **User Authentication:** Users can sign up and log in.
*   **Note Management:** Create, edit, and delete notes.
*   **Simple Billing:** A (mock) premium feature that users can "subscribe" to. This gives us transactional data to work with.

This simple model is perfect because it generates the three key types of data we need:
*   **User Profile Data:** (e.g., email, name) for the CRM.
*   **Behavioral Event Data:** (e.g., `note_created`, `user_loggedin`) for Analytics.
*   **Transactional Data:** (e.g., `subscription_started`) for the ERP/billing system.

## 2. Revised Technology Stack & Architecture

Here’s a breakdown of the proposed tools and services on AWS:

#### **Application & Multi-Platform Strategy**
*   **Frontend (Web):** **React (with Vite)**. It's a modern, fast, and standard choice for web apps.
*   **Backend API:** **Node.js with Express.js**. A classic, robust choice for building APIs.
*   **Database:** **Amazon DocumentDB**. This is a managed, MongoDB-compatible database. It fits our "managed open-source" principle perfectly.
*   **Multi-Platform Path:** The React frontend can share logic and components with a **React Native** project for iOS/Android, fulfilling the multi-platform goal when we're ready to expand.

#### **Deployment & Infrastructure (AWS)**
*   **Containerization:** **Docker**. We will containerize the React and Node.js applications.
*   **Container Orchestration:** **Amazon ECS with AWS Fargate**. This is a powerful, serverless container orchestration service. It's simpler than Kubernetes (EKS) but provides the scalability and robustness of a true production environment. We avoid managing servers directly.
*   **Infrastructure as Code (IaC):** **Terraform**. This is the industry standard for cloud-agnostic IaC. Using it ensures you learn how to define infrastructure in a way that could be migrated to another cloud provider, directly addressing your vendor-portability requirement.
*   **Container Registry:** **Amazon ECR (Elastic Container Registry)** to store our Docker images.

#### **CI/CD Pipeline**
*   **Source Control:** **GitHub**.
*   **Automation:** **GitHub Actions**. We'll create a pipeline that automatically:
    1.  **On Pull Request:** Runs linters and automated tests.
    2.  **On Merge to `main`:** Builds Docker images, pushes them to Amazon ECR, and triggers a deployment to Amazon ECS.

## Current Focus

*   **Task**: Initializing the frontend and backend projects.
*   **Status**:
    *   [x] Created the main `cogninote` project directory.
    *   [x] Created the `frontend` and `backend` sub-directories.
    *   [x] Initialized the backend with `npm init -y`.
    *   [x] Initialized the frontend with `npm create vite@latest`.
*   **Next Step**: Paused. Resume by running `npm install` in both the `frontend` and `backend` directories to install their dependencies.