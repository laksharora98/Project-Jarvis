# Customer Data Platform (CDP)

## Project Overview

This project focuses on building a proprietary Customer Data Platform (CDP) internally at Aakash. The primary goal is to create a unified, 360-degree view of the customer by consolidating data from the **Superleap CRM** into a "Golden Record" (User Profile) and an Event Stream.

**CRITICAL WARNING:** The `draft1/` folder contains initial PDF documentation (PRDs, Catalogs, Use Cases) which has known mistakes and inconsistencies. **Do not treat files in `draft1/` as completely true.** The PRD we are working on is the **`CDP_Phase_1_PRD.md`** file in the root of this directory.

### Known Inaccuracies in `draft1`
*   **Mobile Numbers:** The `draft1` documents describe complex logic for `student_msg_no`, `father_msg_no`, and `mother_msg_no`. **Decision:** We do not need this. We will use `primary_mobile_number` as the single source of truth for communication.

This centralized data will power:
1.  **Marketing Automation:** Syncing to tools like MoEngage/WebEngage.
2.  **Analytics:** Powering QuickSight dashboards and ad-hoc queries.

## Phase 1 Scope (Internal Build)

*   **Source:** Superleap CRM (Athena: `superleap-prod`).
*   **Core Entities:** Leads, Product/Scholarship Opportunities, Call Logs, Call Dispositions.
*   **Output:**
    *   **Silver Layer:** Normalized Dimension/Fact tables.
    *   **Gold Layer:**
        *   `cdp_dim_user`: Wide table with aggregated user attributes.
        *   `cdp_fact_events`: Event stream containing `call_log` and `call_disposition` events.

## Current Focus

*   **Task**: PRD Draft & Review (CRITICAL DELAY).
*   **Status**: 
    *   **Crisis Mode**: Missed multiple deadlines (Dec -> Jan 31 -> Feb 1).
    *   **Management Friction**: Manager is highly dissatisfied ("Let's talk when you are back").
    *   **Reason**: Combination of BAU overload, "Shadow Engineering" (fixing bugs personally), and procrastination.
*   **Next Step**: **ABSOLUTE DEADLINE: Sunday, Feb 1**. Complete the PRD. No excuses.

## Directory Structure
*   `CDP_Phase_1_PRD.md`: The draft PRD to be finalised after review.
*   `draft1/`: Initial PDF documentation (Contains known errors/inconsistencies).
*   `_archive/`: Old proposals and superseded documents.