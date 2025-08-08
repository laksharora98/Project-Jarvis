# Scholarship Tests

## Business Objective

This area focuses on tracking and analyzing the participation and performance of prospective students in scholarship tests. The primary goal is to measure the effectiveness of these tests as a tool for student acquisition and to identify high-potential candidates early in the admissions funnel.

## Key Processes

1.  **Registration**: Prospective students register for scholarship tests via various channels, and this data is captured in **Salesforce**.
2.  **Test Administration**: The tests are administered on the external **Vyom** platform.
3.  **Attendance & Performance Tracking**: Data from Salesforce (registrations) is joined with data from Vyom (test attempts) to create a complete picture of who registered, who attended, and how they performed.

## Key Data Assets

*   **[salesforceanalytics.exam_registration](../Data%20Assets/Tables/exam_registration.md)**: The source of truth for test registrations.
*   **[testplayer.test_attempt_combined_including_missed_including_non_myaakash_vw](../Data%20Assets/Tables/test_attempt_combined_vw.md)**: The source of truth for test attempts and scores.

## Detailed Business Logic

The process of tracking scholarship test attendance is based on a set of specific, hardcoded business rules:

1.  **Join Logic**: The final report is created by performing a `LEFT JOIN` from the registration data to the test attempt data. This ensures all registered students are included, and those who did not attempt the test can be identified. The join keys are the student's roll number and a constructed `paper_type` field.

2.  **Year-Specific Test Expectations**: The number and type of tests a student is expected to take depends on the year of registration:
    *   **2024**: Students are expected to take two tests: `paper-1` and `paper-2`.
    *   **2025**: Students are expected to take three tests: `JEE Main`, `JEE Advanced Paper 1`, and `JEE Advanced Paper 2`.

3.  **Registration Cutoff**: A specific registration deadline is enforced. For example, for the 2025 'JEE Main' test, any student registering after 9:00 AM on July 21, 2025, is not considered scheduled for that specific test.
