### Data Platform Standards

#### 1. Scope & Database

*   These standards apply to the new **`curated`** database in the AWS Glue Data Catalog.
*   The `curated` database is the single source of truth for all analytics. All downstream systems (QuickSight, ML jobs, etc.) **must** use tables from this database.
*   Existing raw data tables are out of scope for these conventions.

#### 2. Naming Conventions

*   **Tables:**
    *   **Format:** `group_type_entity`
    *   **Components:**
        *   `group`: The business domain (e.g., `core`, `stock`, `finance`, `academics`).
        *   `type`: `dim` (for dimension tables) or `fact` (for event/transactional tables).
        *   `entity`: The business entity the table describes (e.g., `student`, `branch`, `issuance`).
    *   **Examples:**
        *   `core_dim_student`
        *   `stock_fact_issuance`
        *   `academics_dim_faculty`

*   **Columns:**
    *   **Format:** All column names **must** be in `snake_case`.
    *   **Timestamps:** Must be stored in **UTC**.
        *   For single points in time, the name must end with `_at` (e.g., `created_at`, `transaction_at`).
        *   For time ranges, use `_from` and `_to` suffixes (e.g., `valid_from`, `valid_to`).
    *   **Dates:** Must end with `_date` (e.g., `issuance_date`).
    *   **Booleans:** Must start with `is_` or `has_` (e.g., `is_active`, `has_returned_material`).

#### 3. Data Modeling Standards

*   **Handling Missing Values:**
    *   Missing or unknown data **must** be represented by `NULL`.
    *   Do not use placeholder values like `0`, `N/A`, or empty strings (`''`) to represent missing information, as these can be valid data points themselves and lead to incorrect calculations.

*   **No Nested Data:**
    *   Nested or semi-structured data (like JSON) from source systems **must** be flattened into discrete columns in `curated` tables.

#### 4. Operational Standards

*   **Zero-Downtime Refreshes:** Data refreshes must be atomic and ensure zero downtime. Tables in the `curated` database **must** remain available for querying at all times, even during the update process.

#### 5. QuickSight Dataset Standards

*   **Consolidate Datasets:** Create a small number of robust, well-managed datasets from the Curated Layer (e.g., one `Stock Management` dataset) rather than a new dataset for every analysis.
*   **Minimal Transformations:** All complex business logic, joins, and calculations should be performed in the data pipeline that creates the `curated` tables. Transformations in QuickSight should be minimal and used for display purposes only.
