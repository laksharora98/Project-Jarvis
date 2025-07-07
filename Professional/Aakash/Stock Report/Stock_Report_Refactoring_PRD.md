# PRD: Stock Report Data Pipeline Refactoring

**Standard:** This document adheres to the [Data Platform Standards](./../Data%20Platform%20Standards/data_platform_standards.md).

## 1. Introduction & Scope

This document outlines the requirements and plan to refactor the data pipeline for the Aakash Stock Report. The primary objective is to re-architect the pipeline to align with the official **Silver & Gold Layer Architecture** defined in the Data Platform Standards.

This project will replace the current system of direct-to-source queries with a robust, multi-layered data architecture. The scope is limited to the backend data pipeline. The user-facing QuickSight dashboard visuals will be re-pointed to the new Gold Layer tables but will otherwise remain unchanged.

## 2. Problem Statement

The current architecture is built on direct queries to Bronze-layer (raw-equivalent) tables. This approach presents several challenges:

*   **Lack of a Curated Layer:** The absence of a trusted Silver (curated) or Gold (reporting) layer creates a brittle system where changes in raw data schemas can easily break the report.
*   **Complex & Redundant Logic:** Core business logic is repeated and entangled within the SQL queries of seven different QuickSight datasets, leading to inconsistencies and a high maintenance burden.
*   **No Single Source of Truth:** Without a dedicated analytics layer, there is no authoritative source for key business entities, making data validation and enhancement difficult.
*   **Poor Performance & Scalability:** Complex joins executed at query time lead to slow dashboard performance and high operational costs.

## 3. Proposed Architecture: Silver & Gold Layers

We will implement a best-practice, three-layer architecture. All business logic will be handled within the Glue ETL jobs, ensuring that consumers connect to clean, reliable, and purpose-built tables.

1.  **Bronze Layer:** The existing raw-equivalent tables in the Glue Data Catalog. (No changes)
2.  **Silver Layer (Curated):** A set of normalized, atomic dimension (`dim`) and fact (`fact`) tables that represent the single source of truth.
3.  **Gold Layer (Reporting):** A set of denormalized, wide, materialized tables, purpose-built for BI consumption.

---

## 4. Silver Layer Table Designs

### 4.1. Dimension Tables

*   **`core_dim_student`**: Master list of students. (PK: `psid`)
*   **`core_dim_application`**: A student's specific course application. (PK: `application_id`)
*   **`core_dim_branch`**: Master list of Aakash branches. (PK: `branch_id`)
*   **`core_dim_course`**: Master catalog of courses. (PK: `course_id`)
*   **`phoenix_dim_user`**: Phoenix system users. (PK: `employee_id`)
*   **`stock_dim_material`**: Master catalog of stock items. (PK: `material_id`)

### 4.2. Fact Tables

*   **`stock_fact_issuance`**: Transactional log of every stock movement. (PK: `transaction_id`)
*   **`stock_fact_inventory_detail`**: Detailed, item-level log of all physical inventory. (PK: `barcode`?)
*   **`finance_fact_payment`**: Log of student payments for miscellaneous courses. (PK: `receipt_id`?)

### 4.3. Bridge / Mapping Table

*   **`stock_map_student_eligibility`**: A definitive list of every material a student is eligible for, based on their standard course or miscellaneous purchases.

---

## 5. Gold Layer Table Designs

These materialized tables will be created by the Glue ETL process.

1.  **`stock_issuance_status`**
    *   **Description:** A wide, denormalized table showing the issuance status for every material a student is eligible for.
    *   **Source Logic:** A `LEFT JOIN` from `stock_map_student_eligibility` to `stock_fact_issuance`, further joined with all necessary dimensions.

2.  **`stock_transactions`**
    *   **Description:** A wide, denormalized audit log of every stock transaction (successful, failed, student, or branch) enriched with all dimensional attributes.
    *   **Source Logic:** `stock_fact_issuance` joined with all relevant dimension tables.

3.  **`stock_inventory_detail`**
    *   **Description:** A wide, denormalized table containing a detailed, item-level view of all physical stock on hand.
    *   **Source Logic:** `stock_fact_inventory_detail` joined with `stock_dim_material` and `core_dim_branch`.

---

## 6. BI Tool (QuickSight) Integration - Later - Can be done by PM directly

As per the Data Platform Standards:
*   The three Gold Layer tables will be the source for three new, consolidated QuickSight datasets.
*   The queries in QuickSight will be simple `SELECT *` statements against the Gold tables.
*   The existing dashboard will be re-pointed to these new datasets.

---

## 7. Future Enhancement: Requirement-Based Eligibility

The current eligibility logic is based on a direct mapping of courses to materials. This does not elegantly handle "one-of-many" scenarios (e.g., a student is eligible for one of three different T-shirt sizes; receiving any one of them fulfills the requirement). This should be considered for future iterations of the data platform.

## 8. Project Plan

1.  **Implementation:** Develop the Glue ETL/ELT pipelines to create and populate the Silver and Gold layer tables.
2.  **QuickSight Development:** Create the three new QuickSight datasets and re-point the existing dashboard visuals to them. Can be done by PM alongwith business users directly.
3.  **Validation:** Conduct a thorough validation of the new report against the old one to ensure data accuracy and consistency.
4.  **Decommission:** Once the new pipeline is validated and stable, decommission the seven old QuickSight datasets.