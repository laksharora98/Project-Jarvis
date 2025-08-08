# salesforceanalytics.exam_registration

## Description

This table contains the registration records for students signing up for various exams, particularly scholarship tests. The data originates from Salesforce and is a key source for identifying the population of prospective students who are scheduled to take a test.

## Source System

*   **Salesforce**

## Key Columns (as seen in usage)

*   `id`: The unique registration identifier (PK).
*   `aesl_roll_no__c`: The student's roll number.
*   `aesl_first_name__c`: Student's first name.
*   `aesl_last_name__c`: Student's last name.
*   `aesl_branch_code__c`: The branch code associated with the registration.
*   `createddate`: The timestamp when the registration was created.
*   `aesl_lead_type__c`: The type of lead (e.g., 'MOCK-JEE').
*   `isdeleted`: A flag to indicate if the record is deleted.

## Business Logic & Transformations

When used in the scholarship test attendance report, several important transformations and business rules are applied to this table:

*   **Lead Type Filter**: Only records where `aesl_lead_type__c = 'MOCK-JEE'` are included.
*   **Deduplication**: Only the most recently modified record for each registration `id` is used, ensuring data is current.
*   **Timezone Conversion**: The `createddate` field is converted from UTC to IST (by adding 330 minutes) for accurate reporting.
*   **Business Unit Mapping**: The `business_unit` identifier is not used directly. It is constructed from the `aesl_branch_code__c` using the formula: `CONCAT(SUBSTRING(aesl_branch_code__c, 4, 2), SUBSTRING(aesl_branch_code__c, 1, 3))`.
*   **Master List Creation**: This table is used as the foundational "master list" of all students who should have taken a test. It is then `LEFT JOIN`ed with the test attempt data.
