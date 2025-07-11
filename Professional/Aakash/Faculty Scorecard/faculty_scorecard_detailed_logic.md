# Faculty Scorecard: Detailed Business Logic Explainer

This document provides a comprehensive, step-by-step explanation of the business logic used to build the Faculty Scorecard. It is designed for a non-technical audience to understand how the final scores are calculated, from the raw data to the final ranking.

## Guiding Principles

The scorecard is built on three core principles to ensure the evaluation is as fair, reliable, and meaningful as possible:

1.  **Causality:** A faculty member can only be credited or debited for a student's outcome if they have had a significant, measurable influence on that student.
2.  **Statistical Reliability:** Scores are only calculated when there is enough data to make them statistically sound. This prevents outliers and random chance from unfairly skewing the results.
3.  **Fair Comparison:** Performance is measured relative to a faculty member's true peers. This means comparing faculty who teach similar students in similar situations, rather than applying a one-size-fits-all benchmark.

---

## Part 1: Identifying the Foundational Data

This section explains how we gather and prepare the essential data before any calculations can be made.

### Step 1: Defining the Analysis Period
First, we establish the time frame for the entire analysis.
*   **Logic:** A global start and end date are defined. For the current scorecard, this is from **July 10, 2024, to July 9, 2025**. All subsequent calculations and data points must fall within this period.

### Step 2: Identifying Eligible Faculty
We create a master list of all faculty members who are eligible to be included in the scorecard.
*   **Logic:** We select all **active** faculty members from the HR system (HONO) with roles like "Faculty" or "Academic Head" in the "Academics" sub-business unit. This ensures we are only evaluating current, relevant teaching staff.

### Step 3: Gathering Student Course Information
We create a master list of all relevant student course enrollments.
*   **Logic:** We select all student applications that are for long-term courses (e.g., one-year, two-year courses) and ignore shorter, miscellaneous courses. We also determine the current status of each application:
    *   **Active:** The student is currently enrolled and their course term extends beyond the scorecard period.
    *   **Completed:** The student's course term finished within the scorecard period.
    *   **Left Out:** The student's application was discontinued.

### Step 4: Unifying Test and Feedback Data
To make calculations easier, we standardize the data from various sources.
*   **Test Attempts:** We gather all student test scores from the `testplayer` system for a specific, curated list of important tests.
*   **Test Attendance:** We gather all records of whether a student attempted or missed their assigned tests.
*   **Feedback:** We collect all student feedback ratings from the `Aakash Classroom Experience` survey system and standardize the subject names (e.g., 'Social Studies' becomes 'Social Science').

---

## Part 2: The Core Logic - Mapping a Faculty to a Student

This is the most critical step in the scorecard. It determines which students a faculty is responsible for, ensuring we only attribute outcomes where there is a clear causal link.

### The "Meaningful Engagement" Rule
A faculty member is only considered to have had a meaningful influence on a student if they meet two conditions:
1.  **Teaching Threshold:** The faculty must have taught the student for **more than 25%** of the student's total classes for a specific subject.
2.  **Minimum Class Count:** The faculty must have taught the student for **more than 8 classes** in that subject.

### The "Contiguous Teaching Block"
If the above conditions are met, we identify the exact start and end dates of their teaching relationship.
*   **Logic:** We look at all the class dates for that faculty-student-subject combination. If there is a gap of **more than 30 days** between classes, we consider it a new, separate "teaching block." This results in one or more distinct mapping periods, each with its own `mapping_start_date` and `mapping_end_date`.

**Outcome:** This process gives us a precise record of every student a faculty taught, for which subject, and for exactly how long. This `faculty_student_mapping` is the foundation for every KPI calculation that follows.

---

## Part 3: Calculating the Key Performance Indicators (KPIs)

For each KPI, we use the `faculty_student_mapping` to attribute student actions and outcomes to the responsible faculty member. We also apply an **attribution window**—a grace period after the `mapping_end_date` where a faculty's influence is still considered valid.

### KPI 1: Test Performance (Weight: 10%)
*   **Objective:** Measure how well a faculty's students perform compared to their peers nationwide.
*   **Attribution Window:** 60 days.
*   **Calculation Steps:**
    1.  For every test in our considered list, we first calculate the **national average score** for each subject.
    2.  We then look at all the tests taken by a faculty's mapped students (within the teaching block + 60 days).
    3.  We count how many of those tests had a score **above the national average**.
    4.  The raw score is: `(Tests Above National Average / Total Attributed Tests) * 100`.
*   **Minimum Data:** Requires at least 10 attributed student test results.

### KPI 2: Test Attendance (Weight: 5%)
*   **Objective:** Measure how consistently a faculty's students attempt their assigned tests.
*   **Attribution Window:** 60 days.
*   **Calculation Steps:**
    1.  We identify all tests assigned to a faculty's mapped students (within the teaching block + 60 days).
    2.  We count how many of those assigned tests were actually **attempted**.
    3.  The raw score is: `(Tests Attempted / Total Tests Assigned) * 100`.
*   **Minimum Data:** Requires at least 10 attributed assigned tests.

### KPI 3: Student Class Attendance (Weight: 5%)
*   **Objective:** Measure the average attendance rate in a faculty's classes.
*   **Attribution Window:** 0 days (only classes during the mapping period).
*   **Calculation Steps:**
    1.  We look at every class taught by the faculty to their mapped students.
    2.  We count the total number of student-days possible and the number of student-days where students were present.
    3.  The raw score is: `(Total Present Student-Days / Total Possible Student-Days) * 100`.

### KPI 4 & 5: Compliance (Syllabus & Class Attendance) (Weight: 10% & 5%)
*   **Objective:** Measure a faculty's diligence in completing administrative tasks.
*   **Attribution Window:** 0 days.
*   **Calculation Steps:**
    1.  We count the total number of unique lectures a faculty delivered.
    2.  We count how many of those lectures had the **syllabus marked** and **class attendance marked** in the system.
    3.  The raw scores are:
        *   Syllabus Compliance: `(Syllabus Marked Count / Total Lectures) * 100`.
        *   Attendance Compliance: `(Attendance Marked Count / Total Lectures) * 100`.

### KPI 6: Student Feedback (Weight: 15%)
*   **Objective:** Measure student satisfaction with a faculty's teaching.
*   **Attribution Window:** 30 days.
*   **Calculation Steps:**
    1.  We gather all feedback ratings (from 1 to 5) given by a faculty's mapped students (within the teaching block + 30 days).
    2.  We calculate the **average rating**.
    3.  To convert this to a 0-100 scale, we use the formula: `((Average Rating - 1) / 4) * 100`.
*   **Minimum Data:** Requires at least 5 feedback responses.

### KPI 7: Student Retention (Preventing "Left Out") (Weight: 10%)
*   **Objective:** Measure a faculty's ability to keep students engaged and prevent them from leaving Aakash.
*   **Attribution Window:** 90 days.
*   **Calculation Steps:**
    1.  First, we identify a "true" left-out event. A student is only considered "Left Out" if they discontinue their course **and** are not actively enrolled in any other Aakash course at the same time.
    2.  We then check if this "left out" date falls within a faculty's teaching block + 90 days.
    3.  The raw score is calculated based on the number of students who were **not** "Left Out": `((Total Mapped Students - Attributed Left Out Students) / Total Mapped Students) * 100`.
*   **Minimum Data:** Requires the faculty to have taught at least 10 students.

### KPI 8: Student Conversion (Internal Conversion) (Weight: 10%)
*   **Objective:** Measure a faculty's influence on a student's decision to re-enroll for a subsequent course.
*   **Attribution Window:** 90 days.
*   **Calculation Steps:**
    1.  We identify a successful conversion event: a student completes their course and enrolls in a new course for a future term.
    2.  We attribute this success to the faculty if the student's re-enrollment date is within the faculty's teaching block + 90 days for the *initial* course.
    3.  The raw score is: `(Attributed Converted Students / Total Mapped Students) * 100`.
*   **Minimum Data:** Requires the faculty to have taught at least 10 students.

---

## Part 4: Calculating the Final Score

This is the final step where all the individual KPI scores are combined into a single, final score and a national rank.

### Step 1: Normalizing Scores with Percentiles
A raw score of "80%" can mean different things for different KPIs. To solve this, we convert every raw KPI score into a **percentile rank**.
*   **Logic:** A faculty's raw score is compared to the raw scores of all other faculty. The percentile indicates the percentage of peers they outperformed. For example, a percentile rank of 92 means the faculty scored higher than 92% of other faculty for that specific KPI.
*   **Group-Based Ranking:** For the Test Attendance, Retention, and Conversion KPIs, this percentile ranking is done *within the faculty's stream* (e.g., SOM vs. SOM, SOE vs. SOE). This ensures a fairer, apples-to-apples comparison. For all other KPIs, the ranking is done nationally.

### Step 2: Calculating the Weighted Final Score
We then calculate the final score by taking a weighted average of all the percentile ranks.
*   **Logic:** Each KPI's percentile rank is multiplied by its assigned weight (e.g., Test Performance percentile * 10% + ... + Conversion percentile * 10%).
*   **Handling Missing Scores:** If a KPI score is null (due to not meeting the minimum data threshold), the final weighted score cannot be calculated and will also be null. There is no redistribution of weights. A faculty must have a valid score for all KPIs to receive a final rank.

### Step 3: Final Ranking
Finally, all faculty with a valid, non-null final score are ranked nationally.
*   **Logic:** The faculty are sorted in descending order based on their `final_score`. A `DENSE_RANK` is used to assign the final national rank. A faculty will not receive a final score or rank if any of their individual KPI scores are null. This can happen if they do not meet a KPI's minimum data threshold or if they could not be mapped to any students based on the engagement rules.

---

## Appendix: Test Selection Logic

The tests included in the scorecard (`tests_considered`) are not all tests conducted at Aakash. They are a curated list of the most significant and relevant tests for measuring student performance.

The selection was based on the `test_type` metadata for each stream. The following test types were included:

*   **School of Medical (SOM):** Practice Test, Term Exam, AIATS, Fortnightly Tests
*   **School of Engineering (SOE):** Unit Test, Term Exam, AIATS
*   **School of Foundations (SOF):** Fortnightly Subjective Test, Term Exam, Cumulative Subjective Test, Objective Test, AIATS

A complete list of the exact `test_digit_id` values used for the scorecard can be found here:
*   **[Placeholder: Link to the file containing the list of test_digit_ids]**
