# Faculty Scorecard Project - Product Requirements Document

## 1. Introduction
### 1.1 Project Overview
The Faculty Scorecard project aims to build a comprehensive leaderboard for all faculty at Aakash. This leaderboard will be based on data gathered from various sources, with parameters and their weightages to be defined. The project will also involve defining the calculation logic for each parameter's score and building a reporting mechanism for users to access the leaderboard and raw data.

### 1.2 Goals & Objectives
*   Improve overall faculty performance.
*   Identify top performers for recognition and other initiatives.
*   Pinpoint areas where training and development might be beneficial.

### 1.3 Scope

#### 1.3.1 In-Scope for V1
*   Calculation and display of all non-manual Key Performance Indicators (KPIs).
*   Implementation of all business logic for system-driven KPIs.
*   A basic report interface displaying the final faculty leaderboard.
*   Provision of all raw data necessary for users to understand and validate the calculated scores (i.e., "reverse engineer" the final score).

#### 1.3.2 Out-of-Scope for V1
*   Integration or handling of manual KPIs.
*   Automated, continuous data refresh jobs (e.g., weekly/monthly refreshes) – the initial release may involve a manual or less frequent refresh mechanism.

## 2. Key Performance Indicators (KPIs) - V1 Scope

Based on the `Faculty Scorecard V3.pdf`, the following non-manual KPIs are in scope for the initial release (V1):

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

### 2.4 Feedback

*   **Student Feedback - CSAT (80%) / NPS (20%)**
    *   **Weightage:** 15%
    *   **High-Level Definition:** Student feedback for subjects taught by the faculty (currently CSAT only, averaged across all survey questions).
    *   **Data Source:** MyAakash

## 3. Detailed KPI Definitions & Business Logic

This section provides detailed definitions, calculation logic, and considerations for each KPI, including those in scope for V1 and those planned for future phases (manual KPIs).

### 3.1 Manual KPIs (Future Scope)

The following KPIs are identified as manual in `Faculty Scorecard V3.pdf` and are out of scope for V1, but will be considered for future phases:

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
    *   **Weightage:** Not specified in V3.pdf table, but listed as manual.
    *   **High-Level Definition:** Manual assessment of counseling activities.
    *   **Remarks:** Faculty Employee ID, Score required.

*   **School Performance**
    *   **Weightage:** Not specified in V3.pdf table, but listed as manual.
    *   **High-Level Definition:** Manual assessment of school performance.
    *   **Remarks:** Faculty Employee ID, Score required.

### 3.2 Non-Manual KPIs (V1 Scope)

#### 3.2.1 Test Performance
*   **KRA:** Academic effectiveness
*   **Weightage:** 10%
*   **High-Level Definition:** Average percentage of tests in which a student performs better than the National Average in that subject.
*   **Data Sources:** Vyom, Scoretool
*   **Calculation Logic:**
    *   For every student and subject, calculate the percentage of tests where they scored above the national average.
    *   Compute the faculty's average percentage across all students.
    *   Convert to a score out of 100, then scale according to weightage.
*   **Test Types Considered (from V1.pdf):**
    *   SOE: Unit Test, Term Exam, AIATS
    *   SOM: Practice Test, Term Exam, AIATS, Fortnightly Tests
    *   SOF: Fortnightly Subjective Test, Term Exam, Cumulative Subjective Test, Objective Test, AIATS
*   **Key Considerations/Open Questions (from V3.pdf):**
    *   Causality: Should tests given by student during or just after being taught by this faculty be included? How to determine this?
    *   Test IDs are currently determined using a subjective manual process by getting all tests conducted in scoretool, vyom. This cannot be continued.

#### 3.2.2 Syllabus Compliance
*   **KRA:** Compliance
*   **Weightage:** 10%
*   **High-Level Definition:** Pace of syllabus completion or comparison with targets given against academic plan.
*   **Data Source:** Aakash Guru
*   **Calculation Logic (from V1.pdf):**
    *   Total classes scheduled in Phoenix (Apr - Nov)
    *   Percentage = (Lectures marked in AakashGuru) / (Total lectures)
    *   Scoring:
        *   ≥ 80% → Full marks
        *   ≤ 50% → Zero marks
        *   Scale as per weightage.
*   **Key Considerations/Open Questions (from V3.pdf):**
    *   Number of Planned Lecture equivalent syllabus completed / Target Planned Lecture completion for this academic plan, subject, duration?
    *   Distribute between all faculty who have taken lectures for that batch and subject in proportion of the number of lectures taken?

#### 3.2.3 Students Class Attendance
*   **KRA:** Academic effectiveness
*   **Weightage:** 5%
*   **High-Level Definition:** Average Attendance per class (excluding PTM) among the students mapped to this faculty.
*   **Data Sources:** AakashGuru, RFID, MS Teams, Crystal, Phoenix
*   **Calculation Logic (from V3.pdf):**
    *   Average Attendance per class (excluding PTM) among the students mapped to this faculty.
*   **Key Considerations/Open Questions (from V3.pdf):**
    *   Number of Lectures Marked / Total Lectures Scheduled? - Do Coordinators/EDP also mark attendance? Should attendance marked by them be included?

#### 3.2.4 Test Attendance
*   **KRA:** Academic effectiveness
*   **Weightage:** 5%
*   **High-Level Definition:** Average Attendance per test among students mapped to this faculty (initially for SOE stream only).
*   **Data Sources:** Phoenix, Vyom, Scoretool
*   **Calculation Logic (from V3.pdf):**
    *   Average Attendance per test among students mapped to this faculty.
*   **Key Considerations/Open Questions (from V3.pdf):**
    *   Only for SOE.
    *   Should causality be required similar to test performance?
    *   Scores for SOM and SOF?

#### 3.2.5 Student Feedback - CSAT (80%) / NPS (20%)
*   **KRA:** Feedback
*   **Weightage:** 15%
*   **High-Level Definition:** Student feedback for subjects taught by the faculty (currently CSAT only, averaged across all survey questions).
*   **Data Source:** MyAakash
*   **Calculation Logic (from V1.pdf):**
    *   Compute average student feedback for subjects taught by the faculty.
    *   Feedback is taken from CSAT surveys conducted in July & October via the MyAakash App.
    *   Scale the score as per weightage.
*   **Key Considerations/Open Questions (from V3.pdf):**
    *   Currently only CSAT is included. All questions answered across all surveys are averaged into a single score.
    *   Should causality be included similar to test performance?
    *   Should recent surveys weigh higher?
    *   Are all questions equally relevant?

#### 3.2.6 Student Retention - Left Out
*   **KRA:** Student Retention
*   **Weightage:** 10%
*   **High-Level Definition:** Percentage of students who left the program.
*   **Data Source:** Phoenix
*   **Calculation Logic (from V1.pdf):**
    *   Determine the percentage of students who left the program.
*   **Key Considerations/Open Questions (from V3.pdf):**
    *   Currently no causality is considered. Student may have discontinued before this faculty taught them.

#### 3.2.7 Student Retention - Internal Conversion
*   **KRA:** Student Retention
*   **Weightage:** 10%
*   **High-Level Definition:** ICE conversion will affect scores of faculty that taught in previous course.
*   **Data Source:** Phoenix
*   **Key Considerations/Open Questions (from V3.pdf):**
    *   Stream Wise normalisation may be required as generally ICE is lower for SOE than SOM.
    *   How to handle when data not available?

## 4. Eligibility Criteria

### 4.1 Faculty Eligibility for Scorecard Inclusion (from V1.pdf & V3.pdf)

*   Faculty members with fewer than 8 lectures taken for all batches during this period or missing data for any factor will not be included in the ranking.
*   Their list will be published separately in the second visual (Faculty not included in scorecard).
*   Other active faculties in HONO who haven't taken even a single lecture are published at the bottom (Faculty active in HONO with 0 classes).
*   All faculty who are eligible for a national rank based on the 8 classes threshold and have a score against all 4 parameters are present in the main scorecard visual.

### 4.2 Faculty Eligibility for National Ranking (from V1.pdf)

*   Faculty may teach multiple batches and subjects.
*   Faculty should have taken at least 8 classes for at least one student to be eligible for a national rank.

### 4.3 Key Considerations/Open Questions (from V3.pdf)

*   **How to get total list of faculty eligible for this?**
    *   All Active Faculty in HONO?
    *   How to remove faculty who are in corporate or school tie-up roles, etc.?
    *   Only faculty from Phoenix who are currently active in HONO and are not AD, DD etc. - only those roles that take classes in 1 branch.
*   **How to get faculty-student mapping?**
    *   Currently, faculty has to take at least 8 classes for a particular subject for a student for that student's attributes to affect this faculty's score for that subject.
*   **How to get faculty-batch mapping?**
    *   Currently, greater than or equal to 25% of total scheduled lectures for that batch.
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
    *   For every parameter, causality to be ensured - e.g., a survey taken in November should not affect a Faculty's score who started teaching the student in December.
*   **Will faculty scorecard require score for a duration across academic years?**
    *   No.

## 5. Reporting & Visualization

### 5.1 Delivery Platform

*   **Primary:** AakashGuru (No QS Report shared with Faculty. AakashGuru will be the final delivery platform.)
*   **Backup:** Looker (We can create Looker report as a backup.)

### 5.2 Report Refresh Frequency

*   As required (from V3.pdf).

### 5.3 Report Data Start Date

*   1 Apr 2024 - 31 Mar 2025 (from V3.pdf).

### 5.4 Report UI Details & Visuals

#### 5.4.1 Sheet 1: Scorecard (Main Leaderboard)

*   All faculty who are eligible for a national rank based on the 8 classes threshold and have a score against all 4 parameters are present in this visual.
*   There is an AIR Rank.
*   There is a dynamic rank based on the filters selected.
*   **Columns (from V3.pdf screenshot):** S.No, Regions, Branch Types, Branch Codes, Branch Names, Streams, Faculty ID, Faculty Name, Subjects, Student Test Performance, Syllabus Compliance, Student Retention, CSAT Feedback, Final Score (out of 70), Percentage, Rank, AIR.

#### 5.4.2 Sheet 2: Faculty not included in scorecard

*   This visual has all faculty who are not eligible for a rank because of one of the following reasons:
    *   They have not taken more than 8 lectures for any batch during this period.
    *   They have taken more than 8 lectures for at least one batch but at least one of the four parameters does not have a score due to one of following reasons:
        *   Student Test Performance - No student gave a test which had a section corresponding to the subject taught by this faculty.
        *   CSAT Feedback - No student gave feedback for the subject taught by this faculty.
*   **Columns (from V3.pdf screenshot):** Regions, Branch Types, Branch Codes, Branch Names, Streams, Faculty ID, Faculty Name, Subjects, Student Test Performance, Syllabus Compliance, Student Retention, CSAT Feedback, Final Score.

#### 5.4.3 Sheet 3: Faculty active in HONO with 0 classes

*   This visual has any faculty who was active in HONO during this period but hasn't taken even a single class during the same period.
*   These have been published so that the report is exhaustive.
*   Every faculty will be part of one of Visual 1, Visual 2 and Visual 3.
*   **Columns (from V3.pdf screenshot):** Faculty ID, Faculty Name, Role Name, Department, Branch Name, Date of Joining.

#### 5.4.4 Deep Dive Sheets (from V3.pdf screenshots)

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

#### 5.4.5 Mapping Visuals (from V3.pdf screenshots)

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

