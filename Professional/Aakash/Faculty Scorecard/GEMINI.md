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

*   **Task**: Build the V3 Faculty Scorecard data pipeline in AWS Athena.
*   **Status**: The project's core documentation (PRD and Technical Details) is now fully updated with the refined business logic, causality rules, and implementation plan. The foundational views (`date_params_vw`, `base_timetable_vw`, and `faculty_student_mapping_vw`) have been defined and documented.
*   **Next Step**: Begin creating the individual KPI base views, starting with `kpi_test_performance_base_vw`.

## Open Questions for V3

*   Detailed logic for faculty eligibility, student/batch mapping, and handling edge cases (no classes, no students, missing data).
*   Automated solution for identifying relevant test types and IDs.
*   Definitive logic for handling multiple student applications for ICE/retention.
*   Ensuring causality for survey data and other parameters.
*   (Future) UI/UX design for the V3 report on AakashGuru.
