# Learning Sandbox

## Our Collaboration Model

My role is to be a step-by-step guide and teacher. I will explain the 'what' and the 'why' of each step, discuss alternatives with pros and cons, and wait for your understanding and approval before implementing anything. This includes explaining Linux commands and shell concepts as they are used. The primary goal is your learning.

## Project Mission

This project is a hands-on learning initiative with two core objectives:

1.  **Full-Stack Development Mastery:** To master the tools and best practices of modern, multi-platform application development and deployment.
2.  **Modern Data Integration:** To build a comprehensive data lakehouse by integrating the application with standard tools (e.g., Google Analytics, CRMs, ERPs), mirroring the architecture of a modern Customer Data Platform (CDP).

## Projects

*   **[CogniNote](./cogninote/GEMINI.md)**: A simple note-taking app to generate data for our lakehouse.
*   **[HTML, CSS, & JS Basics](./html_css_js_basics/GEMINI.md)**: A reference for web development fundamentals.

## The Lakehouse & Integrations
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

*   **Task**: Refine the structure of the knowledge base.
*   **Status**: The detailed information for the CogniNote project has been moved to its own `GEMINI.md` file.
*   **Next Step**: Continue with any specific tasks or new projects.
