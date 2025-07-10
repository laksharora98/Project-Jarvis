# Faculty Scorecard Project - Product Requirements Document

## 1. Introduction
### 1.1 Project Overview
The Faculty Scorecard project aims to build a comprehensive leaderboard for all faculty at Aakash. This leaderboard will be based on data gathered from various sources, with parameters and their weightages to be defined. The project will also involve defining the calculation logic for each parameter's score and building a reporting mechanism for users to access the leaderboard and raw data.

### 1.2 Goals & Objectives
*   Improve overall faculty performance.
*   Identify top performers for recognition and other initiatives.
*   Pinpoint areas where training and development might be beneficial.

### 1.3 Scope

#### 1.3.1 In-Scope for V3
*   Calculation and display of all non-manual Key Performance Indicators (KPIs) as defined in this document.
*   Implementation of all business logic for system-driven KPIs.
*   A new, to-be-defined report interface on AakashGuru for displaying the V3 leaderboard.
*   Provision of all necessary raw data for users to understand and validate the calculated scores.

#### 1.3.2 Out-of-Scope for V3
*   Integration or handling of manual KPIs (these are documented as future scope).
*   Automated, continuous data refresh jobs (e.g., weekly/monthly refreshes) – the initial V3 release may involve a manual or less frequent refresh mechanism.

## 2. Key Performance Indicators (KPIs) - V3 Scope

The following non-manual KPIs are in scope for V3:

### 2.1 Academic Effectiveness

*   **Test Performance**
    *   **Weightage:** 10%
    *   **High-Level Definition:** Average percentage of tests in which a student performs better than the National Average in that subject.
    *   **Data Sources:** Vyom, Scoretool

*   **Students Class Attendance**
    *   **Weightage:** 5%
    *   **High-Level Definition:** Average Attendance per class (excluding PTM) among the students mapped to this faculty.
    *   **Data Sources:** AakashGuru, RFID, MS Teams, Crystal, Phoenix

*   **Test Attendance**
    *   **Weightage:** 5%
    *   **High-Level Definition:** Average Attendance per test among students mapped to this faculty (initially for SOE stream only).
    *   **Data Sources:** Phoenix, Vyom, Scoretool

### 2.2 Student Retention

*   **Left Out**
    *   **Weightage:** 10%
    *   **High-Level Definition:** Percentage of students who left the program.
    *   **Data Source:** Phoenix

*   **Internal Conversion**
    *   **Weightage:** 10%
    *   **High-Level Definition:** ICE conversion will affect scores of faculty that taught in previous course.
    *   **Data Source:** Phoenix

### 2.3 Compliance

*   **Syllabus Compliance**
    *   **Weightage:** 10%
    *   **High-Level Definition:** Pace of syllabus completion or comparison with targets given against academic plan.
    *   **Data Source:** Aakash Guru

*   **Class Attendance Compliance**
    *   **Weightage:** 5%
    *   **High-Level Definition:** Measures whether the faculty marked attendance for a scheduled lecture in AakashGuru.
    *   **Data Source:** AakashGuru, Phoenix

### 2.4 Feedback

*   **Student Feedback - CSAT (80%) / NPS (20%)**
    *   **Weightage:** 15%
    *   **High-Level Definition:** Student feedback for subjects taught by the faculty (currently CSAT only, averaged across all survey questions).
    *   **Data Source:** MyAakash

## 3. Detailed KPI Definitions & Business Logic

This section provides detailed definitions, calculation logic, and considerations for each KPI, including those in scope for V3 and those planned for future phases (manual KPIs).

### 3.1 Manual KPIs (Future Scope)

The following KPIs are identified as manual and are out of scope for V3, but will be considered for future phases:

*   **Productivity (Scheduled classes + QRC + Content Enrich)**
    *   **Weightage:** 10%
    *   **High-Level Definition:** Average number of hours for classes (Lecture, Extra, Doubt, PTM) are scheduled in a week in Phoenix.
    *   **Remarks:** Faculty Employee ID, Score required. How to handle when data not available?

*   **Academic Target vs Achievement**
    *   **Weightage:** 10%
    *   **High-Level Definition:** Manual assessment of academic targets vs. achievement.

*   **Mentorship**
    *   **Weightage:** 5%
    *   **High-Level Definition:** Manual assessment of mentorship activities.
    *   **Remarks:** Faculty Employee ID, Score required.

*   **PTM (Parent Teacher Meeting)**
    *   **Weightage:** 5%
    *   **High-Level Definition:** Manual assessment of PTMs.
    *   **Remarks:** Manual data pipeline already built for a QS Report. How to get which faculty is taking PTM? Can we use AakashGuru student comments data?

*   **Students & Parents Counseling**
    *   **Weightage:** (Not specified, listed as manual).
    *   **High-Level Definition:** Manual assessment of counseling activities.
    *   **Remarks:** Faculty Employee ID, Score required.

*   **School Performance**
    *   **Weightage:** (Not specified, listed as manual).
    *   **High-Level Definition:** Manual assessment of school performance.
    *   **Remarks:** Faculty Employee ID, Score required.

### 3.2 Non-Manual KPIs (V3 Scope)

#### 3.2.1 Test Performance
*   **KRA:** Academic effectiveness
*   **Weightage:** 10%
*   **High-Level Definition:** Average percentage of tests in which a student performs better than the National Average in that subject.
*   **Data Sources:** Vyom, Scoretool
*   **Calculation Logic:**
    *   For every student and subject, calculate the percentage of tests where they scored above the national average.
    *   Compute the faculty's average percentage across all students.
    *   Convert to a score out of 100, then scale according to weightage.
*   **Test Types Considered:**
    *   SOE: Unit Test, Term Exam, AIATS
    *   SOM: Practice Test, Term Exam, AIATS, Fortnightly Tests
    *   SOF: Fortnightly Subjective Test, Term Exam, Cumulative Subjective Test, Objective Test, AIATS
*   **Key Considerations/Open Questions:**
    *   Causality: Should tests given by student during or just after being taught by this faculty be included? How to determine this?
    *   Test IDs are currently determined using a subjective manual process by getting all tests conducted in scoretool, vyom. This cannot be continued.

#### 3.2.2 Syllabus Compliance
*   **KRA:** Compliance
*   **Weightage:** 10%
*   **High-Level Definition:** Measures whether the faculty marked the syllabus topics they covered for each lecture they delivered.
*   **Data Source:** Phoenix Timetable Data (with compliance flag)
*   **Calculation Logic:**
    *   For each faculty, calculate the percentage of their delivered lectures for which they marked syllabus completion.
    *   Percentage = (Lectures with syllabus marked by faculty) / (Total lectures delivered by faculty)
    *   Scoring:
        *   ≥ 80% → Full marks
        *   ≤ 50% → Zero marks
        *   Scale linearly for percentages between 50% and 80%.
*   **Key Considerations/Open Questions:**
    *   This KPI is now based on the faculty's own actions per lecture and does not require batch-level aggregation for Phase 1.

#### 3.2.3 Class Attendance Compliance
*   **KRA:** Compliance
*   **Weightage:** 5%
*   **High-Level Definition:** Measures whether the faculty marked student attendance for each lecture they delivered.
*   **Data Source:** Phoenix Timetable Data (with compliance flag)
*   **Calculation Logic:**
    *   For each faculty, calculate the percentage of their delivered lectures for which they marked student attendance.
    *   Percentage = (Lectures with attendance marked by faculty) / (Total lectures delivered by faculty)
    *   Scale the resulting percentage to a final score based on the 5% weightage.
*   **Key Considerations/Open Questions:**
    *   This KPI is based on the faculty's own actions per lecture. It does not depend on whether a coordinator or EDP also marked attendance.

#### 3.2.4 Students Class Attendance
*   **KRA:** Academic effectiveness
*   **Weightage:** 5%
*   **High-Level Definition:** Average Attendance per class (excluding PTM) among the students mapped to this faculty.
*   **Data Sources:** AakashGuru, RFID, MS Teams, Crystal, Phoenix
*   **Calculation Logic:**
    *   Average Attendance per class (excluding PTM) among the students mapped to this faculty.
*   **Key Considerations/Open Questions:**
    *   Number of Lectures Marked / Total Lectures Scheduled? - Do Coordinators/EDP also mark attendance? Should attendance marked by them be included?

#### 3.2.5 Test Attendance
*   **KRA:** Academic effectiveness
*   **Weightage:** 5%
*   **High-Level Definition:** Average Attendance per test among students mapped to this faculty (initially for SOE stream only).
*   **Data Sources:** Phoenix, Vyom, Scoretool
*   **Calculation Logic:**
    *   Average Attendance per test among students mapped to this faculty.
*   **Key Considerations/Open Questions:**
    *   Only for SOE.
    *   Should causality be required similar to test performance?
    *   Scores for SOM and SOF?

#### 3.2.6 Student Feedback - CSAT (80%) / NPS (20%)
*   **KRA:** Feedback
*   **Weightage:** 15%
*   **High-Level Definition:** Student feedback for subjects taught by the faculty (currently CSAT only, averaged across all survey questions).
*   **Data Source:** MyAakash
*   **Calculation Logic:**
    *   Compute average student feedback for subjects taught by the faculty.
    *   Feedback is taken from CSAT surveys conducted in July & October via the MyAakash App.
    *   Scale the score as per weightage.
*   **Key Considerations/Open Questions:**
    *   Currently only CSAT is included. All questions answered across all surveys are averaged into a single score.
    *   Should causality be included similar to test performance?
    *   Should recent surveys weigh higher?
    *   Are all questions equally relevant?

#### 3.2.7 Student Retention - Left Out
*   **KRA:** Student Retention
*   **Weightage:** 10%
*   **High-Level Definition:** Percentage of students who left the program.
*   **Data Source:** Phoenix
*   **Calculation Logic:**
    *   Determine the percentage of students who left the program.
*   **Key Considerations/Open Questions:**
    *   Currently no causality is considered. Student may have discontinued before this faculty taught them.

#### 3.2.8 Student Retention - Internal Conversion
*   **KRA:** Student Retention
*   **Weightage:** 10%
*   **High-Level Definition:** ICE conversion will affect scores of faculty that taught in previous course.
*   **Data Source:** Phoenix
*   **Key Considerations/Open Questions:**
    *   Stream Wise normalisation may be required as generally ICE is lower for SOE than SOM.
    *   How to handle when data not available?

## 4. Eligibility Criteria

### 4.1 Faculty Eligibility for Scorecard Inclusion

*   Faculty members with fewer than 8 lectures taken for all batches during this period or missing data for any factor will not be included in the ranking.
*   Their list will be published separately.
*   Other active faculties in HONO who haven't taken even a single lecture are also published separately.
*   All faculty who are eligible for a national rank based on the 8 classes threshold and have a score against all 4 parameters are present in the main scorecard.

### 4.2 Faculty Eligibility for National Ranking

*   Faculty may teach multiple batches and subjects.
*   Faculty should have taken at least 8 classes for at least one student to be eligible for a national rank.

### 4.3 Key Considerations/Open Questions

*   **How to get total list of faculty eligible for this?**
    *   All Active Faculty in HONO?
    *   How to remove faculty who are in corporate or school tie-up roles, etc.?
    *   Only faculty from Phoenix who are currently active in HONO and are not AD, DD etc. - only those roles that take classes in 1 branch.
*   **How to get faculty-student mapping?**
    *   Currently, faculty has to take at least 8 classes for a particular subject for a student for that student's attributes to affect this faculty's score for that subject.
*   **How to get faculty-batch mapping?**
    *   For Phase 1, this is no longer required for most KPIs. The two compliance KPIs (Syllabus and Class Attendance) have been simplified to be per-lecture, based on flags in the timetable data, removing the need for batch-level mapping.
*   **Score for faculty who did not take any classes?**
    *   Currently no rank is generated for these.
*   **Score for faculty who has no student mapped?**
    *   Currently no rank is generated for these.
*   **Score for faculty where any parameter's score is missing?**
    *   Currently no rank is generated for these.
*   **Which test types are to be considered? How to identify these test types for tests that are not scheduled in Phoenix?**
    *   Current Test Types (as listed under Test Performance KPI).
    *   Test IDs are determined using a subjective manual process by getting all tests conducted in scoretool, vyom. This cannot be continued.
*   **If a student has multiple applications, which one to be considered for calculating ICE or retention?**
    *   Current logic for preference:
        *   Take active terms only.
        *   Prioritize based on program action: P1-MATR, FOLO, RADM, BTCG; P2 - DISC; P3-STCG, CRCG, IBTR, APPL.
        *   Prioritize based on career: P1 - RCC; P2 - HYB; P3-ICON; P4 - Other.
        *   effdt DESC.
        *   Application number DESC.
    *   Suggested additional enhancement - Only take long term courses.
*   **Ensuring causality for survey data and other parameters.**
    *   For every parameter, causality to be ensured - e.g., a survey taken in November should not affect a Faculty's score who started teaching the student in December. This will be handled by the `faculty-student` mapping and defined attribution windows (see section 4.4).
*   **Will faculty scorecard require score for a duration across academic years?**
    *   No.

### 4.4 Causality and Attribution Logic

To ensure fairness and accuracy, the attribution of a student's actions (e.g., test performance, feedback) to a faculty member is strictly defined by a mapping period and a subsequent "attribution window."

1.  **Faculty-Student Mapping:** A student is considered "mapped" to a faculty for a specific subject during a contiguous block of time when the faculty is actively teaching them. This is determined based on class schedules. A faculty must teach a certain percentage of classes (e.g., >25%) for a student-subject combination to establish a mapping. This mapping has a clear `start_date` and `end_date`.

2.  **Attribution Windows:** For KPIs that have a lagging effect, a configurable "attribution window" is applied, extending from the `mapping_end_date`. An event must occur within this window to be counted towards the faculty's score.

    *   **Test Performance & Test Attendance:** The event (test taken) must occur during the mapping period or within a **60-day window** after the mapping ends.
    *   **Student Feedback (CSAT):** The event (feedback given) must occur during the mapping period or within a **30-day window** after the mapping ends.
    *   **Student Retention (Left Out):** The event (student's `left_out_date`) must occur during the mapping period or within a **90-day window** after the mapping ends.
    *   **Direct Compliance/Attendance KPIs:** For Student Class Attendance, Syllabus Compliance, and Class Attendance Compliance, the attribution window is **0 days**. The events must occur strictly within the mapping period.
    *   **Internal Conversion (ICE):** This is event-based, not time-based. It is determined by a student's re-enrollment in a subsequent course after being taught by the faculty in a course ending in the current period.

## 5. Reporting & Visualization

### 5.1 Delivery Platform

*   **Primary:** AakashGuru (No QS Report shared with Faculty. AakashGuru will be the final delivery platform.)
*   **Backup:** Looker (We can create Looker report as a backup.)

### 5.2 Report Refresh Frequency

*   As required.

### 5.3 Report Data Start Date

*   1 Apr 2024 - 31 Mar 2025.

### 5.4 Report UI Details & Visuals (V2 Reference)

***Note:*** *The following section describes the visuals and reports from the V2 implementation of the Faculty Scorecard, which was built on AWS Quicksight. This information is preserved here as a reference for brainstorming and designing the new V3 UI, which will be delivered on AakashGuru.*

#### 5.4.1 Sheet 1: Scorecard (Main Leaderboard)

*   All faculty who are eligible for a national rank based on the 8 classes threshold and have a score against all 4 parameters are present in this visual.
*   There is an AIR Rank.
*   There is a dynamic rank based on the filters selected.
*   **Columns:** S.No, Regions, Branch Types, Branch Codes, Branch Names, Streams, Faculty ID, Faculty Name, Subjects, Student Test Performance, Syllabus Compliance, Student Retention, CSAT Feedback, Final Score (out of 70), Percentage, Rank, AIR.

#### 5.4.2 Sheet 2: Faculty not included in scorecard

*   This visual has all faculty who are not eligible for a rank because of one of the following reasons:
    *   They have not taken more than 8 lectures for any batch during this period.
    *   They have taken more than 8 lectures for at least one batch but at least one of the four parameters does not have a score due to one of following reasons:
        *   Student Test Performance - No student gave a test which had a section corresponding to the subject taught by this faculty.
        *   CSAT Feedback - No student gave feedback for the subject taught by this faculty.
*   **Columns:** Regions, Branch Types, Branch Codes, Branch Names, Streams, Faculty ID, Faculty Name, Subjects, Student Test Performance, Syllabus Compliance, Student Retention, CSAT Feedback, Final Score.

#### 5.4.3 Sheet 3: Faculty active in HONO with 0 classes

*   This visual has any faculty who was active in HONO during this period but hasn't taken even a single class during the same period.
*   These have been published so that the report is exhaustive.
*   Every faculty will be part of one of Visual 1, Visual 2 and Visual 3.
*   **Columns:** Faculty ID, Faculty Name, Role Name, Department, Branch Name, Date of Joining.

#### 5.4.4 Deep Dive Sheets

*   **Student Test Performance:**
    *   **Columns:** Regions, Branch Types, Streams, Branch Codes, Branch Names, Faculty ID, Faculty Name, Subjects, Total Students, Above Average Percentage, Final Score (Out of 10).
    *   **Details:** Total Students - Number of students who gave at least 1 test which had the subject taught by the faculty. Above Average Percentage - This is the percentage out of 100 calculated based on the logic discussed before. Final Score (out of 10) - Based on scaling the Percentage out of 10.

*   **Syllabus Compliance:**
    *   **Columns:** Regions, Branch Types, Streams, Branch Codes, Branch Names, Faculty ID, Faculty Name, Subjects, Total Scheduled Lectures, Total Marked Lectures, Percentage, Final Score (Out of 10).
    *   **Details:** Total Scheduled Lectures. Total Marked Lectures - In AakashGuru. Percentage = b/a. Final Score (out of 10) - based on the scaling logic discussed before.

*   **Student Retention:**
    *   **Columns:** Regions, Branch Types, Streams, Branch Codes, Branch Names, Faculty ID, Faculty Name, Subjects, Total Students, Discontinued Students, Discontinued Percentage, Final Score (out of 30).
    *   **Details:** Total Students. Discontinued Students. Percentage = b/a. Final Score (out of 30) - based on the scaling logic discussed before.

*   **CSAT Feedback:**
    *   **Columns:** Regions, Branch Types, Streams, Branch Codes, Branch Names, Faculty ID, Faculty Name, Subjects, Student Count, Faculty Feedback Rating (out of 5), Score (Out of 20).
    *   **Details:** Student Count - Number of students who gave feedback for the subject taught by the faculty. Rating (out of 5) - Average Rating across all questions for this subject. Average Feedback (out of 5). Final Score (out of 20) - based on scaling the above average feedback score out of 20.

#### 5.4.5 Mapping Visuals

*   **Faculty-Batch Mapping:**
    *   **Columns:** Faculty ID, Faculty Name, Region, Stream, Branch Type, Branch Code, Branch Name, Subject, Batch Name, Lecture Count.
    *   **Details:** This gives a list of all batches taught by the faculty during this period along with the number of lectures taken for each batch.

*   **Faculty-Test Mapping:**
    *   **Columns:** Faculty ID, Faculty Name, Region, Stream, Branch Type, Branch Code, Branch Name, Subject, Test No, Exam Date.
    *   **Details:** This gives a list of all the tests which have contributed to the calculation of Student Test Performance score for this faculty.

## 6. Technical Stack

*   **Data Lake:** AWS (Athena, Glue, etc.)
*   **Reporting:** AWS Quicksight

## 7. Risks and Mitigations

*   **Grievance Redressal Mechanism:**
    *   **Risk:** There will be thousands of queries. PST team will not be the point of contact for this.
    *   **Mitigation:**
        *   GTM should have Training.
        *   FAQs should be provided.
        *   Academic Team PoCs for L1 Grievance Redressal.
        *   Raw data reports for these PoCs part of Product.
        *   GTM should have training for academic PoCs.
*   **Faculty information for PTMs:**
    *   **Mitigation:** Distribute PTM to all faculties of that batch.
*   **Availability of manual data:**
    *   **Mitigation:** (No specific mitigation mentioned in the document, but implies a need for a process to collect manual data if manual KPIs are included in future phases).
*   **Lectures, Tests being scheduled in Phoenix:**
    *   **Mitigation:** (No specific mitigation mentioned, implies this is a dependency).
*   **NPS/CSAT survey continues being conducted in exact same format/template:**
    *   **Mitigation:** (No specific mitigation mentioned, implies this is a dependency).
*   **Test Attendance for non SOE stream:**
    *   **Mitigation:** (No specific mitigation mentioned, implies this is a future consideration).

## 8. Roll Out Plan

*   **Intimation:** First intimation Email to be sent only after dev signoff on data availability and sanity for all parameters.
*   **Roll Out:**
    *   Email to faculty.
    *   Training to faculty.
    *   Training to Academic L1 support PoCs.
*   **Performance Measurement for HR:** (No specific details provided in the document, but implies a phase for HR to measure performance post-rollout).

