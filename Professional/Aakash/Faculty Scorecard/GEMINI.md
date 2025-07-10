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

## Current Focus: V3 Implementation

*   **Task**: Refine and enhance the V3 Faculty Scorecard data pipeline logic in AWS Athena.
*   **Status**: The core SQL logic in `Faculty_Scorecard_V3_Implementation_Details.md` has been significantly enhanced to ensure fairer and more statistically robust scoring. Key improvements include:
    *   **Percentile-Based Scoring:** Switched from raw scores to percentile ranks to normalize KPIs with different natural ranges.
    *   **Minimum Data Thresholds:** Implemented rules to nullify KPI scores that don't have enough underlying data.
    *   **Group-Based Normalization:** Applied stream-specific (e.g., SOM, SOE) ranking for retention and conversion KPIs to ensure fairer peer-to-peer comparisons.
    *   All related documentation (`Faculty_Scorecard_PRD.md`, `kpi_definitions_for_business_users.md`) has been updated to reflect these changes.
*   **Next Step**: Paused. The enhanced SQL scripts are ready for final review and execution in AWS Athena.

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
