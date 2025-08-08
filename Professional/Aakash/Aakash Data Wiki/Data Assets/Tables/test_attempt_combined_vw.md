# testplayer.test_attempt_combined_including_missed_including_non_myaakash_vw

## Description

This view provides a comprehensive record of all test attempts made by students on the **Vyom** test platform. It is a crucial source for analyzing student performance and attendance in scholarship tests. The `non_myaakash` part of the name suggests it specifically includes data for students who are not yet enrolled in Aakash's internal systems.

## Source System

*   **Vyom**

## Key Columns (as seen in usage)

*   `psid`: The student's identifier, used to join with `aesl_roll_no__c` from Salesforce data.
*   `test_id`: The unique identifier for the test.
*   `state`: The status of the test attempt (e.g., Completed).
*   `ex_start_time`: The timestamp when the student started the exam.
*   `total_score`: The final score achieved by the student.
*   `rank`: The student's rank in the test.

## Business Logic & Transformations

When used in the scholarship test attendance report, this view is filtered and transformed based on the following rules:

*   **Hardcoded Test Filter**: The view is filtered to include only a specific, hardcoded list of `test_id`s. This list represents the exact scholarship tests that are relevant for the report.
    *   **2024 Tests**: 'M1205FTOG2RT0101', 'M1905FTOG2RT0201', 'M1205FTOG2RT0102', 'M1905FTOG2RT0202'
    *   **2025 Tests**: 'INVICTUS2007MAIN01', 'INVICTUS2007MAIN02', 'INVICTUS2707ADV001', 'INVICTUS2707ADV101', 'INVICTUS2707ADV002', 'INVICTUS2707ADV102'

*   **Test ID to Paper Type Mapping**: A `CASE` statement is used to translate the technical `test_id` into a human-readable `paper_type` which is used to join back to the registration data. For example:
    *   `M1205FTOG2RT0101` -> `paper-1`
    *   `INVICTUS2007MAIN01` -> `JEE Main`

*   **Attendance Source**: This view is the source of truth for test attempts. It is joined to the master registration list to determine if a student was present or absent.
