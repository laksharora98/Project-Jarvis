# Faculty Scorecard V3 - Technical Implementation Details

This document captures the technical details, SQL queries, and business logic implementation for the V3 Faculty Scorecard data pipeline in AWS Athena.

## 1. Athena Database & Global Parameters

*   **Database Name:** `faculty_scorecard_laksh`

### 1.1. Attribution Window Parameters
To handle the lagging effect of a faculty's influence, the following attribution windows are used. These are applied from the `mapping_end_date` of a `faculty-student` mapping.

*   `test_attribution_window`: **60** days
*   `feedback_attribution_window`: **30** days
*   `retention_attribution_window`: **90** days

## 2. Data Views & Logic

This section outlines the series of views that will be created to build the scorecard. The views should be created in the order they are listed, as they have dependencies on each other.

### 2.1. `date_params_vw` (Implemented)
**Purpose:** Defines the global start and end dates for the entire scorecard analysis in a reusable view.

```sql
CREATE OR REPLACE VIEW date_params_vw AS
SELECT
  CAST('2024-07-10' AS DATE) AS start_date,
  CAST('2025-07-09' AS DATE) AS end_date
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

It first filters for faculty who have taught more than 25% of a student's classes for a given subject and more than 8 classes, and then calculates the contiguous teaching blocks for those eligible mappings.

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
      AND f.faculty_student_subject_classes > 8
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

### 2.5. `unified_test_attempts_vw` (Implemented)
**Purpose:** Creates a single, standardized view of all student test attempts by unpivoting the source data. This view serves as the foundational data for the Test Performance KPI.

```sql
CREATE OR REPLACE VIEW unified_test_attempts_vw AS
WITH
  t AS (
    SELECT
      t1.test_digit_id test_id,
      t1.psid,
      DATE(t1.ex_start_time) test_date,
      t1.physics,
      t1.chemistry,
      t1.mathematics,
      t1.botany,
      t1.zoology,
      t1.english,
      t1.biology,
      t1.science,
      t1.mental_ability,
      t1.social_science
    FROM
      "testplayer"."test_attempt_combined_including_missed_vw" t1
      INNER JOIN "faculty_scorecard_laksh"."tests_considered" t2 ON t1.test_digit_id = t2.test_digit_id
    WHERE
      t1.is_latest_live_attempt
  ),
  main AS (
    SELECT test_id, psid, test_date, 'physics' subject, physics score FROM t WHERE physics IS NOT NULL
    UNION ALL
    SELECT test_id, psid, test_date, 'chemistry' subject, chemistry score FROM t WHERE chemistry IS NOT NULL
    UNION ALL
    SELECT test_id, psid, test_date, 'mathematics' subject, mathematics score FROM t WHERE mathematics IS NOT NULL
    UNION ALL
    SELECT test_id, psid, test_date, 'botany' subject, botany score FROM t WHERE botany IS NOT NULL
    UNION ALL
    SELECT test_id, psid, test_date, 'zoology' subject, zoology score FROM t WHERE zoology IS NOT NULL
    UNION ALL
    SELECT test_id, psid, test_date, 'english' subject, english score FROM t WHERE english IS NOT NULL
    UNION ALL
    SELECT test_id, psid, test_date, 'biology' subject, biology score FROM t WHERE biology IS NOT NULL
    UNION ALL
    SELECT test_id, psid, test_date, 'science' subject, science score FROM t WHERE science IS NOT NULL
    UNION ALL
    SELECT test_id, psid, test_date, 'mental ability' subject, mental_ability score FROM t WHERE mental_ability IS NOT NULL
    UNION ALL
    SELECT test_id, psid, test_date, 'social science' subject, social_science score FROM t WHERE social_science IS NOT NULL
  )
SELECT
  *
FROM
  main
WHERE
  test_date >= DATE '2024-04-01'
```

### 2.6. `unified_test_attendance_vw` (Implemented)
**Purpose:** Provides a standardized view of student test attendance, indicating whether a test was attempted or missed.

```sql
CREATE OR REPLACE VIEW unified_test_attendance_vw AS
SELECT
  t1.test_digit_id test_id,
  DATE(t1.acad_plan_start_date_time) test_date,
  t1.psid,
  t1.is_attempted
FROM
  "testplayer"."test_attendance_vw" t1
  INNER JOIN "faculty_scorecard_laksh"."tests_considered" t2 ON (
    t1.test_digit_id = t2.test_digit_id
  )
WHERE
  t1.acad_plan_start_date_time >= DATE '2024-04-01'
```

### 2.7. `unified_feedback_vw` (Implemented)
**Purpose:** Provides a standardized view of student feedback, averaging ratings per student, subject, and date.

```sql
CREATE OR REPLACE VIEW unified_feedback_vw AS
SELECT
  psid,
  subject,
  feedback_date,
  AVG(rating) rating
FROM
  (
    SELECT
      us.psid,
      DATE(us.created_at) feedback_date,
      ur.rating,
      IF(
        lower(q.question_subject_calculated) = 'social studies',
        'social science',
        lower(q.question_subject_calculated)
      ) subject
    FROM
      "aakash_classroom_experience"."ace_nps_survey" s
      INNER JOIN "aakash_classroom_experience"."ace_nps_user_survey" us ON s.id = us.survey_id
      INNER JOIN "aakash_classroom_experience"."ace_nps_user_response" ur ON us.id = ur.user_survey_id
      INNER JOIN "aakash_classroom_experience"."nps_question_metadata" q ON s.id = q.survey_id AND ur.question_id = q.question_id
    WHERE
      us.submission_state = 'submitted'
      AND q.question_type_calculated = 'Academic'
  )
GROUP BY
  1,
  2,
  3
```

### 2.8. `unified_student_application_vw` (Implemented)
**Purpose:** Provides a clean, reliable source of student application statuses, filtered to include only long-term, relevant courses. This is the foundational view for all retention and conversion KPIs.

```sql
CREATE OR REPLACE VIEW "unified_student_application_vw" AS 
SELECT
  sad.psid
, sad.application_id
, sad.student_name
, sad.term_value term
, sad.academic_career_value academic_career
, sad.academic_group_value stream
, IF((sad.program_action = 'DISC'), 'Left Out', IF((SUBSTRING(sad.term_value, 3, 2) > '25'), 'Active', 'Completed')) application_status
, sad.registration_date
, (CASE WHEN (sad.program_action = 'DISC') THEN DATE(DATE_ADD('minute', 330, sad.updated_on)) ELSE null END) left_out_date
FROM
  ("phoenix-enrollment_service"."student_application_details_vw" sad
INNER JOIN "phoenix-master_setup_service"."course_master_dataset" c ON (sad.course_id = CAST(c.course_id AS int)))
WHERE ((sad.registration_date >= DATE '2024-04-01') AND (SUBSTRING(sad.term_value, 3, 2) > '24') AND (sad.program_action IN ('MATR', 'DISC', 'APPL', 'RADM', 'BTCG', 'FOLO')) AND (sad.is_deleted = false) AND (c.crct IN ('OYCR', 'TYCR', 'THCR', 'FOUR', 'RPTR', 'CCRP')))
```

### 2.9. Base KPI Views (In Progress)
A series of intermediate views will be created, one for each KPI. These views will join the relevant raw data with the `faculty_student_mapping_vw` to apply the causality and attribution window logic.

*   `kpi_test_performance_base_vw` (Implemented)
*   `kpi_test_attendance_base_vw` (Implemented)
*   `kpi_student_attendance_base_vw` (Implemented)
*   `kpi_compliance_base_vw` (Implemented)
*   `kpi_feedback_base_vw` (Implemented)
*   `kpi_retention_leftout_base_vw` (Implemented)
*   `kpi_retention_ice_base_vw` (Implemented)

#### 2.8.1. `kpi_test_performance_base_vw` (Implemented)
**Purpose:** This view identifies every valid test taken by a student that can be attributed to a faculty member. It joins the student's test attempts with the faculty mapping and applies the 60-day attribution window, ensuring each test is counted only once per faculty.

```sql
CREATE OR REPLACE VIEW kpi_test_performance_base_vw AS
WITH
  national_avg_by_subject AS (
    SELECT
      test_id,
      subject,
      AVG(score) AS national_avg_marks
    FROM
      unified_test_attempts_vw
    GROUP BY
      test_id,
      subject
  )
SELECT DISTINCT
  fsm.faculty_id,
  fsm.psid,
  fsm.subject,
  att.test_id,
  att.test_date,
  att.score,
  navg.national_avg_marks,
  CASE
    WHEN att.score > navg.national_avg_marks THEN 1
    ELSE 0
  END AS is_above_national_avg
FROM
  faculty_student_mapping_vw AS fsm
  INNER JOIN unified_test_attempts_vw AS att ON fsm.psid = att.psid AND fsm.subject = att.subject
  INNER JOIN national_avg_by_subject AS navg ON att.test_id = navg.test_id AND att.subject = navg.subject
WHERE
  att.test_date BETWEEN fsm.mapping_start_date AND (
    fsm.mapping_end_date + INTERVAL '60' DAY
  )
```

#### 2.8.2. `kpi_test_attendance_base_vw` (Implemented)
**Purpose:** This view links every test attendance record to the relevant faculty member, applying the attribution window and ensuring each attendance record is counted only once per faculty.

```sql
CREATE OR REPLACE VIEW kpi_test_attendance_base_vw AS
SELECT DISTINCT
  fsm.faculty_id,
  att.psid,
  att.test_id,
  att.test_date,
  att.is_attempted
FROM
  faculty_student_mapping_vw AS fsm
  INNER JOIN unified_test_attendance_vw AS att ON fsm.psid = att.psid
WHERE
  att.test_date BETWEEN fsm.mapping_start_date AND (
    fsm.mapping_end_date + INTERVAL '60' DAY
  )
```

#### 2.8.3. `kpi_student_attendance_base_vw` (Implemented)
**Purpose:** This view identifies every valid class attendance record and links it to the faculty member who taught the class.

```sql
CREATE OR REPLACE VIEW kpi_student_attendance_base_vw AS
SELECT DISTINCT
  btt.faculty_id,
  btt.psid,
  btt.subject,
  btt.class_date,
  btt.is_present
FROM
  base_timetable_vw AS btt
  INNER JOIN faculty_student_mapping_vw AS fsm ON btt.faculty_id = fsm.faculty_id
  AND btt.psid = fsm.psid
  AND btt.subject = fsm.subject
WHERE
  -- Ensure the class date falls within one of the valid teaching blocks for that faculty, student, and subject.
  btt.class_date BETWEEN fsm.mapping_start_date AND fsm.mapping_end_date
```

#### 2.8.4. `kpi_compliance_base_vw` (Implemented)
**Purpose:** This view identifies every lecture delivered by a faculty member and retrieves the associated compliance flags for syllabus and attendance marking.

```sql
CREATE OR REPLACE VIEW kpi_compliance_base_vw AS
SELECT DISTINCT
  btt.faculty_id,
  btt.subject,
  btt.class_date,
  btt.batch_time_table_id,
  btt.is_syllabus_compliance_marked,
  btt.is_class_attendance_marked
FROM
  base_timetable_vw AS btt
  INNER JOIN faculty_student_mapping_vw AS fsm ON btt.faculty_id = fsm.faculty_id
  AND btt.psid = fsm.psid
  AND btt.subject = fsm.subject
WHERE
  -- Ensure the class date falls within one of the valid teaching blocks for that faculty, student, and subject.
  btt.class_date BETWEEN fsm.mapping_start_date AND fsm.mapping_end_date
```

#### 2.8.5. `kpi_feedback_base_vw` (Implemented)
**Purpose:** This view links every student feedback record to the relevant faculty member, applying the 30-day attribution window.

```sql
CREATE OR REPLACE VIEW kpi_feedback_base_vw AS
SELECT DISTINCT
  fsm.faculty_id,
  f.psid,
  f.subject,
  f.feedback_date,
  f.rating
FROM
  faculty_student_mapping_vw AS fsm
  INNER JOIN unified_feedback_vw AS f ON fsm.psid = f.psid
  AND fsm.subject = f.subject
WHERE
  -- Apply causality: feedback must be given during the mapping period
  -- or within the 30-day attribution window after.
  f.feedback_date BETWEEN fsm.mapping_start_date AND (
    fsm.mapping_end_date + INTERVAL '30' DAY
  )
```

  )

#### 2.8.6. `kpi_retention_leftout_base_vw` (Implemented)
**Purpose:** This view identifies "true" student churn events and attributes them to the relevant faculty member based on our defined business logic and attribution window. A "true" churn event is one where a student leaves a course and is not simultaneously active in any other overlapping course.

```sql
CREATE OR REPLACE VIEW kpi_retention_leftout_base_vw AS
WITH
  -- 1. Find "Left Out" applications where the student was not simultaneously active in another course.
  true_left_out_events AS (
    SELECT
      app.psid,
      app.term,
      app.left_out_date
    FROM
      unified_student_application_vw AS app
    WHERE
      app.application_status = 'Left Out'
      -- And there is NO OTHER application for the same student...
      AND NOT EXISTS (
        SELECT
          1
        FROM
          unified_student_application_vw AS other_app
        WHERE
          other_app.psid = app.psid
          -- ...that is not the one that was left...
          AND other_app.application_id <> app.application_id
          -- ...and was active at the time of leaving.
          -- An application is considered active if the left_out_date falls within its academic term.
          AND app.left_out_date BETWEEN DATE(
            CONCAT('20', SUBSTR(other_app.term, 1, 2)),
            '-04-01'
          ) AND DATE(
            CONCAT('20', SUBSTR(other_app.term, 3, 2)),
            '-03-31'
          )
      )
  )
-- 2. Join the true "left out" events with the faculty mapping to attribute the churn.
SELECT DISTINCT
  fsm.faculty_id,
  tlo.psid,
  tlo.term,
  tlo.left_out_date
FROM
  faculty_student_mapping_vw AS fsm
  INNER JOIN true_left_out_events AS tlo ON fsm.psid = tlo.psid
WHERE
  -- 3. Apply the 90-day attribution window.
  tlo.left_out_date BETWEEN fsm.mapping_start_date AND (
    fsm.mapping_end_date + INTERVAL '90' DAY
  )
  -- 4. Ensure the faculty's teaching period overlaps with the academic term of the course the student left.
  AND fsm.mapping_end_date >= DATE(
    CONCAT('20', SUBSTR(tlo.term, 1, 2)),
    '-04-01'
  )
  AND fsm.mapping_start_date <= DATE(
    CONCAT('20', SUBSTR(tlo.term, 3, 2)),
    '-03-31'
  )
```

  )

#### 2.8.7. `kpi_retention_ice_base_vw` (Implemented)
**Purpose:** This view identifies successful internal conversion events (a student completing one course and enrolling in a subsequent one) and attributes this success to the faculty who taught the student in the initial course.

```sql
CREATE OR REPLACE VIEW kpi_retention_ice_base_vw AS
WITH
  -- 1. Identify successful internal conversions
  conversions AS (
    SELECT
      initial_course.psid,
      initial_course.term AS initial_term,
      next_course.term AS next_term,
      next_course.registration_date
    FROM
      unified_student_application_vw AS initial_course
      INNER JOIN unified_student_application_vw AS next_course ON initial_course.psid = next_course.psid
    WHERE
      initial_course.application_status = 'Completed'
      AND SUBSTR(next_course.term, 1, 2) > SUBSTR(initial_course.term, 1, 2)
  )
-- 2. Join conversions with faculty mapping to attribute the success
SELECT DISTINCT
  fsm.faculty_id,
  c.psid,
  c.initial_term,
  c.next_term
FROM
  faculty_student_mapping_vw AS fsm
  INNER JOIN conversions AS c ON fsm.psid = c.psid
WHERE
  -- 3. Apply the 90-day attribution window
  c.registration_date BETWEEN fsm.mapping_start_date AND (
    fsm.mapping_end_date + INTERVAL '90' DAY
  )
  -- 4. Ensure the faculty's teaching period overlaps with the academic term of the *initial* course.
  --    (This is the same logic pattern as the left_out view)
  AND fsm.mapping_end_date >= DATE(
    CONCAT('20', SUBSTR(c.initial_term, 1, 2)),
    '-04-01'
  )
  AND fsm.mapping_start_date <= DATE(
    CONCAT('20', SUBSTR(c.initial_term, 3, 2)),
    '-03-31'
  )
```

### 2.9. Final Scorecard View (Implemented)
**Purpose:** This is the culminating view that aggregates all KPI metrics, calculates a final weighted score using percentile ranks for fairness, and structures the data for direct consumption by the BI tool. It introduces minimum data thresholds and group-based normalization for statistical reliability.

```sql
CREATE OR REPLACE VIEW final_scorecard_vw AS
WITH
  -- 1. Define KPI Weights from PRD
  kpi_weights AS (
    SELECT
      0.10 AS test_performance_w,
      0.05 AS test_attendance_w,
      0.05 AS student_attendance_w,
      0.10 AS syllabus_compliance_w,
      0.05 AS class_attendance_compliance_w,
      0.15 AS feedback_w,
      0.10 AS retention_w,
      0.10 AS conversion_w
  ),
  -- 2. Aggregation CTEs for each raw KPI metric
  total_students_taught_agg AS (
    SELECT faculty_id, COUNT(DISTINCT psid) AS total_students_taught
    FROM faculty_student_mapping_vw GROUP BY faculty_id
  ),
  test_performance_agg AS (
    SELECT faculty_id, COUNT(DISTINCT psid, test_id) AS total_student_tests_attributed, SUM(is_above_national_avg) AS tests_above_national_avg
    FROM kpi_test_performance_base_vw GROUP BY faculty_id
  ),
  test_attendance_agg AS (
    SELECT faculty_id, COUNT(DISTINCT psid, test_id) AS total_student_tests_assigned, SUM(is_attempted) AS tests_attempted
    FROM kpi_test_attendance_base_vw GROUP BY faculty_id
  ),
  student_attendance_agg AS (
    SELECT faculty_id, COUNT(DISTINCT psid, class_date) AS total_student_class_days, SUM(is_present) AS student_class_days_present
    FROM kpi_student_attendance_base_vw GROUP BY faculty_id
  ),
  compliance_agg AS (
    SELECT faculty_id, COUNT(DISTINCT batch_time_table_id) AS total_lectures_delivered, SUM(is_syllabus_compliance_marked) AS syllabus_marked_count, SUM(is_class_attendance_marked) AS attendance_marked_count
    FROM kpi_compliance_base_vw GROUP BY faculty_id
  ),
  feedback_agg AS (
    SELECT faculty_id, AVG(rating) AS avg_feedback_rating, COUNT(DISTINCT psid, feedback_date) AS total_feedback_responses
    FROM kpi_feedback_base_vw GROUP BY faculty_id
  ),
  retention_leftout_agg AS (
    SELECT faculty_id, COUNT(DISTINCT psid) AS students_left_out
    FROM kpi_retention_leftout_base_vw GROUP BY faculty_id
  ),
  retention_ice_agg AS (
    SELECT faculty_id, COUNT(DISTINCT psid) AS students_converted
    FROM kpi_retention_ice_base_vw GROUP BY faculty_id
  ),
  -- 3. Join all raw metrics and calculate individual 0-100 scores, applying minimum data thresholds
  faculty_kpi_scores AS (
   SELECT
     hono.employee_id faculty_id
   , hono.stream hono_stream
   , COALESCE(st.total_students_taught, 0) total_students_taught
   , COALESCE(tp.tests_above_national_avg, 0) tests_above_national_avg
   , COALESCE(tp.total_student_tests_attributed, 0) total_student_tests_attributed
   , COALESCE(ta.tests_attempted, 0) tests_attempted
   , COALESCE(ta.total_student_tests_assigned, 0) total_student_tests_assigned
   , COALESCE(sa.student_class_days_present, 0) student_class_days_present
   , COALESCE(sa.total_student_class_days, 0) total_student_class_days
   , COALESCE(ca.syllabus_marked_count, 0) syllabus_marked_count
   , COALESCE(ca.attendance_marked_count, 0) attendance_marked_count
   , COALESCE(ca.total_lectures_delivered, 0) total_lectures_delivered
   , fb.avg_feedback_rating
   , COALESCE(fb.total_feedback_responses, 0) total_feedback_responses
   , COALESCE(rlo.students_left_out, 0) students_left_out
   , COALESCE(rice.students_converted, 0) students_converted
   , (CASE WHEN (COALESCE(tp.total_student_tests_attributed, 0) >= 10) THEN ((CAST(COALESCE(tp.tests_above_national_avg, 0) AS DOUBLE) / NULLIF(COALESCE(tp.total_student_tests_attributed, 0), 0)) * 100) ELSE null END) test_performance_score
   , (CASE WHEN (COALESCE(ta.total_student_tests_assigned, 0) >= 10) THEN ((CAST(COALESCE(ta.tests_attempted, 0) AS DOUBLE) / NULLIF(COALESCE(ta.total_student_tests_assigned, 0), 0)) * 100) ELSE null END) test_attendance_score
   , ((CAST(COALESCE(sa.student_class_days_present, 0) AS DOUBLE) / NULLIF(COALESCE(sa.total_student_class_days, 0), 0)) * 100) student_attendance_score
   , ((CAST(COALESCE(ca.syllabus_marked_count, 0) AS DOUBLE) / NULLIF(COALESCE(ca.total_lectures_delivered, 0), 0)) * 100) syllabus_compliance_score
   , ((CAST(COALESCE(ca.attendance_marked_count, 0) AS DOUBLE) / NULLIF(COALESCE(ca.total_lectures_delivered, 0), 0)) * 100) class_attendance_compliance_score
   , (CASE WHEN (COALESCE(fb.total_feedback_responses, 0) >= 5) THEN (((fb.avg_feedback_rating - 1) / 4) * 100) ELSE null END) feedback_score
   , (CASE WHEN (COALESCE(st.total_students_taught, 0) >= 10) THEN ((CAST((COALESCE(st.total_students_taught, 0) - COALESCE(rlo.students_left_out, 0)) AS DOUBLE) / NULLIF(COALESCE(st.total_students_taught, 0), 0)) * 100) ELSE null END) retention_score
   , (CASE WHEN (COALESCE(st.total_students_taught, 0) >= 10) THEN ((CAST(COALESCE(rice.students_converted, 0) AS DOUBLE) / NULLIF(COALESCE(st.total_students_taught, 0), 0)) * 100) ELSE null END) conversion_score
   FROM
     ((((((((eligible_faculty_hono_vw hono
   LEFT JOIN total_students_taught_agg st ON (hono.employee_id = st.faculty_id))
   LEFT JOIN test_performance_agg tp ON (hono.employee_id = tp.faculty_id))
   LEFT JOIN test_attendance_agg ta ON (hono.employee_id = ta.faculty_id))
   LEFT JOIN student_attendance_agg sa ON (hono.employee_id = sa.faculty_id))
   LEFT JOIN compliance_agg ca ON (hono.employee_id = ca.faculty_id))
   LEFT JOIN feedback_agg fb ON (hono.employee_id = fb.faculty_id))
   LEFT JOIN retention_leftout_agg rlo ON (hono.employee_id = rlo.faculty_id))
   LEFT JOIN retention_ice_agg rice ON (hono.employee_id = rice.faculty_id))
),
  -- 4. NEW CTE: Calculate percentile rank for each KPI, partitioning by stream for retention and conversion
  faculty_kpi_percentiles AS (
    SELECT
      faculty_id,
      hono_stream,
      -- Raw metrics and scores to pass through
      total_students_taught, tests_above_national_avg, total_student_tests_attributed, tests_attempted, total_student_tests_assigned, student_class_days_present, total_student_class_days, syllabus_marked_count, attendance_marked_count, total_lectures_delivered, avg_feedback_rating, total_feedback_responses, students_left_out, students_converted,
      test_performance_score, test_attendance_score, student_attendance_score, syllabus_compliance_score, class_attendance_compliance_score, feedback_score, retention_score, conversion_score,
      -- Percentile Scores (0-100), calculated ONLY for non-null scores using CUME_DIST
      (CASE WHEN test_performance_score IS NULL THEN NULL ELSE (CUME_DIST() OVER (PARTITION BY CASE WHEN test_performance_score IS NOT NULL THEN 1 END ORDER BY test_performance_score ASC) * 100) END) AS test_performance_percentile,
      (CASE WHEN test_attendance_score IS NULL THEN NULL ELSE (CUME_DIST() OVER (PARTITION BY hono_stream, CASE WHEN test_attendance_score IS NOT NULL THEN 1 END ORDER BY test_attendance_score ASC) * 100) END) AS test_attendance_percentile,
      (CASE WHEN student_attendance_score IS NULL THEN NULL ELSE (CUME_DIST() OVER (PARTITION BY CASE WHEN student_attendance_score IS NOT NULL THEN 1 END ORDER BY student_attendance_score ASC) * 100) END) AS student_attendance_percentile,
      (CASE WHEN syllabus_compliance_score IS NULL THEN NULL ELSE (CUME_DIST() OVER (PARTITION BY CASE WHEN syllabus_compliance_score IS NOT NULL THEN 1 END ORDER BY syllabus_compliance_score ASC) * 100) END) AS syllabus_compliance_percentile,
      (CASE WHEN class_attendance_compliance_score IS NULL THEN NULL ELSE (CUME_DIST() OVER (PARTITION BY CASE WHEN class_attendance_compliance_score IS NOT NULL THEN 1 END ORDER BY class_attendance_compliance_score ASC) * 100) END) AS class_attendance_compliance_percentile,
      (CASE WHEN feedback_score IS NULL THEN NULL ELSE (CUME_DIST() OVER (PARTITION BY CASE WHEN feedback_score IS NOT NULL THEN 1 END ORDER BY feedback_score ASC) * 100) END) AS feedback_percentile,
      (CASE WHEN retention_score IS NULL THEN NULL ELSE (CUME_DIST() OVER (PARTITION BY hono_stream, CASE WHEN retention_score IS NOT NULL THEN 1 END ORDER BY retention_score ASC) * 100) END) AS retention_percentile,
      (CASE WHEN conversion_score IS NULL THEN NULL ELSE (PERCENT_RANK() OVER (PARTITION BY hono_stream, CASE WHEN conversion_score IS NOT NULL THEN 1 END ORDER BY conversion_score ASC) * 100) END) AS conversion_percentile
    FROM faculty_kpi_scores
  ),
  -- 5. Calculate the final weighted score using percentiles
  faculty_final_score AS (
    SELECT
      s.*,
      w.test_performance_w, w.test_attendance_w, w.student_attendance_w, w.syllabus_compliance_w, w.class_attendance_compliance_w, w.feedback_w, w.retention_w, w.conversion_w,
      (
        s.test_performance_percentile * w.test_performance_w +
        s.test_attendance_percentile * w.test_attendance_w +
        s.student_attendance_percentile * w.student_attendance_w +
        s.syllabus_compliance_percentile * w.syllabus_compliance_w +
        s.class_attendance_compliance_percentile * w.class_attendance_compliance_w +
        s.feedback_percentile * w.feedback_w +
        s.retention_percentile * w.retention_w +
        s.conversion_percentile * w.conversion_w
      ) AS final_score
    FROM faculty_kpi_percentiles s, kpi_weights w
    WHERE s.total_students_taught > 0 -- Only score faculty who taught students
  ),
  -- 6. Create the dimensional grain for individual row generation
  valid_timetable_entries AS (
    SELECT DISTINCT
      btt.faculty_id,
      btt.psid,
      btt.subject,
      btt.class_date,
      btt.business_unit,
      btt.branch_name,
      btt.state,
      btt.region,
      btt.branch_type,
      btt.branch_sub_type,
      btt.stream
    FROM
      base_timetable_vw AS btt
      INNER JOIN faculty_student_mapping_vw AS fsm ON btt.faculty_id = fsm.faculty_id
      AND btt.psid = fsm.psid
      AND btt.subject = fsm.subject
    WHERE
      btt.class_date BETWEEN fsm.mapping_start_date AND fsm.mapping_end_date
  ),
  faculty_dimensional_grain AS (
    SELECT DISTINCT faculty_id, business_unit, branch_name, state, region, branch_type, branch_sub_type, stream, subject
    FROM valid_timetable_entries
  ),
  -- 7. Create the aggregated dimension strings
  faculty_student_dimensions_agg AS (
    SELECT
      faculty_id,
      ARRAY_JOIN(ARRAY_SORT(ARRAY_AGG(DISTINCT business_unit)), ', ') AS student_business_unit_agg,
      ARRAY_JOIN(ARRAY_SORT(ARRAY_AGG(DISTINCT branch_name)), ', ') AS student_branch_agg,
      ARRAY_JOIN(ARRAY_SORT(ARRAY_AGG(DISTINCT state)), ', ') AS student_state_agg,
      ARRAY_JOIN(ARRAY_SORT(ARRAY_AGG(DISTINCT region)), ', ') AS student_region_agg,
      ARRAY_JOIN(ARRAY_SORT(ARRAY_AGG(DISTINCT branch_type)), ', ') AS student_branch_type_agg,
      ARRAY_JOIN(ARRAY_SORT(ARRAY_AGG(DISTINCT branch_sub_type)), ', ') AS student_branch_sub_type_agg,
      ARRAY_JOIN(ARRAY_SORT(ARRAY_AGG(DISTINCT stream)), ', ') AS student_stream_agg,
      ARRAY_JOIN(ARRAY_SORT(ARRAY_AGG(DISTINCT subject)), ', ') AS student_subject_agg
    FROM valid_timetable_entries
    GROUP BY faculty_id
  )
-- 8. Final SELECT statement to join everything into the desired structure
SELECT
  -- HONO Dimensions
  hono.employee_id AS faculty_id,
  hono.employee_name,
  hono.role,
  hono.stream AS hono_stream,
  hono.subject AS hono_subject,
  hono.business_unit_hono,
  hono.business_unit AS hono_business_unit,
  hono.business_area_desc AS hono_branch_name,
  hono.state AS hono_state,
  hono.region AS hono_region,
  hono.branch_type AS hono_branch_type,
  hono.branch_sub_type AS hono_branch_sub_type,
  -- Student-Derived Individual Dimensions (for filtering)
  grain.business_unit AS student_business_unit_individual,
  grain.branch_name AS student_branch_individual,
  grain.state AS student_state_individual,
  grain.region AS student_region_individual,
  grain.branch_type AS student_branch_type_individual,
  grain.branch_sub_type AS student_branch_sub_type_individual,
  grain.stream AS student_stream_individual,
  grain.subject AS student_subject_individual,
  -- Student-Derived Aggregated Dimensions (for display)
  agg_dims.student_business_unit_agg,
  agg_dims.student_branch_agg,
  agg_dims.student_state_agg,
  agg_dims.student_region_agg,
  agg_dims.student_branch_type_agg,
  agg_dims.student_branch_sub_type_agg,
  agg_dims.student_stream_agg,
  agg_dims.student_subject_agg,
  -- Raw KPI Metrics
  COALESCE(scores.total_students_taught, 0) AS total_students_taught,
  COALESCE(scores.tests_above_national_avg, 0) AS tests_above_national_avg,
  COALESCE(scores.total_student_tests_attributed, 0) AS total_student_tests_attributed,
  COALESCE(scores.tests_attempted, 0) AS tests_attempted,
  COALESCE(scores.total_student_tests_assigned, 0) AS total_student_tests_assigned,
  COALESCE(scores.student_class_days_present, 0) AS student_class_days_present,
  COALESCE(scores.total_student_class_days, 0) AS total_student_class_days,
  COALESCE(scores.syllabus_marked_count, 0) AS syllabus_marked_count,
  COALESCE(scores.attendance_marked_count, 0) AS attendance_marked_count,
  COALESCE(scores.total_lectures_delivered, 0) AS total_lectures_delivered,
  scores.avg_feedback_rating,
  COALESCE(scores.total_feedback_responses, 0) AS total_feedback_responses,
  COALESCE(scores.students_left_out, 0) AS students_left_out,
  COALESCE(scores.students_converted, 0) AS students_converted,
  -- Individual KPI Scores (0-100)
  scores.test_performance_score,
  scores.test_attendance_score,
  scores.student_attendance_score,
  scores.syllabus_compliance_score,
  scores.class_attendance_compliance_score,
  scores.feedback_score,
  scores.retention_score,
  scores.conversion_score,
  -- KPI Percentile Ranks (0-100)
  scores.test_performance_percentile,
  scores.test_attendance_percentile,
  scores.student_attendance_percentile,
  scores.syllabus_compliance_percentile,
  scores.class_attendance_compliance_percentile,
  scores.feedback_percentile,
  scores.retention_percentile,
  scores.conversion_percentile,
  -- KPI Weights
  scores.test_performance_w,
  scores.test_attendance_w,
  scores.student_attendance_w,
  scores.syllabus_compliance_w,
  scores.class_attendance_compliance_w,
  scores.feedback_w,
  scores.retention_w,
  scores.conversion_w,
  -- Final Score, Rank, and Flags
  scores.final_score,
  CASE WHEN scores.final_score IS NOT NULL THEN 1 ELSE 0 END AS is_ranked,
  CASE WHEN scores.faculty_id IS NOT NULL THEN 1 ELSE 0 END AS is_data_available,
  (CASE WHEN scores.final_score IS NULL THEN NULL ELSE DENSE_RANK() OVER (ORDER BY scores.final_score DESC) END) AS national_rank
FROM eligible_faculty_hono_vw AS hono
LEFT JOIN faculty_final_score AS scores ON hono.employee_id = scores.faculty_id
LEFT JOIN faculty_student_dimensions_agg AS agg_dims ON hono.employee_id = agg_dims.faculty_id
LEFT JOIN faculty_dimensional_grain AS grain ON hono.employee_id = grain.faculty_id
```

## 3. Core Business Logic for KPIs

This section defines the high-level business rules that govern the calculation of key performance indicators, particularly those related to student status.


### 3.1. Student Retention & Conversion Logic

To accurately measure student churn and internal conversion, the following student-centric logic must be applied. This is crucial because a single student (`psid`) can have multiple course enrollments (`application_id`) simultaneously or sequentially.

*   **Student-Centric View:** The primary unit of analysis for retention is the **student (`psid`)**, not the individual course application.
*   **Definition of "Left Out":** A student is only considered "left out" or "churned" if **all** of their active applications are marked as discontinued. If a student has two applications for the same term (e.g., term `2426`) and only one is discontinued while the other remains active, the student is **not** considered left out.
*   **Definition of "Internal Conversion":** A student is considered an "internal conversion" if they successfully complete a course (i.e., were not "left out") and subsequently enroll in a new course for a future term. For example, if a student was active throughout their `2325` term course and then enrolls in a `2526` term course, this represents a successful internal conversion.
*   **Date Parameter Handling:** The logic must correctly handle all scenarios related to the scorecard's `date_params_vw`. A student's status must be evaluated based on their application statuses within the defined date range of the scorecard.
*   **Faculty Attribution:** When attributing retention to a faculty member, the student must not have been "left out" (per the definition above) within the `retention_attribution_window` (90 days) after the faculty's `mapping_end_date`.
