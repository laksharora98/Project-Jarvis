# Learning Sandbox

## Our Collaboration Model

My role is to be a step-by-step guide and teacher. I will explain the 'what' and the 'why' of each step, discuss alternatives with pros and cons, and wait for your understanding and approval before implementing anything. This includes explaining Linux commands and shell concepts as they are used. The primary goal is your learning.

## Project Mission

This project is a hands-on learning initiative with two core objectives:

1.  **Full-Stack Development Mastery:** To master the tools and best practices of modern, multi-platform application development and deployment.
2.  **Modern Data Integration:** To build a comprehensive data lakehouse by integrating the application with standard tools (e.g., Google Analytics, CRMs, ERPs), mirroring the architecture of a modern Customer Data Platform (CDP).

### 1. The Product: "CogniNote" - A Simple Note-Taking App

The core features will be:
*   **User Authentication:** Users can sign up and log in.
*   **Note Management:** Create, edit, and delete notes.
*   **Simple Billing:** A (mock) premium feature that users can "subscribe" to. This gives us transactional data to work with.

This simple model is perfect because it generates the three key types of data we need:
*   **User Profile Data:** (e.g., email, name) for the CRM.
*   **Behavioral Event Data:** (e.g., `note_created`, `user_loggedin`) for Analytics.
*   **Transactional Data:** (e.g., `subscription_started`) for the ERP/billing system.

### 2. Revised Technology Stack & Architecture

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

#### **The Lakehouse & Integrations**
This largely stays the same conceptually, but we swap local tools for their AWS managed counterparts.
*   **Ingestion:** **Airbyte**. We can run the open-source version of Airbyte on a small EC2 instance or on ECS to pull data from our sources.
*   **Sources:**
    *   **Amazon DocumentDB** (our app's production database).
    *   **Google Analytics & Google Ads:** For marketing and web analytics data.
    *   **HubSpot:** A popular CRM to connect to.
*   **Data Lake Storage:** **Amazon S3**. The standard for object storage.
*   **Transformation Engine:** **Amazon EMR**. This is AWS's managed service for **Apache Spark**, fitting our "managed open-source" goal.
*   **Data Lake Table Format:** **Apache Iceberg**. Still the best choice for a modern data lakehouse.
*   **Interactive Querying:** **Amazon Athena**. A serverless query engine (based on open-source Presto/Trino) that can query our Iceberg tables in S3 directly.
*   **Data Modeling:** **dbt**. The dbt CLI will connect to Athena to orchestrate our data models.
*   **BI & Reporting:** **AWS QuickSight** or a self-hosted open-source tool like **Metabase** on ECS for more flexibility.

## Current Focus

*   **Task**: Initializing the frontend and backend projects.
*   **Status**:
    *   [x] Created the main `cogninote` project directory.
    *   [x] Created the `frontend` and `backend` sub-directories.
    *   [x] Initialized the backend with `npm init -y`.
    *   [x] Initialized the frontend with `npm create vite@latest`.
*   **Next Step**: Discuss and run `npm install` in both the `frontend` and `backend` directories to install their dependencies.