# Data Lake 2.0 (Medallion Architecture)

## Project Overview

Data Lake 2.0 is a major architectural overhaul of the Aakash Data Lake. The goal is to implement a **Medallion Architecture** (Bronze, Silver, Gold layers) to improve data quality, reliability, and usability for downstream analytics and machine learning.

## Core Objectives

*   **Medallion Architecture**: Implement Bronze (Raw), Silver (Cleansed/Joined), and Gold (Business-Ready) layers.
*   **Data Quality**: Establish automated checks and validations at each layer.
*   **Standardization**: Enforce the use of the [Data Platform Standards](../Data%20Platform%20Standards/data_platform_standards.md).
*   **Performance**: Optimize query performance using Iceberg table formats and Athena.

## Current Focus

*   **Task**: Finalize PRD & Groom significant portion.
*   **Status**: Initial project structure created; PRD drafting in progress.
*   **Next Step**: 
    *   Finalize the PRD with detailed requirements for each layer (Target: Jan 20-21).
    *   Conduct grooming sessions with the engineering team to review the architecture.
    *   Identify initial pipelines for migration to the new architecture.

## Detailed Documentation
*   (To be added as documents are created)
