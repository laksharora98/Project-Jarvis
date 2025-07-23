# Vyom Scholarship Tests

This project is dedicated to tracking and analyzing the attendance and performance of students who take scholarship tests on the Vyom test platform.

The primary goal is to provide a clear view of test participation for students who are not yet enrolled at Aakash. The data originates from Salesforce (for registrations) and the Vyom test player (for attempt details).

## Key Components

*   **Data Source (Registration):** `salesforceanalytics.exam_registration` - Contains records of students who register for the tests.
*   **Data Source (Attempts):** `testplayer.*` schemas - Contains the raw data about test attempts, scores, and schedules from the Vyom platform.
*   **Reporting:** The SQL queries in this project are designed to be used in AWS Athena to create datasets for Quicksight dashboards.

## Current Focus

*   **Task**: Develop and refine the master SQL query for the scholarship test attendance report.
*   **Status**: The query has been successfully developed, tested, and finalized. It now handles both 2024 and 2025 test logic and sources data from the correct views.
*   **Next Step**: Paused. The query is ready for use.
