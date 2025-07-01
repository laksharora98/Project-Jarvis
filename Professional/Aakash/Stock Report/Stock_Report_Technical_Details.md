# Stock Report Technical Details

This document contains the technical details for the Stock Report project, including datasets, SQL queries, and other relevant information.

## Sheet 2: Custom Issuance Stock Report

*   **Frontend PDF:** [RCC Sheet 2.pdf](./quicksight-exports/dashboard/RCC%20Sheet%202.pdf)
*   **Dataset SQL:** [custom_issuance_stock_report.txt](./quicksight-exports/datasets/custom_issuance_stock_report.txt)

### Business Logic

This sheet provides a detailed view of stock issuance to students based on their course enrollment. It is designed to show which study materials have been issued and which are still pending for each student.

The core logic revolves around identifying students who are eligible for materials and then checking the status of those materials.

### Data Sources

The query utilizes data from the following schemas in AWS Athena:

*   `phoenix-enrollment_service`
*   `phoenix-master_setup_service`
*   `phoenix-student_batch_service`
*   `phoenix_pricing_service`

### Query Breakdown

1.  **Student Selection:** The query starts by selecting students from `phoenix-enrollment_service.student_application_details`. It specifically filters for students whose `program_action` is one of 'MATR', 'BTCG', or 'RADM'. This ensures that only students who are actively enrolled, have changed batches, or have been readmitted are included.

2.  **Course and Material Mapping:**
    *   It joins with `phoenix-master_setup_service.associated_attribute`, `phoenix-master_setup_service.course_attribute_master`, and `phoenix-master_setup_service.course_attribute_value_master` to link students to their specific course attributes. It filters for the 'CORP' attribute.
    *   It then joins with `phoenix-enrollment_service.material_master` to determine the specific `material_id` and `material_description` associated with the student's course attribute.

3.  **Batch Information:** The query joins with `phoenix-student_batch_service.student_batch` to retrieve the `primary_batch` and `secondary_batch` names.

4.  **Region Information:** It joins with `phoenix-master_setup_service.business_area_master`, `phoenix-master_setup_service.business_area_region_master`, and `phoenix-master_setup_service.region_master` to get the student's geographical region.

5.  **Stock Issuance Status:**
    *   The key join is a `LEFT JOIN` with the `phoenix-enrollment_service.stock_transaction_aud` table. This table logs all stock issuance transactions.
    *   The join is performed on `psid`, `application_id`, and `material_number`.
    *   A `CASE` statement then determines the `is_issued` status:
        *   If a `transaction_id` exists, the `status` is 'SUCCESS', and there is no `return_transaction_id`, the material is marked as **'Issued'**.
        *   Otherwise, it is marked as **'Not Issued'**.

6.  **Final Filtering:**
    *   The final result is filtered to only include students who have either a `primary_batch` or a `secondary_batch` assigned.
    *   It also filters for `term_value` to only include current and future academic years.

## Sheet 3: Student Profile

*   **Frontend PDF:** [RCC Sheet 3.pdf](./quicksight-exports/dashboard/RCC%20Sheet%203.pdf)
*   **Dataset SQL:** [student_profile_stock_issuance_dashboard.txt](./quicksight-exports/datasets/student_profile_stock_issuance_dashboard.txt)

### Business Logic

This sheet provides a high-level overview of all enrolled students in Regular Classroom Courses (RCC). It serves as a master list of students and their current academic status. The main metric is the "Total Enroll Student" count.

### Data Sources

The query pulls data from a mix of Phoenix, PeopleSoft, and other internal systems:

*   `phoenix-enrollment_service` (Phoenix)
*   `phoenix-student_batch_service` (Phoenix)
*   `phoenix-master_setup_service` (Phoenix)
*   `phoenix_pricing_service` (Phoenix)
*   `pserp-curriculum-management` (PeopleSoft)
*   `csprod` (PeopleSoft)

### Query Breakdown

1.  **Student and Course Details:** The query starts with `phoenix-enrollment_service.student_application_details` and enriches it with `course_title` from `phoenix-master_setup_service.course_catalog_course_detail` and batch information from `phoenix-student_batch_service.student_batch`.

2.  **Academic Career Filter:** A key filter is applied by joining with `phoenix-master_setup_service.academic_career_master` to select only students where the `academic_career_disp_val` is **'RCC'**.

3.  **Date and Payment Information:**
    *   `course_start_date` and `course_end_date` are retrieved from `phoenix_pricing_service.course_fees_processing_approval`.
    *   `aes_last_payment_dt` (last payment date) is retrieved from the PeopleSoft table `csprod.ps_aes_studentoneview`.

4.  **Student Status Flags:** The query uses `CASE` statements to create flags that categorize students based on their `program_action` and batch assignment:
    *   `active_student`: Flagged if `program_action` is 'MATR', 'RADM', 'FOLO', or 'BTCG'.
    *   `eligible_student`: Flagged if `program_action` is 'MATR', 'RADM', or 'BTCG' AND they are assigned to a primary or secondary batch.
    *   `ineligible_student`: Flagged if `program_action` is 'FOLO', or if they are 'MATR', 'RADM', or 'BTCG' but have no batch assigned.

5.  **Final Filtering:** The results are filtered to include only terms from the current and upcoming academic years.

## Sheet 4: Material Issue Report

*   **Frontend PDF:** [RCC Sheet 4.pdf](./quicksight-exports/dashboard/RCC%20Sheet%204.pdf)
*   **Dataset SQL:** [matrial_issue_report_stock_issuance_report.txt](./quicksight-exports/datasets/matrial_issue_report_stock_issuance_report.txt)

### Business Logic

This sheet provides a detailed, transaction-level audit log of all successful material movements (issuances and returns) for students in Regular Classroom Courses (RCC). Unlike other sheets, this report's primary source is the `stock_transaction_aud` table, making it a log of actual stock events.

### Data Sources

*   `phoenix-enrollment_service` (Phoenix)
*   `phoenix-student_batch_service` (Phoenix)
*   `phoenix-master_setup_service` (Phoenix)
*   `phoenix_pricing_service` (Phoenix)
*   `pserp-curriculum-management` (PeopleSoft)
*   `csprod` (PeopleSoft)
*   `phoenix-authentication_service` (Phoenix)

### Query Breakdown

1.  **Transaction Selection:** The query starts by selecting records directly from `phoenix-enrollment_service.stock_transaction_aud`. It immediately filters for:
    *   `academic_career_value = 'RCC'`
    *   `STATUS = 'SUCCESS'`
    *   `type` is either 'PSID_ISSUANCE' or 'PSID_RETURN'.

2.  **Data Enrichment:** The base transaction data is then enriched by joining with various tables to provide context:
    *   `material_master` to determine if a material is 'Bar-Coded' or 'Non Bar-Coded'.
    *   `student_application_details` to fetch student information like `Stream` and `student_name`.
    *   `user_profile` from the `phoenix-authentication_service` to get the full name of the user who performed the transaction.
    *   Other tables are joined to provide course, batch, region, and date information, similar to the other sheets.

3.  **Calculated Fields:**
    *   `Material_type`: Classifies materials as 'Bar-Coded' or 'Non Bar-Coded'.
    *   `materialnumberstartwith9`: A custom flag for materials with an ID starting with '9', based on a business requirement.
    *   `Transaction_by_name`: Shows the name of the employee who executed the stock transaction.

4.  **Final Filtering:** The results are filtered to include only transactions for the current and upcoming academic years based on the `term_value`.

## Sheet 5: Branch Consumption

*   **Frontend PDF:** [RCC Sheet 5.pdf](./quicksight-exports/dashboard/RCC%20Sheet%205.pdf)
*   **Dataset SQL:** [branch_consumption.txt](./quicksight-exports/datasets/branch_consumption.txt)

### Business Logic

This sheet tracks all successful stock transactions that are not related to students, but rather to internal branch operations. It provides a log of materials issued to and returned by Aakash branches.

### Data Sources

*   `phoenix-enrollment_service` (Phoenix)
*   `phoenix-master_setup_service` (Phoenix)
*   `phoenix-authentication_service` (Phoenix)

### Query Breakdown

1.  **Transaction Selection:** The query's foundation is the `phoenix-enrollment_service.stock_transaction_aud` table. It is filtered to only include transactions where:
    *   `type` is 'BRANCH_ISSUANCE' or 'BRANCH_RETURN'.
    *   `STATUS` is 'SUCCESS'.

2.  **Data Enrichment:**
    *   The query joins with `phoenix-authentication_service.user_profile` to identify the `Employee_Name` who performed the transaction.
    *   It joins with `phoenix-master_setup_service.business_area_master` and related tables to get the full `Branch`, `Region`, and `Branch Type` details.
    *   Contextual information about the material is added by joining with `phoenix-enrollment_service.material_master`.

3.  **Key Focus:** The main purpose of this query is to isolate branch-related stock movements from the student-related transactions, providing a clear view of internal stock consumption.

## Sheet 6: Net Stock Inventory

*   **Frontend PDF:** [RCC Sheet 6.pdf](./quicksight-exports/dashboard/RCC%20Sheet%206.pdf)
*   **Dataset SQL:** [Net_stock_inventory_rcc_detailed_view.txt](./quicksight-exports/datasets/Net_stock_inventory_rcc_detailed_view.txt)

### Business Logic

This sheet provides a detailed, item-level snapshot of the current, physical inventory available at each Aakash branch. Each row represents a single, unique, barcoded item that is ready for use.

### Data Sources

*   `phoenix-master_setup_service` (Phoenix)
*   `phoenix-enrollment_service` (Phoenix)

### Query Breakdown

1.  **Inventory Selection:** The core of the query is the `phoenix-enrollment_service.material_grn_numbers` table (GRN: Goods Received Note). This table contains a record for each individual item that has entered the inventory.

2.  **Key Filters:** The query selects records from the GRN table based on the following criteria, which together define "net available stock":
    *   `is_deleted = 0`: The record is active.
    *   `STATUS = 'ACTIVE'`: The item is active in the system.
    *   `is_consumed = 0`: The item has not been used or issued.

3.  **Location and Material Details:**
    *   The query joins with `phoenix-master_setup_service.business_area_master` to get the branch details where the stock is located.
    *   It joins with `phoenix-enrollment_service.material_master` to get the `material_description` and to classify the item as 'Bar-Coded' or 'Non Bar-Coded'.

4.  **Result:** The final output is a list of all individual, unconsumed items currently held in inventory across all branches.

## Sheet 7: Miscellaneous Course Stock Issuance

*   **Frontend PDF:** [RCC Sheet 7.pdf](./quicksight-exports/dashboard/RCC%20Sheet%207.pdf)
*   **Dataset SQL:** [RCC_Miscellaneous_course_Stock_issuance.txt](./quicksight-exports/datasets/RCC_Miscellaneous_course_Stock_issuance.txt)

### Business Logic

This sheet tracks the issuance of materials for "Miscellaneous Courses," which are typically used for charges like replacement ID cards, duplicate bags, etc. It links a payment transaction (receipt) for a miscellaneous item to a stock issuance event and connects it back to the student's primary course.

### Data Sources

*   `intern_hands_on` (Intermediate Schema)
*   `psquery_derived_tables` (PeopleSoft Derived)
*   `phoenix-enrollment_service` (Phoenix)
*   `phoenix-master_setup_service` (Phoenix)
*   `pserp-curriculum-management` (PeopleSoft)

### Query Breakdown

1.  **Payment Transaction:** The query starts from the PeopleSoft table `"intern_hands_on".PS_AES_STDNT_DTL3`, which contains student payment details. This identifies the initial financial transaction for the miscellaneous item.

2.  **Miscellaneous Course Mapping:** It then joins with `phoenix-enrollment_service.miscellaneous_course_mapping` and `miscellaneous_course_material_mapping` to identify that the payment was for a designated miscellaneous course.

3.  **Linking to Stock Issuance:** A `LEFT JOIN` to `phoenix-enrollment_service.stock_transaction_aud` on the `receipt_id` connects the payment to a specific stock issuance or return event.

4.  **Linking to Regular Course:** The query uses the `"psquery_derived_tables"."ps_aes_stdnt_tbl5"` table to link the student (`emplid`) and the miscellaneous course (`crse_id`) back to their original, regular course (`crse_id_ext`).

5.  **Result:** The final output shows a trail from a miscellaneous payment to the material that was issued and the student's primary course, providing a complete picture for these ad-hoc transactions.

## Sheet 8: Failed Stock Transactions

*   **Frontend PDF:** [RCC Sheet 8.pdf](./quicksight-exports/dashboard/RCC%20Sheet%208.pdf)
*   **Dataset SQL:** [RCC FAILED STOCK.txt](./quicksight-exports/datasets/RCC%20FAILED%20STOCK.txt)

### Business Logic

This sheet serves as an error log for stock transactions related to Regular Classroom Courses (RCC). It captures all issuance or return attempts that did not succeed, allowing for investigation and troubleshooting.

### Data Sources

This query uses the same extensive set of Phoenix and PeopleSoft tables as the successful transaction report (Sheet 4) to provide full context for the failed event.

### Query Breakdown

1.  **Transaction Selection:** The query starts with the `phoenix-enrollment_service.stock_transaction_aud` table. The crucial difference is the filter condition:
    *   `academic_career_value = 'RCC'`
    *   `STATUS = 'FAILED'`

2.  **Data Enrichment:** The query then joins with all the necessary tables (`student_application_details`, `course_catalog_course_detail`, `user_profile`, etc.) to provide a complete picture of the transaction at the time of failure, including student, course, material, and user details.

3.  **Purpose:** The goal is to provide a comprehensive view of failed transactions to help identify the root cause, whether it be a data issue, a system error, or a process problem. The "Failure Reason" filter on the dashboard would be used to narrow down specific errors.