# Product Requirements Document (PRD): Aakash Internal CDP - Phase 1

| Attribute | Details |
| :--- | :--- |
| **Project Name** | Aakash Internal CDP |
| **Phase** | Phase 1 (CRM Foundation & Single Customer View) |
| **Owner** | Laksh Arora (Data Product Manager) |
| **Status** | **In Progress** (Architecture Defined) |
| **Source System** | Superleap CRM (Athena: `superleap-prod`) |

---

## 1. Executive Summary
We are building a proprietary, internal Customer Data Platform (CDP) to serve as the single source of truth for student profiles. The goal is to construct a **Single Customer View (SCV)** that unifies data from our CRM (**Superleap**) and eventually digital touchpoints.

This centralized data will drive:
1.  **Marketing Automation:** Syncing "Golden Records" to tools like **MoEngage/WebEngage** for segmentation and journey orchestration.
2.  **Analytics:** Powering ad-hoc queries and QuickSight dashboards with clean, reliable data.

## 2. Phase 1 Scope: The CRM Foundation

**In Scope:**
*   **Source:** Superleap CRM data only (available in AWS Athena).
*   **Data Domain:**
    *   **Core Profiles:** Leads/Students.
    *   **Transactions/State:** Product Opportunities, Scholarship Opportunities (ANTHE/IACST), Exam Attendance/Results.
    *   **Interactions:** 
        *   **Call Logs:** System-generated telemetry (Duration, Connected Status).
        *   **Call Dispositions:** User-generated forms (Interaction Type, Stage Update, Discussion Notes).
*   **Output:** A simplified Gold Layer consisting of **Users** (Attributes) and **Events** (Actions).

**Out of Scope (Phase 1):**
*   Call Recordings (Audio analysis/Insights).
*   Digital/Behavioral Data (WebEngage, Google Analytics) – *To be added in Phase 2*.
*   Legacy Salesforce Data (assuming full migration to Superleap is complete).

## 3. Data Architecture (Medallion Model)

We will follow a standard Bronze-Silver-Gold architecture to ensure data quality, reusability, and performance.

### 3.1 Bronze Layer (Raw)
*   **Source:** `superleap-prod` database in Athena.
*   **Role:** Raw ingestion layer. No transformations.

### 3.2 Silver Layer (Normalized & Cleaned)
*   **Role:** The stable, engineered layer. Data is cleaned, standardized (types cast, nulls handled), and normalized into dimensions and facts.
*   **Key Tables:**
    *   **Dimensions (`dim`):**
        *   `crm_dim_lead` (The core student profile)
        *   `crm_dim_user` (Counselors/Agents)
        *   `crm_dim_branch`, `crm_dim_school`, `crm_dim_city`
    *   **Facts (`fact`):**
        *   `crm_fact_product_opportunity` (Deals/Enrollment pipeline)
        *   `crm_fact_scholarship_opportunity` (Exam Registrations)
        *   `crm_fact_exam_attendance` & `crm_fact_exam_result`
        *   `crm_fact_call_log` (System-generated call metadata)
        *   `crm_fact_call_disposition` (Agent-submitted interaction forms)

### 3.3 Gold Layer (The CDP Output)
*   **Role:** The consumption layer for downstream tools (MoEngage, BI).
*   **Structure:** Two core schemas designed for "User + Event" models.

#### Table 1: `cdp_dim_user` (The Golden Record)
*   **Type:** Wide Table (One row per unique Student/Lead).
*   **Content:** Aggregated attributes and current state.
*   **Logic Strategy:** Flattening one-to-many relationships from Silver Facts into one-to-one attributes.
    *   *Example:* `current_stage` derived from the most recent Call Disposition or Product Opportunity update.

#### Table 2: `cdp_fact_events` (Immutable Actions)
*   **Type:** Event Stream (TimeSeries).
*   **Content:** Immutable actions that have occurred.
*   **Phase 1 Events:**
    *   **`call_log`**: Captures the system telemetry (properties: `duration`, `status`, `timestamp`).
    *   **`call_disposition`**: Captures the agent interaction (properties: `interaction_type`, `stage_update`, `notes`).
    *   *(Future Phase 2: `web_visit`, `email_clicked`, etc.)*

## 4. Key Logic & Definitions (TBD)

*This section will define the specific business logic for fields in the Gold Layer.*

*   **Lead vs. Student Identity:** Handling multiple leads per student.
*   **Attribute Priority:** Logic for deriving "Current" state from history.
*   **Contact Information:** Logic for `student_mobile` vs. `parent_mobile`.
