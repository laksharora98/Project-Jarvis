# Faculty Scorecard: KPI Definitions for Business Users

This document explains the business logic for each Key Performance Indicator (KPI) used in the Faculty Scorecard. The goal is to provide a clear, non-technical understanding of how faculty performance is measured.

---
### Scoring Philosophy: Fairness and Balance

To ensure every KPI has a fair impact on the final score, the scorecard uses a **percentile ranking system**.

**What this means:** Instead of using a raw score for a KPI (e.g., 85% syllabus compliance), the score is compared to all other faculty. A percentile rank is then assigned.

*   **Example:** A **95th percentile rank** in Syllabus Compliance indicates that a faculty member performed better than 95% of their peers in that specific area.

This method ensures that KPIs with naturally low scores (such as student conversion, where 5% might be an excellent score) have the same potential to impact the final ranking as KPIs with naturally high scores. It levels the playing field and focuses on performance relative to peers.

---
### Ensuring Reliable Scores: Minimum Data Requirements

To ensure scores are statistically meaningful, a KPI is only calculated if there is sufficient underlying data. If the data for a specific KPI is below a certain threshold, that KPI is not included in the faculty's final score calculation.

*   **Test Performance:** Requires at least 10 attributed student test results.
*   **Test Attendance:** Requires at least 10 attributed assigned tests.
*   **Student Feedback:** Requires at least 5 attributed student feedback responses.
*   **Student Retention & Conversion:** Requires the faculty to have taught at least 10 students.

---

### Attributing Student Performance to a Faculty Member

To ensure fairness, a student's performance is only measured if they have been meaningfully taught by a faculty member. This is determined as follows:

1.  **Meaningful Engagement:** A student is officially "mapped" to a faculty member for a specific subject only if that faculty has taught them for **more than 25%** of their total classes in that subject and for **more than 8 classes**.
2.  **Teaching Period:** This mapping creates a clear start and end date, defining the period when the faculty was actively teaching the student.
3.  **Attribution Window:** It is understood that a faculty's influence can last beyond their last class. Therefore, for certain KPIs, an **attribution window** is included after the teaching period ends.

This process ensures that a faculty's score is only impacted by the students they have genuinely influenced.

---
### Comparing Apples to Apples: Fair Peer Groups

For certain KPIs, comparing faculty across different academic streams (e.g., Engineering vs. Medical) may not be appropriate due to differing student behaviors. To address this, the scorecard uses group-based ranking.

*   **For Test Attendance, Retention, and Conversion:** A faculty's percentile rank is calculated only against other faculty in the same stream (e.g., SOE vs. SOE, SOM vs. SOM).

This makes the comparison as fair and relevant as possible.

---

## Academic Effectiveness

### 1. Test Performance (Weight: 10%)
*   **What it measures:** How well a faculty's students perform in tests compared to the national average.
*   **How it's calculated:** The system analyzes the tests taken by a faculty's mapped students. It calculates the percentage of those tests where the students' scores were higher than the national average score for that same test and subject. This raw score is then converted to a percentile rank.
*   **Attribution Window:** 60 days. A test is included if it was taken during the teaching period or within 60 days after the last class.

### 2. Student Class Attendance (Weight: 5%)
*   **What it measures:** The average attendance rate in a faculty's classes.
*   **How it's calculated:** This is the percentage of students, on average, who were present for each class taught by the faculty. The raw score is then converted to a percentile rank.
*   **Attribution Window:** 0 days. Only classes taught during the exact teaching period are considered.

### 3. Test Attendance (Weight: 5%)
*   **What it measures:** How consistently a faculty's students attempt their assigned tests.
*   **How it's calculated:** This is the percentage of assigned tests that were actually attempted by the faculty's mapped students. The raw score is then converted to a percentile rank.
*   **Attribution Window:** 60 days. A test is included if it was assigned during the teaching period or within 60 days after the last class.

---

## Compliance

### 4. Syllabus Compliance (Weight: 10%)
*   **What it measures:** How consistently a faculty updates the system with the syllabus they have covered.
*   **How it's calculated:** This is the percentage of a faculty's total lectures for which they have marked the syllabus topics as "completed" in the system. The raw score is then converted to a percentile rank.
*   **Attribution Window:** 0 days. Only lectures delivered during the teaching period are considered.

### 5. Class Attendance Compliance (Weight: 5%)
*   **What it measures:** How consistently a faculty marks student attendance in the system.
*   **How it's calculated:** This is the percentage of a faculty's total lectures for which they have marked student attendance in the system. The raw score is then converted to a percentile rank.
*   **Attribution Window:** 0 days. Only lectures delivered during the teaching period are considered.

---

## Student Feedback

### 6. Student Feedback (Weight: 15%)
*   **What it measures:** The average satisfaction score students give to a faculty member.
*   **How it's calculated:** This is the average rating (on a scale of 1 to 5) that a faculty receives from their mapped students through official feedback surveys. The raw score is then converted to a percentile rank.
*   **Attribution Window:** 30 days. Feedback is included if it was submitted during the teaching period or within 30 days after the last class.

---

## Student Retention

### 7. Student Retention (Left Out) (Weight: 10%)
*   **What it measures:** A faculty's ability to retain students and prevent them from leaving Aakash.
*   **How it's calculated:** This score is based on the percentage of a faculty's mapped students who did **not** discontinue their studies with Aakash. A higher percentage (fewer students leaving) results in a higher score. The raw score is then converted to a percentile rank *within the faculty's stream*.
*   **Attribution Window:** 90 days. A student leaving is attributed to the faculty if the student officially discontinues during the teaching period or within 90 days after the last class.

### 8. Student Retention (Internal Conversion) (Weight: 10%)
*   **What it measures:** A faculty's influence on a student's decision to continue their journey with Aakash by enrolling in a new course.
*   **How it's calculated:** This is the percentage of a faculty's mapped students who, after completing their course, successfully enrolled in a subsequent course at Aakash. The raw score is then converted to a percentile rank *within the faculty's stream*.
*   **Attribution Window:** 90 days. A conversion is attributed to the faculty if the student enrolls in the next course within 90 days of the faculty's teaching period ending.