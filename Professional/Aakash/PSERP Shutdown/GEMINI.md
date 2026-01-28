# PSERP Shutdown Project

## Project Overview

The PSERP Shutdown project is a critical initiative to migrate all remaining modules and datasets from the legacy PeopleSoft ERP (PSERP) to the new Phoenix ERP system. This migration is essential for decommissioning the old system by the March 31 deadline.

## Core Objectives

*   **Finance Migration**: Complete the migration of all Finance-related modules to Phoenix.
*   **Analytics Continuity**: Ensure all analytics datasets and reports currently powered by PSERP data are migrated to use Phoenix as the source.
*   **System Decommissioning**: Fully shut down the PeopleSoft environment by March 31.

## Key Stakeholders

*   **Engineering**: Responsible for the backend schema migration and API updates.

*   **Finance Team**: Primary users of the Finance modules.
*   **Analytics Team**: Responsible for updating datasets and reports.

## Current Focus

*   **Task**: Complete Planning & Schedule Meetings.
*   **Status**: Initial project structure created; planning in progress.
*   **Next Step**: 
    *   Schedule meetings with Finance and Engineering for KT and requirements gathering.
    *   Identify critical datasets for migration.
    *   Finalize the migration roadmap and schedule.

## Migration Strategy: QuickSight User Management

### Current State (Old ERP)
*   **Logic**: Users have Roles (starting with `QS*`) and Branch Access.
*   **Process**:
    *   Daily Sync: ERP Tables -> Data Lake.
    *   Script: Checks for new QS roles -> Creates QS User -> **Selenium Login** (to prevent credential expiry) -> Emails credentials.
    *   RLS: Row Level Security table created based on ERP branch access.
    *   Groups: Users added/removed from QS groups based on ERP roles.

### Target State (Phoenix ERP)
*   **Structure**: Project -> User -> Role (1 per project) -> Security Group (Branch Access).
*   **Migration Plan**:
    *   **Requirements for Phoenix Team**:
        1.  **Multiple Roles**: Must support multiple roles per user for the "QuickSight" project (currently restricted to 1).
        2.  **Data Migration**: Migrate Users, Roles, and Branch Access (mapped to Security Groups) from Old ERP to Phoenix.
    *   **Execution**: Point existing scripts to synced Phoenix tables instead of Old ERP.

### Handling Data Discrepancies (Branch Access)
*   **Issue**: Branch access differs between Old ERP and Phoenix for common users.
*   **Strategy**:
    1.  **Identify**: Find users who will lose access to active branches in the move.
    2.  **Notify**: Send personalized emails (via Google Sheet extension) warning of access loss.
    3.  **Support**: Provide link to Support Portal to fix Phoenix access. Warn Support Team ahead of time.
    4.  **Reminders**: Scheduled reminders leading up to migration.

## Detailed Documentation
*   (To be added as documents are created)
