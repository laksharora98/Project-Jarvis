# Faculty Scorecard: Understanding the KPIs

This document explains the business logic for each Key Performance Indicator (KPI) used in the Faculty Scorecard. The goal is to provide a clear, non-technical understanding of how faculty performance is measured.

---
### Our Scoring Philosophy: Fair and Balanced

To make sure every KPI has a fair impact on the final score, we use a **percentile ranking system**.

**What this means:** Instead of just using your raw score for a KPI (like your 85% syllabus compliance), we compare your score to all other faculty. We then give you a percentile rank.

*   **Example:** A **95th percentile rank** in Syllabus Compliance means you performed better than 95% of your peers in that specific area.

This method ensures that KPIs with naturally low scores (like student conversion, where 5% might be an excellent score) have the same potential to impact your final ranking as KPIs with naturally high scores. It levels the playing field and focuses on your performance relative to your peers.

---
### Ensuring Reliable Scores: Minimum Data Requirements

To make sure your scores are meaningful, we only calculate a KPI if there's enough data. If the data for a specific KPI is below a certain threshold (e.g., not enough student feedback), that KPI won't be included in your final score.

*   **Test Performance:** Requires at least 10 student test results.
*   **Test Attendance:** Requires at least 10 assigned tests.
*   **Student Feedback:** Requires at least 5 student responses.
*   **Student Retention & Conversion:** Requires you to have taught at least 10 students.

---

### How We Attribute Student Performance to a Faculty Member

To ensure fairness, we only measure a student's performance if they have been meaningfully taught by a faculty member. Here’s how we determine that:

1.  **Meaningful Engagement:** A student is officially "mapped" to a faculty member for a specific subject only if that faculty has taught them for **more than 25%** of their total classes in that subject and for **more than 8 classes**.
2.  **Teaching Period:** This mapping creates a clear start and end date, defining the period when the faculty was actively teaching the student.
3.  **Attribution Window:** We understand that a faculty's influence can last beyond their last class. Therefore, for certain KPIs, we include a "grace period" or **attribution window** after the teaching period ends.

This ensures that a faculty's score is only impacted by the students they have genuinely influenced.

---
### Comparing Apples to Apples: Fair Peer Groups

For some KPIs, like Student Retention and Conversion, comparing a faculty member in the Engineering stream to one in the Medical stream isn't always fair, as student behaviors can differ. To address this, we rank you against your direct peers.

*   **For Retention and Conversion:** Your percentile rank is calculated only against other faculty in your same stream (e.g., SOE vs. SOE, SOM vs. SOM).

This makes the comparison as fair and relevant as possible.

---

## Academic Effectiveness

### 1. Test Performance (Weight: 10%)
*   **What it measures:** How well a faculty's students perform in tests compared to the national average.
*   **How it's calculated:** We look at all the tests taken by a faculty's mapped students. We calculate the percentage of those tests where the students' scores were higher than the national average score for that same test and subject. This gives a raw score, which is then converted to a percentile rank.
*   **Attribution Window:** 60 days. A test is included if it was taken during the teaching period or within 60 days after the last class.

### 2. Student Class Attendance (Weight: 5%)
*   **What it measures:** The average attendance rate in a faculty's classes.
*   **How it's calculated:** This is the percentage of students, on average, who were present for each class taught by the faculty. This gives a raw score, which is then converted to a percentile rank.
*   **Attribution Window:** 0 days. Only classes taught during the exact teaching period are considered.

### 3. Test Attendance (Weight: 5%)
*   **What it measures:** How consistently a faculty's students are attempting their assigned tests.
*   **How it's calculated:** This is the percentage of assigned tests that were actually attempted by the faculty's mapped students. This gives a raw score, which is then converted to a percentile rank.
*   **Attribution Window:** 60 days. A test is included if it was assigned during the teaching period or within 60 days after the last class.

---

## Compliance

### 4. Syllabus Compliance (Weight: 10%)
*   **What it measures:** How consistently a faculty updates the system with the syllabus they have covered.
*   **How it's calculated:** This is the percentage of a faculty's total lectures for which they have gone into the system and marked the syllabus topics as "completed." This gives a raw score, which is then converted to a percentile rank.
*   **Attribution Window:** 0 days. Only lectures delivered during the teaching period are considered.

### 5. Class Attendance Compliance (Weight: 5%)
*   **What it measures:** How consistently a faculty marks student attendance in the system.
*   **How it's calculated:** This is the percentage of a faculty's total lectures for which they have marked student attendance in the system. This gives a raw score, which is then converted to a percentile rank.
*   **Attribution Window:** 0 days. Only lectures delivered during the teaching period are considered.

---

## Student Feedback

### 6. Student Feedback (Weight: 15%)
*   **What it measures:** The average satisfaction score students give to a faculty member.
*   **How it's calculated:** This is the average rating (on a scale of 1 to 5) that a faculty receives from their mapped students through official feedback surveys. This gives a raw score, which is then converted to a percentile rank.
*   **Attribution Window:** 30 days. Feedback is included if it was submitted during the teaching period or within 30 days after the last class.

---

## Student Retention

### 7. Student Retention (Left Out) (Weight: 10%)
*   **What it measures:** A faculty's ability to retain students and prevent them from leaving Aakash.
*   **How it's calculated:** This score is based on the percentage of a faculty's mapped students who did **not** discontinue their studies with Aakash. A higher percentage (fewer students leaving) results in a higher score. This gives a raw score, which is then converted to a percentile rank *within your stream*.
*   **Attribution Window:** 90 days. A student leaving is attributed to the faculty if the student officially discontinues during the teaching period or within 90 days after the last class.

### 8. Student Retention (Internal Conversion) (Weight: 10%)
*   **What it measures:** A faculty's influence on a student's decision to continue their journey with Aakash by enrolling in a new course.
*   **How it's calculated:** This is the percentage of a faculty's mapped students who, after completing their course, successfully enrolled in a subsequent course at Aakash. This gives a raw score, which is then converted to a percentile rank *within your stream*.
*   **Attribution Window:** 90 days. A conversion is attributed to the faculty if the student enrolls in the next course within 90 days of the faculty's teaching period ending.
