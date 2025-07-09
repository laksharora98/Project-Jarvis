# Faculty Scorecard V3 - Technical Implementation Details

This document captures the technical details, SQL queries, and business logic implementation for the V3 Faculty Scorecard data pipeline in AWS Athena.

## 1. Athena Database & Global Parameters

*   **Database Name:** `faculty_scorecard_laksh`

### 1.1. Attribution Window Parameters
To handle the lagging effect of a faculty's influence, the following attribution windows are used. These are applied from the `mapping_end_date` of a `faculty-student` mapping.

*   `test_attribution_window`: **60** days
*   `feedback_attribution_window`: **90** days
*   `retention_attribution_window`: **90** days

## 2. Data Views & Logic

This section outlines the series of views that will be created to build the scorecard. The views should be created in the order they are listed, as they have dependencies on each other.

### 2.1. `date_params_vw` (Implemented)
**Purpose:** Defines the global start and end dates for the entire scorecard analysis in a reusable view.

```sql
CREATE OR REPLACE VIEW date_params_vw AS
SELECT
  CAST('2024-04-01' AS DATE) AS start_date,
  CAST('2025-03-31' AS DATE) AS end_date
```

### 2.2. `base_timetable_vw` (Implemented)
**Purpose:** Provides the foundational timetable data, including class details, student attendance, and faculty compliance flags.

```sql
CREATE OR REPLACE VIEW base_timetable_vw AS
WITH batch_time_table AS (SELECT DISTINCT id, batch_id FROM "phoenix-test_scheduling_service"."batch_time_table_archive_current_data")
SELECT DISTINCT t1.emplid psid,
REPLACE(REPLACE(t1.teacherid,'-'),'AESL') faculty_id,
DATE(t1.dt) class_date,
IF(t1.timespent > 0.0, 1, 0) is_present,
t1.batch_time_table_id,
trim(lower(t1.subject)) subject,
t2.batch_id,
t3.batch_name,
t4.academic_group_disp_val stream,
t5.business_unit,
t5.business_area_desc branch_name,
t5.state,
t5.region,
t5.type branch_type,
t5.sub_type branch_sub_type,
IF(t6.status='Marked',1,0) is_syllabus_compliance_marked,
IF(t6.attendance_status='Marked',1,0) is_class_attendance_marked
FROM "quicksight"."timetable_attendance_historical_data" t1
LEFT JOIN batch_time_table t2 ON t1.batch_time_table_id = t2.id
LEFT JOIN "phoenix-student_batch_service"."student_batch_vw" t3 ON t2.batch_id = t3.id
LEFT JOIN "phoenix-master_setup_service"."academic_group_master" t4 ON t3.academic_group = t4.id
LEFT JOIN "phoenix-master_setup_service"."branch_master_dataset" t5 ON t3.business_area = t5.id
LEFT JOIN "lcms"."lecture_status" t6 ON t1.batch_time_table_id = t6.lecture_id
WHERE t1.timetable_year >= '2024'
AND t1.batch_time_table_id IS NOT NULL
```

### 2.3. `eligible_faculty_hono_vw` (Implemented)

**Purpose:** This view provides a base list of all active faculty members from the HONO HR system who are eligible for the scorecard.

```sql
CREATE OR REPLACE VIEW eligible_faculty_hono_vw AS
SELECT
a.employee_id, a.employee_name, a.business_unit_hono, a.role, a.stream, a.subject, b.business_unit, b.business_area_desc, b.state, b.region, b.type branch_type, b.sub_type branch_sub_type
FROM (
SELECT employee_id,
full_name employee_name,
COALESCE(
MAP_FROM_ENTRIES(
ARRAY [('Academic Head - Medical Wing', 'Academic Head'),
('Academic Head - IIT Wing', 'Academic Head'),
('Academic Head - Foundations', 'Academic Head') ]
) [ role_name ],
role_name
) role,
MAP_FROM_ENTRIES(
ARRAY [('Medical', 'SOM'),
('Engineering', 'SOE'),
('Foundations', 'SOF'),
('Aakash Live - Medical', 'SOM'),
('Aakash Live - Engineering', 'SOE'),
('Aakash Live - Foundations', 'SOF') ]
) [ department ] stream,
COALESCE(
MAP_FROM_ENTRIES(
ARRAY [('mat', 'mental ability'),
('english & social science', 'social science') ]
) [ lower(sub_department) ],
lower(sub_department)
) subject,
business_unit business_unit_hono,
IF(cost_code = 'AKDGL','DG01',cost_code) cost_code
FROM "honoemployeedata"."hono_employee_data_vw"
WHERE status = 'Active'
AND sub_business_unit = 'Academics'
AND business_unit IN ('Class Room', 'Invictus', 'Digital', 'Franchise')
AND department IN (
'Medical',
'Engineering',
'Foundations',
'Aakash Live - Medical',
'Aakash Live - Engineering',
'Aakash Live - Foundations'
)
AND role_name IN (
'Faculty',
'Academic Head - Medical Wing',
'Academic Head - IIT Wing',
'Academic Head - Foundations'
)
) a LEFT JOIN "phoenix-master_setup_service".branch_master_dataset b ON a.cost_code = b.sap_business_area
WHERE b.business_unit IS NOT NULL
```

### 2.4. `faculty_student_mapping_vw` (Implemented)
**Purpose:** This is the core mapping view. It identifies every student a faculty taught for a specific subject, establishing the precise `mapping_start_date` and `mapping_end_date` for each contiguous teaching block. This view is the foundation for ensuring causality.

It first filters for faculty who have taught more than 25% of a student's classes for a given subject, and then calculates the contiguous teaching blocks for those eligible mappings.

```sql
CREATE OR REPLACE VIEW faculty_student_mapping_vw AS
WITH
  -- 1. Calculate the total number of classes a student took for each subject
  student_subject_total_classes AS (
    SELECT
      psid,
      subject,
      COUNT(DISTINCT class_date) AS total_student_subject_classes
    FROM
      base_timetable_vw,
      date_params_vw
    WHERE
      class_date BETWEEN date_params_vw.start_date AND date_params_vw.end_date
    GROUP BY
      psid,
      subject
  ),
  -- 2. Calculate the number of classes a specific faculty taught a student for each subject
  faculty_student_subject_classes AS (
    SELECT
      faculty_id,
      psid,
      subject,
      COUNT(DISTINCT class_date) AS faculty_student_subject_classes
    FROM
      base_timetable_vw,
      date_params_vw
    WHERE
      class_date BETWEEN date_params_vw.start_date AND date_params_vw.end_date
    GROUP BY
      faculty_id,
      psid,
      subject
  ),
  -- 3. Determine the eligible mappings where a faculty taught > 25% of a student's classes for a subject
  eligible_mappings AS (
    SELECT
      f.faculty_id,
      f.psid,
      f.subject
    FROM
      faculty_student_subject_classes AS f
      INNER JOIN student_subject_total_classes AS s ON f.psid = s.psid AND f.subject = s.subject
    WHERE
      (
        CAST(f.faculty_student_subject_classes AS DOUBLE) / s.total_student_subject_classes
      ) > 0.25
  ),
  -- 4. For eligible mappings, get all class dates and calculate the gap from the previous class
  session_gaps AS (
    SELECT
      b.faculty_id,
      b.psid,
      b.subject,
      b.class_date,
      LAG(b.class_date, 1, b.class_date) OVER (
        PARTITION BY
          b.faculty_id,
          b.psid,
          b.subject
        ORDER BY
          b.class_date
      ) AS prev_class_date
    FROM
      base_timetable_vw AS b
      INNER JOIN eligible_mappings AS em ON b.faculty_id = em.faculty_id
      AND b.psid = em.psid
      AND b.subject = em.subject
  ),
  -- 5. Identify each contiguous teaching block by marking gaps > 30 days as a new session
  session_identifiers AS (
    SELECT
      *,
      SUM(
        CASE
          WHEN DATE_DIFF('day', prev_class_date, class_date) > 30 THEN 1
          ELSE 0
        END
      ) OVER (
        PARTITION BY
          faculty_id,
          psid,
          subject
        ORDER BY
          class_date
      ) AS session_id
    FROM
      session_gaps
  )
-- 6. Final step: Group by the session identifier to get the start and end date for each contiguous block
SELECT
  faculty_id,
  psid,
  subject,
  MIN(class_date) AS mapping_start_date,
  MAX(class_date) AS mapping_end_date,
  COUNT(*) AS num_classes_in_session
FROM
  session_identifiers
GROUP BY
  faculty_id,
  psid,
  subject,
  session_id
```

### 2.5. Base KPI Views (Planned)
A series of intermediate views will be created, one for each KPI, joining the raw data with the `faculty_student_mapping_vw` to apply the causality and attribution window logic.
*   `kpi_test_performance_base_vw`
*   `kpi_student_attendance_base_vw`
*   `kpi_test_attendance_base_vw`
*   `kpi_compliance_base_vw`
*   `kpi_feedback_base_vw`
*   `kpi_retention_leftout_base_vw`
*   `kpi_retention_ice_base_vw`

### 2.6. Final Scorecard View (Planned)
**Purpose:** This view will aggregate the results from all the base KPI views to calculate the final weighted score for each faculty member.

**Reporting Grain and Filtering Strategy:** The final output will be structured to have **one row per faculty per unique attribute value** (e.g., `subject`, `business_unit`). This means if a faculty teaches two subjects, they will have two rows in this view with identical KPI scores but different subject values. This duplication is intentional and designed to allow for easy, direct filtering in the BI tool (e.g., Quicksight).

The view will join the calculated KPI scores back to the `eligible_faculty_hono_vw` to produce the final, filterable leaderboard.
