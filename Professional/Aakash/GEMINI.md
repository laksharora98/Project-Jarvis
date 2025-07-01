# Professional Work: Aakash

This directory contains professional work related to Aakash Educational Services Limited, organized by project. Each project folder will have its own `GEMINI.md` file containing high-level project-specific context and references to detailed documentation.

-   **Faculty Scorecard**: A project to build a comprehensive leaderboard for faculty performance and engagement.
-   **Stock Report**: A project to fix bugs and refactor the stock issuance report.

## Key Systems & Schemas

*   **Phoenix:** The current, primary internal ERP system at Aakash. It manages the entire student lifecycle, including enrollment, batch management, scheduling, stock issuance, fees, payments, etc.
    *   **`phoenix-authentication_service`:** Handles user authentication and authorization for the Phoenix ERP system.
*   **PeopleSoft (pserp/csprod):** The legacy ERP system. Many processes and data are still synced back to PeopleSoft from Phoenix, and some reports or queries may still rely on its databases.
    *   **`pserp-curriculum-management`:** A PeopleSoft schema related to course and curriculum data.
    *   **`csprod`:** A general PeopleSoft production schema.
    *   **`psquery_derived_tables`:** A schema containing tables derived from PeopleSoft queries, likely for reporting or specific business logic.
*   **SAP:** Another ERP system used within the company. Some data in Phoenix may have corresponding values or identifiers in SAP.
*   **`intern_hands_on`:** An intermediate schema used for various tables, including some feeding into reports.

## Key Terminology

### Stock Transaction Types
*   **PSID_ISSUANCE:** A material is issued to a student.
*   **PSID_RETURN:** A material is returned by a student.
*   **BRANCH_ISSUANCE:** A material is issued to a branch for internal purposes.
*   **BRANCH_RETURN:** A material is returned by a branch to the central inventory.

### General Terms
*   **PSID (Phoenix Student ID):** A unique identifier for each student in the Phoenix system.
*   **Application ID:** A unique identifier for each course or product a student purchases. A single PSID can have multiple Application IDs.
*   **Business Unit:** Represents an Aakash branch or a virtual unit for bookkeeping (e.g., for distance learning programs).
*   **Term:** Indicates the start and end year of a course. For example, a `term_value` of '2527' represents a two-year course starting in mid-2025 and ending in 2027.
*   **Academic Career:** The type of course a student is enrolled in. Key values include:
    *   **RCC (Regular Classroom Course):** Traditional, in-person classroom courses.
    *   **HYB (Hybrid Courses):** A mix of online and in-person learning.
    *   **ICON (Aakash Digital):** Fully online courses.
    *   **DLP (Distance Learning Program):** Correspondence courses.
*   **Stream / Acad Group:** The academic stream of the course.
    *   **SOM (School of Medical):** Medical stream.
    *   **SOE (School of Engineering):** Engineering stream.
    *   **SOF (School of Foundations):** Foundation courses (e.g., for junior classes).
*   **Course Attributes:** Courses have many attributes to define their characteristics. Column names in tables can be ambiguous (e.g., `course_attribute`) and may not specify which attribute is being referenced. Some known attributes and their values include:
    *   **Category:** `OYCR` (One Year), `TYCR` (Two Year), `MSCR` (Miscellaneous Charge), etc.
    *   **Corp:** A combination of category and stream, e.g., `TYCRM` (Two Year Course Medical), `RPTRE` (Repeater Engineering).
*   **Batch (Primary/Secondary):**
    *   **Primary Batch:** A default, largely redundant batch assignment.
    *   **Secondary Batch:** The primary batch used for scheduling classes, tests, and other activities. A student's application can only be in one secondary batch at a time.
*   **Program Action:** The status of a student's application. Key statuses include:
    *   **APPL (Applied):** Initial status when an application is created.
    *   **MATR (Matriculated):** The student has paid the first installment and their learning has begun. Only MATR applications can be assigned to a secondary batch.
    *   **IBTR (Inter-Branch Transfer):** The student has changed their branch.
    *   **CRCG (Course Change):** The student has changed their course.
    *   **STCG (Stream Change):** The student has changed their stream.
    *   **BTCG (Batch Change):** The student has changed their batch.
    *   **FOLO (Follow-up):** The student is late on an installment payment.
    *   **DISC (Discontinued):** The student has not paid their fees after follow-up.
    *   **RADM (Readmission):** A student who was discontinued has been readmitted.

Gemini should proactively update these `GEMINI.md` files based on our discussions, ensuring they serve as an index to all relevant project documentation.