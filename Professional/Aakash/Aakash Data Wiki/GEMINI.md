# Aakash Data Wiki

This project is a centralized, living knowledge base for the Aakash data ecosystem. Its purpose is to document all key data assets, business processes, and technical components to create a single source of truth for all users of the data platform.

The project is structured to map business logic to technical implementation, making it easy to understand not just *what* an asset is, but *why* it exists and *how* it's used.

## Index

### 1. [Business Domains](./Business%20Domains/)
This section documents the "why" behind the data. It will contain detailed explanations of key business processes at Aakash.
*   [Scholarship Tests](./Business%20Domains/Scholarship_Tests.md)

### 2. [Data Assets](./Data%20Assets/)
This is the technical catalog of our data ecosystem, organized by asset type.
*   [Tables](./Data%20Assets/Tables/)
*   [Glue Jobs](./Data%20Assets/Glue%20Jobs/)
*   [Quicksight Dashboards](./Data%20Assets/Quicksight/)

### 3. [Glossary](./Glossary.md)
A centralized dictionary of key business and technical terms to ensure consistent terminology across all documentation.

## Key Systems & Schemas

*   **Phoenix:** The current, primary internal ERP system at Aakash. It manages the entire student lifecycle, including enrollment, batch management, scheduling, stock issuance, fees, payments, etc.
    *   **`phoenix-authentication_service`:** Handles user authentication and authorization for the Phoenix ERP system.
*   **PeopleSoft (pserp/csprod):** The legacy ERP system. Many processes and data are still synced back to PeopleSoft from Phoenix, and some reports or queries may still rely on its databases.
    *   **`pserp-curriculum-management`:** A PeopleSoft schema related to course and curriculum data.
    *   **`csprod`:** A general PeopleSoft production schema.
    *   **`psquery_derived_tables`:** A schema containing tables derived from PeopleSoft queries, likely for reporting or specific business logic.
*   **SAP:** Another ERP system used within the company. Some data in Phoenix may have corresponding values or identifiers in SAP.
*   **`intern_hands_on`:** An intermediate schema used for various tables, including some feeding into reports.
*   **AWS S3:** The primary storage for the Aakash Data Lake.
*   **Salesforce (`salesforceanalytics`):** The CRM system. The `salesforceanalytics` schema holds data related to student registrations for events.
*   **Vyom (`testplayer`):** The external test platform. The `testplayer` schema contains data related to test attempts and scores.

## Current Focus

*   **Task**: Initialize the project structure.
*   **Status**: The directory structure and main `GEMINI.md` file have been created.
*   **Next Step**: Begin populating the wiki with initial documentation, starting with a high-value area like the Faculty Scorecard or Stock Report.
