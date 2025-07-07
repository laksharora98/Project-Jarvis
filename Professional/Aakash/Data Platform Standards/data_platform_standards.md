# Data Platform Standards

## 1. Data Architecture: Silver & Gold Layers

The Aakash Data Platform follows a two-layer medallion architecture built on top of the raw (Bronze) data. This structure ensures that data is reliable, scalable, and easy to use.

*   **Silver Layer (The "Single Source of Truth")**
    *   **Purpose:** To provide a clean, validated, and integrated source for all business entities and events. This layer contains normalized dimension (`dim`) and fact (`fact`) tables.
    *   **Consumption:** The primary source for data scientists, analysts, and reverse ETL tools that require access to atomic, normalized data for deep analysis or complex joins.

*   **Gold Layer (The "Data Marts")**
    *   **Purpose:** To provide performance-optimized, use-case-specific data marts. This layer contains denormalized, pre-joined, and often aggregated tables ready for consumption.
    *   **Consumption:** The preferred source for BI tools like QuickSight, where dashboard performance and query simplicity are critical.

## 2. Data Access Policy

*   **Gold Layer:** The **preferred** source for all BI and dashboarding tools.
*   **Silver Layer:** **Available** for data science, ad-hoc analysis, and systems that need to perform complex joins not already captured in the Gold layer.
*   **Bronze (Raw) Layer:** Access for analytical purposes is **prohibited**. All consumers must use the Silver or Gold layers.

## 3. Naming Conventions

### 3.1. Silver Layer Tables

*   **Format:** `group_type_entity`
*   **Components:**
    *   `group`: The business domain (e.g., `core`, `stock`, `finance`, `academics`).
    *   `type`: `dim` (for dimension tables) or `fact` (for event/transactional tables).
    *   `entity`: The business entity the table describes (e.g., `student`, `branch`, `issuance`).
*   **Examples:**
    *   `core_dim_student`
    *   `stock_fact_issuance`

### 3.2. Gold Layer Tables

*   **Format:** A descriptive name based on the business use case the table serves.
*   **Examples:**
    *   `stock_issuance_status`
    *   `faculty_scorecard`

### 3.3. Column Names

*   **Format:** All column names **must** be in `snake_case`.
*   **Timestamps:** Must be stored in **UTC** and end with `_at` (e.g., `created_at`).
*   **Dates:** Must end with `_date` (e.g., `issuance_date`).
*   **Booleans:** Must start with `is_` or `has_` (e.g., `is_active`).

## 4. Data Modeling & Operational Standards

*   **Handling Missing Values:** Missing or unknown data **must** be represented by `NULL`.
*   **No Nested Data:** Nested data from source systems **must** be flattened into discrete columns in the Silver layer.
*   **Zero-Downtime Refreshes:** Data refreshes must be atomic. All Silver and Gold tables **must** remain available for querying at all times.
*   **No BI Logic:** All business logic, joins, and calculations **must** be performed in the ETL/ELT pipeline that creates the Gold layer tables. BI tools should use simple `SELECT` queries against the Gold layer whenever possible.
