# Product Requirements Document (PRD): Aakash Internal CDP - Phase 1

| Attribute | Details |
| :--- | :--- |
| **Project Name** | Aakash Internal CDP |
| **Phase** | Phase 1 (CRM Foundation & Single Customer View) |
| **Owner** | Laksh Arora (Data Product Manager) |
| **Status** | **Final Draft** |
| **Source System** | Superleap CRM (Athena: `superleap-prod`) |

---

## 1. Executive Summary
We are building a proprietary, internal Customer Data Platform (CDP) to serve as the single source of truth for student profiles. The goal is to construct a **Single Customer View (SCV)** that unifies data from our CRM (**Superleap**).

## 2. Phase 1 Scope: The CRM Foundation

**In Scope:**
*   **Source:** Superleap CRM data only.
*   **Data Domain:** Leads/Students, Product Opportunities, Scholarship Opportunities (ANTHE, IAT, iACST), Call Logs, Call Dispositions.
*   **Output:** Gold Layer (`cdp_dim_user`, `cdp_fact_events`).

## 3. Data Architecture (Medallion Model)

### 3.1 Bronze Layer (Raw)
*   **Source:** `superleap-prod` database in Athena.
*   **Role:** Raw ingestion layer.

### 3.2 Silver Layer (Normalized & Cleaned)
*   **Role:** Cleaned, standardized, and normalized dimensions and facts.
*   **Transformation Rules:**
    *   **Casting:** Ensure correct data types (Dates, Integers, Decimals).
    *   **Cleaning:** Trim whitespace, Title Case names, clean non-numeric mobile numbers.
    *   **Null Handling:** Standardize `null`, `""`, `"null"` to SQL `NULL`.

#### Table 1: `crm_dim_lead`
*Base profile of the student/lead.*

| Field Name | Description | Logic / Transformation | Bronze Source |
| :--- | :--- | :--- | :--- |
| `lead_id` | PK. Unique Lead ID. | Cast to string. | `superleap_prod.lead.id` |
| `first_name` | Student First Name. | Trim, Title Case. | `superleap_prod.lead.first_name` |
| `last_name` | Student Last Name. | Trim, Title Case. | `superleap_prod.lead.last_name` |
| `father_name` | Father's Full Name. | Trim, Title Case. | `superleap_prod.lead.father_name_c` |
| `mother_name` | Mother's Full Name. | Trim, Title Case. | `superleap_prod.lead.mother_name_c` |
| `primary_mobile_number` | Primary Contact. | Clean non-numeric chars. | `superleap_prod.lead.primary_mobile_number__c` |
| `email` | Email Address. | Lowercase, Trim. | `superleap_prod.lead.email` |
| `dob` | Date of Birth. | Cast to Date (`yyyy-MM-dd`). | `superleap_prod.lead.date_of_birth_c` |
| `gender` | Gender. | Standardize values. | `superleap_prod.lead.gender_c` |
| `category` | Social Category. | Standardize (Gen/OBC/SC/ST). | `superleap_prod.lead.category_c` |
| `city` | Student City. | Title Case. | `superleap_prod.lead.city_c` |
| `state` | Student State. | Title Case. | `superleap_prod.lead.state_c` |
| `pincode` | Postal Code. | Cast to string. | `superleap_prod.lead.pincode_c` |
| `lead_source` | Source of Lead. | - | `superleap_prod.lead.source_c` |
| `lead_stage` | CRM Stage. | - | `superleap_prod.lead.stage` |
| `school_id` | Foreign Key to School. | - | `superleap_prod.lead.school_name_c` |
| `created_at` | Record Creation Time. | Cast to Timestamp. | `superleap_prod.lead.created_at` |
| `updated_at` | Record Update Time. | Cast to Timestamp. | `superleap_prod.lead.updated_at` |

#### Table 2: `crm_dim_school`
*Reference table for schools.*

| Field Name | Description | Logic / Transformation | Bronze Source |
| :--- | :--- | :--- | :--- |
| `school_id` | PK. | - | `superleap_prod.school.id` |
| `school_name` | Name of School. | - | `superleap_prod.school.name` |
| `school_city` | City of School. | - | `superleap_prod.school.city_c` |
| `exam_board` | Board (CBSE/ICSE). | - | `superleap_prod.school.board_c` |

#### Table 3: `crm_fact_product_opportunity`
*Business pipeline data (Potential or Converted Deals).*

| Field Name | Description | Logic / Transformation | Bronze Source |
| :--- | :--- | :--- | :--- |
| `opportunity_id` | PK. Unique Deal ID. | - | `superleap_prod.opportunity.id` |
| `lead_id` | FK to Student. | - | `superleap_prod.opportunity.lead_id` |
| `stage` | Sales Stage. | - | `superleap_prod.opportunity.stage_name` |
| `term` | Academic Term (e.g. 2526). | - | `superleap_prod.opportunity.term_c` |
| `class_going_to` | Target Class. | Cast to Int. | `superleap_prod.opportunity.class_studying_in_c` |
| `course_code` | Product Code. | - | `superleap_prod.opportunity.course_code_c` |
| `stream` | Stream (Med/Eng). | - | `superleap_prod.opportunity.stream_c` |
| `amount` | Deal Value. | Cast to Decimal. | `superleap_prod.opportunity.amount` |
| `created_at` | Created Date. | - | `superleap_prod.opportunity.created_at` |

#### Table 4: `crm_fact_scholarship_opportunity`
*Exam Registrations (ANTHE, IAT, iACST).*

| Field Name | Description | Logic / Transformation | Bronze Source |
| :--- | :--- | :--- | :--- |
| `scholarship_opp_id` | PK. | - | `superleap_prod.scholarship_opportunity.id` |
| `lead_id` | FK to Student. | - | `superleap_prod.scholarship_opportunity.lead_id` |
| `exam_type` | ANTHE / IAT / iACST. | Standardize (Upper Case). | `superleap_prod.scholarship_opportunity.exam_type_c` |
| `term` | Academic Term. | - | `superleap_prod.scholarship_opportunity.term_c` |
| `registration_date` | Date of Registration. | - | `superleap_prod.scholarship_opportunity.created_at` |
| `exam_date` | Date of Exam. | - | `superleap_prod.scholarship_opportunity.exam_date_c` |
| `is_attempted` | Did they take it? | Boolean. | `superleap_prod.scholarship_opportunity.is_attempted_c` |
| `scholarship_percent` | % Scholarship Won. | Decimal. | `superleap_prod.scholarship_opportunity.scholarship_percentage_c` |
| `roll_number` | Admit Card Roll No. | - | `superleap_prod.scholarship_opportunity.roll_number_c` |

#### Table 5: `crm_fact_call_log`
*System-generated telephony logs.*

| Field Name | Description | Logic / Transformation | Bronze Source |
| :--- | :--- | :--- | :--- |
| `call_id` | PK. | - | `superleap_prod.call_log.id` |
| `lead_id` | FK to Student. | - | `superleap_prod.call_log.lead_id` |
| `call_status` | Status (Connected, etc). | - | `superleap_prod.call_log.status` |
| `duration` | Duration in Seconds. | Int. | `superleap_prod.call_log.duration` |
| `call_time` | Start Time. | Timestamp. | `superleap_prod.call_log.start_time` |
| `agent_id` | FK to Agent. | - | `superleap_prod.call_log.owner_id` |

#### Table 6: `crm_fact_call_disposition`
*Agent-submitted interaction forms.*

| Field Name | Description | Logic / Transformation | Bronze Source |
| :--- | :--- | :--- | :--- |
| `disposition_id` | PK. | - | `superleap_prod.task.id` |
| `lead_id` | FK to Student. | - | `superleap_prod.task.who_id` |
| `disposition_code` | Outcome Code. | - | `superleap_prod.task.disposition_code_c` |
| `sub_disposition` | Detailed Reason. | - | `superleap_prod.task.sub_disposition_c` |
| `remarks` | Agent Notes. | Clean newlines. | `superleap_prod.task.description` |
| `interaction_date` | Submission Time. | Timestamp. | `superleap_prod.task.created_at` |

### 3.3 Gold Layer (The CDP Output)

#### Table 1: `cdp_dim_user` (The Golden Record)
*   **PK:** `user_id` (`lead_id` from Silver)
*   **Attributes:**
    *   **Profile:** Name, Mobile, City, State.
    *   **Academic:** `current_class` (Calculated using Product Opportunity + April 1st logic), `school_name`.
    *   **Scholarship Details:** Flattened columns for ANTHE, IAT, iACST.
        *   **Current Term iACST:** `attempt_1` (Earliest), `attempt_2` (Latest).
        *   **Previous Terms:** Single set of columns (Max Scholarship from Latest Year).

#### Table 2: `cdp_fact_events` (Immutable Actions)
*   **Type:** Event Stream (JSON Schema).
*   **Source:** Union of `crm_fact_call_log` and `crm_fact_call_disposition`.

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `event_id` | String | UUID. |
| `user_id` | String | FK to `cdp_dim_user`. |
| `event_name` | String | `call_log`, `call_disposition`. |
| `timestamp` | Timestamp | UTC Time of event. |
| `properties` | JSON | Event-specific details (Duration, Disposition Code, etc.). |

## 4. Key Logic (Recap)

### 4.1 "Current Class" Calculation
1.  **Product Start Year:** Extracted from `term` (e.g., "2627" -> 2026).
2.  **Current Academic Year:** Derived from Today's Date (Rollover: April 1st).
3.  **Calculation:** `Current_Class = class_going_to + (Current_Academic_Year - Product_Start_Year)`.
4.  **Clamp:** Max Class 13.

### 4.2 Scholarship Flattening (iACST)
*   **Current Term:** Columns for Attempt 1 (Earliest) and Attempt 2 (Latest).
*   **Previous Term:** Single set of columns. Logic: Select attempt from the most recent previous academic year. If multiple exist, pick the one with the highest scholarship percentage.
