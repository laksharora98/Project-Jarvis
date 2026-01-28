# Global Task List & Backlog

*Last Updated: Jan 28, 2026 (On the train)*

## 🚨 Current Focus & Follow-ups
*   [ ] **[Handoff]** **Intern Task (QuickSight/PSERP)**: Follow up on Feb 2. (Requirements doc reviewed; Intern to add email campaign/reminders section and prepare 'missing users' list).
*   [ ] **[Work]** **Hotfix**: Vyom <> Scoretool Data Sync (Status: Resync triggered for ~75k attempts. Monitor completion).

## 🔥 High Priority Fires (Data Sync Issues)
*   [ ] **Superleap AppFlow Schema Evolution**: Follow up with Superleap team to enable automatic schema evolution (currently requires manual update + full load for new fields).
    *   **Field Addition**: Add `first_transaction_date` in Product Opportunities object.
*   [ ] **Vyom Direct Feed (Feb 2)**:
    *   **Eng Follow-up**: Check outcome of Kinesis/SQS discussion.
    *   **JIRA**: Create ticket for Vyom team with exact field specs for direct Data Lake feed.
    *   **Backfill**: Plan to push historical missing data to the new stream to union with legacy Scoretool data.
*   [ ] **Admission Forms Sync (Feb 2)**: Monitor email thread. Requested PSERP <-> Phoenix sync for Admission Forms to fix downstream breaks.

## 🏗️ Strategic Projects (The Big Rocks)
### 1. CDP Project (Customer Data Platform)
*   **Context**: Significantly delayed. High priority.
*   [ ] **Immediate**: Finalize PRD and send "Business Approval" email.
*   [ ] **Next**: Plan grooming for early Feb & deployment phases.

### 2. Data Lake 2.0 (Foundational Architecture)
*   **Goal**: Enforce "Write once, reuse everywhere" (Silver Layer).
*   **Motivation**: Recent Admission Form sync issues highlight the high cost of lacking a Silver layer (multiple downstream dependencies on raw PSERP tables).
*   [ ] **Action**: Ensure all new projects use the governed Silver Layer.

### 3. PSERP Shutdown (Migration)
*   **Immediate**: Create master tracking sheet (Product KT, Backend KT, Silver Layer, Dev, Prod).
*   [ ] **Action**: Plan KT meetings with stakeholders.
*   [ ] **Action**: Email Analytics Head to list "most used datasets" to prioritize.

## 🛠️ Operational & Maintenance
*   [ ] **Outstanding Report**: Ask team/intern to check for discrepancies (Old vs New) for UAT & Deploy.
*   [ ] **Phase Data Check**: Run specific check for Nabin Sir and update via email.
*   [ ] **PSERP Course Dump**: Create JIRA ticket for report enhancement (Logic change: Include all active terms ending in '26' or higher, not just starting with '26').
*   [ ] **Fee Outstanding Report**: Investigate why BU 'GJ653' shows as Closed in `aes_fee_outstnding_rpt_oprtn` on QuickSight.
*   [ ] **Fee Outstanding Report**: Investigate security deposit issues reported via email.
*   [ ] **Support Email (Outstanding Rpt)**: Investigate student discrepancy reported by support team.
*   [ ] **Timetable Attendance Report**: Investigate issue reported by support team.
*   [ ] **GST Report**: Follow up with Engineering for JIRA ticket (documentation of current issues).
*   [ ] **Webengage**: Get status update on validation + update regarding open query.

## 📥 Personal & Backlog (Preserved from Previous)
### Health & Lifestyle
*   [ ] **Pick up PNS CT Scan report** & Schedule ENT follow-up
*   [ ] Dental Appointment

### Finance
*   [ ] **Unlock SBI Account** (High Priority Recovery)

### Relationships
*   [ ] Respond to intimate email from colleague
*   [ ] **Wedding Feb**: Start planning for the next wedding.

### Career