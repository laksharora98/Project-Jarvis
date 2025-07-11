# Faculty Scorecard Project

This document outlines the Product Requirements Document (PRD) for the Faculty Scorecard project at Aakash Educational Services Limited.

## Project Overview

The Faculty Scorecard project aims to build a comprehensive leaderboard for all faculty at Aakash. This leaderboard will be based on data gathered from various sources, with parameters and their weightages to be defined. The project will also involve defining the calculation logic for each parameter's score and building a reporting mechanism for users to access the leaderboard and raw data.

## Primary Objectives

*   Improve overall faculty performance.
*   Identify top performers for recognition and other initiatives.
*   Pinpoint areas where training and development might be beneficial.

## Primary Users

*   **Senior Management**: To derive key decisions and insights for strategic planning and operational oversight.
*   **HR**: To assist in performance reviews, talent management, training and development, and compensation.

## Technical Stack

*   **Data Lake**: AWS (Athena, Glue, etc.)
*   **Reporting**: AWS Quicksight

## Key Considerations

*   **KRAs & KPIs**: Academic effectiveness and initiative, Student Retention, Compliance, Feedback.
*   **Data Sources**: Various internal systems (e.g., AakashGuru, Vyom, Scoretool, Phoenix, HONO, MyAakash, RFID, MS Teams, Crystal, Google Form).
*   **Delivery Platform**: AWS Quicksight.

## Detailed Documentation

*   [Faculty_Scorecard_PRD.md](./Faculty_Scorecard_PRD.md): The official Product Requirements Document for the V3 project.
*   [Faculty_Scorecard_V3_Implementation_Details.md](./Faculty_Scorecard_V3_Implementation_Details.md): The technical implementation log for the V3 data pipeline.
*   [faculty_scorecard_detailed_logic.md](./faculty_scorecard_detailed_logic.md): A non-technical explainer of the complete business logic.
*   [kpi_definitions_for_business_users.md](./kpi_definitions_for_business_users.md): A high-level guide to the KPIs for a business audience.
*   [quicksight_summary.txt](./quicksight_summary.txt): A brief summary for the Quicksight report.

## Current Focus: V3 Implementation

*   **Task**: Document and refine the V3 Faculty Scorecard data pipeline logic.
*   **Status**: The project's documentation has been significantly updated and aligned with the current implementation. Key logic points have been clarified:
    *   **Stream-based ranking** is now correctly applied to Test Attendance, Retention, and Conversion KPIs.
    *   The **scorecard period** has been updated to July 10, 2024 - July 9, 2025.
    *   The **null score logic** has been corrected: if any KPI score is null, the faculty's final score and rank are also null, with no weight redistribution.
    *   A new, detailed, non-technical business logic explainer has been created.
*   **Next Step**: Paused. All documentation is up-to-date. The project is ready for the next phase of review or implementation.

## Open Questions for V3

*   Detailed logic for faculty eligibility, student/batch mapping, and handling edge cases (no classes, no students, missing data).
*   Automated solution for identifying relevant test types and IDs.
*   Definitive logic for handling multiple student applications for ICE/retention.
*   Ensuring causality for survey data and other parameters.
*   (Future) UI/UX design for the V3 report on AakashGuru.

## Future Enhancements: Deep-Dive Dashboards

To provide transparency and allow users to understand the "why" behind their scores, a tiered deep-dive dashboard will be implemented in Quicksight. This will be done in a phased approach.

### Level 1: The "Calculation Summary" View
This view will be the first level of drill-down and will show the direct inputs for each KPI calculation. It will display the numerator and denominator for each metric, providing a clear and concise summary of how the final scores were derived.

*   **Source:** `final_scorecard_vw`
*   **Implementation:** A new tab in the existing Quicksight report.

### Level 2: The "Attributed Raw Data" View
This will be a separate, linked dashboard providing granular, student-level data for each KPI. The data will be contextualized and anonymized where necessary to protect student privacy.

*   **Foundational View:** A roster of all students mapped to the faculty (`faculty_student_mapping_vw`).
*   **KPI-Specific Views:**
    *   **Test Performance/Attendance:** A list of all attributed tests, showing student scores vs. the national average (`kpi_test_performance_base_vw`, `kpi_test_attendance_base_vw`).
    *   **Compliance:** A list of all delivered lectures with their compliance marking status (`kpi_compliance_base_vw`).
    *   **Retention/Conversion:** A list of mapped students with their final status (Retained, Left Out, Converted) (`kpi_retention_leftout_base_vw`, `kpi_retention_ice_base_vw`).
    *   **Feedback:** An anonymized list of feedback ratings (`kpi_feedback_base_vw`).
*   **Implementation:** A separate, linked Quicksight dashboard with tabs for each KPI category.

This enhancement will be prioritized after the initial launch of the main scorecard.

## Implementation Notes

*   **Test Selection:** The scorecard does not use all available tests. A manually curated table, `tests_considered`, is used to filter for specific tests. This list was created by identifying relevant test types for each stream as per the PRD. While this approach covers over 50% of all test attempts, it omits tests with missing or unclear `test_type` metadata. This detail is intentionally excluded from the business-facing documentation for now and will be addressed in a future communication with stakeholders, where the list will be provided for review and expansion.
