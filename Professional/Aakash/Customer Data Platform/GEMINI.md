# Customer Data Platform (CDP)

# Customer Data Platform (CDP)

## Project Overview

This project focuses on building a proprietary Customer Data Platform (CDP) internally at Aakash. The primary goal is to create a unified, 360-degree view of the customer by consolidating data from the **Superleap CRM** into a "Golden Record" (User Profile) and an Event Stream.

**CRITICAL WARNING:** The PDF documentation in this folder (PRDs, Catalogs, Use Cases) contains known mistakes and inconsistencies. **Do not treat these files as the source of truth.** All logic and requirements drawn from them must be explicitly discussed and verified with Laksh before being finalized.

This centralized data will power:
1.  **Marketing Automation:** Syncing to tools like MoEngage/WebEngage.
2.  **Analytics:** Powering QuickSight dashboards and ad-hoc queries.

## Phase 1 Scope (Internal Build)

*   **Source:** Superleap CRM (Athena: `superleap-prod`).
*   **Core Entities:** Leads, Product/Scholarship Opportunities, Call Logs.
*   **Output:**
    *   **Silver Layer:** Normalized Dimension/Fact tables.
    *   **Gold Layer:**
        *   `cdp_dim_user`: Wide table with aggregated user attributes.
        *   `cdp_fact_events`: Event stream containing **only** `call_log` and `call_disposition` events.

## Current Focus

*   **Task**: Define granular business logic for the Gold Layer.
*   **Status**: High-level PRD (`CDP_Phase_1_PRD.md`) created. Architecture confirmed.
*   **Next Step**:
    *   Resolve **Identity Resolution** logic (Student vs. Lead, Parent vs. Student Mobile).
    *   Define detailed schemas for Silver Layer tables.

## Key Documents
*   [CDP_Phase_1_PRD.md](./CDP_Phase_1_PRD.md) - Official PRD.


