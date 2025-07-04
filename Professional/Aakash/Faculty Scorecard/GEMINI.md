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
*   **Delivery Platform**: AakashGuru (primary), Looker (backup).

## Detailed Documentation

*   **Faculty_Scorecard_PRD.md**: This document serves as the comprehensive Product Requirements Document (PRD) for the Faculty Scorecard project, containing all relevant details including KRAs, KPIs, data sources, weightages, and various considerations.

## Current Focus: V3 Logic Definition

*   **Task**: Solidify the business logic for the V3 Faculty Scorecard.
*   **Status**: The KPIs and metrics outlined in the PRD are the correct goal for V3. However, the UI and visuals described in the PRD are from the V2 report and will be redesigned. The UI discussion is deferred until the core logic is finalized.
*   **Next Step**: Address the open questions from the V2 analysis to define the V3 logic, starting with Faculty & Student Mapping.

## Open Questions for V3

*   Detailed logic for faculty eligibility, student/batch mapping, and handling edge cases (no classes, no students, missing data).
*   Automated solution for identifying relevant test types and IDs.
*   Definitive logic for handling multiple student applications for ICE/retention.
*   Ensuring causality for survey data and other parameters.
*   (Future) UI/UX design for the V3 report on AakashGuru.
