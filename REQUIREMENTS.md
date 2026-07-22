# REQUIREMENTS.md: SkripsiHub

## Functional Requirements

### FR-01: Student Authentication
**MUST** allow students to log in using university-provided credentials (email/password or SSO integration).

- Acceptance Criteria:
  - Student can successfully authenticate with valid credentials and receive a JWT token.
  - Invalid credentials result in a clear error message without revealing whether email exists.
  - Session persists across page refreshes; logout clears all session data.

### FR-02: Student Dashboard & Submission Status
**MUST** display a prominent dashboard showing the current submission status and historical submission records.

- Acceptance Criteria:
  - Dashboard displays one of: `Pending Admin Review`, `With Validator`, `Approved`, `Rejected`, or `No Active Submission`.
  - Historical submissions are listed with date, status, and validator feedback (if rejected).
  - Status updates reflect in real-time or within 5 seconds of a state change.

### FR-03: Thesis Title Submission Form
**MUST** allow students to submit a proposal containing up to three distinct thesis titles in a single submission.

- Acceptance Criteria:
  - Form accepts exactly 1–3 titles; submission is rejected if fewer than 1 or more than 3 titles are provided.
  - Each title field accepts up to 500 characters and validates for non-empty, non-duplicate entries.
  - Form includes optional description/abstract field (max 2000 characters) for context.

### FR-04: Rejection Feedback Visibility
**MUST** allow students to view detailed rejection feedback provided by the Validator if their submission is rejected.

- Acceptance Criteria:
  - Rejected submissions display the validator's rejection reason in a dedicated section on the dashboard.
  - Feedback is read-only and includes the date of rejection and validator's name (if applicable).
  - Feedback is accessible from both the active submission view and historical records.

### FR-05: Approval Letter Download
**MUST** allow students to instantly download the generated approval letter (PDF) upon final approval.

- Acceptance Criteria:
  - Download button appears only when submission status is `Approved`.
  - PDF is generated within 5 seconds and contains student name, approved title, approval date, and institution letterhead.
  - PDF is stored in AWS S3 and remains accessible for at least 1 year.

### FR-06: Submission Blocking During Active Review
**MUST** prevent students from creating a new submission while one is actively in review.

- Acceptance Criteria:
  - Submit button is disabled with a tooltip explaining the reason when a submission is in `Pending Admin Review` or `With Validator` state.
  - New submission form is only accessible after the current submission reaches a final state (`Approved` or `Rejected`).
  - System enforces this at both UI and API levels.

### FR-07: Admin Dashboard & Submission Queue
**MUST** display a queue of new submissions awaiting initial admin review.

- Acceptance Criteria:
  - Admin dashboard shows submissions in `Pending Admin Review` state, sorted by submission date (oldest first).
  - Queue displays student name, submission date, and number of proposed titles.
  - Admin can filter by status, date range, or student name.

### FR-08: Admin Submission Assignment to Validator
**MUST** allow admins to review a submission and assign it to a specific Validator, transitioning the submission to `Pending Validator Review` state.

- Acceptance Criteria:
  - Admin can view full submission details (all 3 titles, student info, optional description).
  - Admin selects a Validator from a dropdown list of available validators.
  - Assignment action triggers an automated notification to the Validator and updates submission status to `Pending Validator Review`.
  - Assignment is logged with timestamp and admin user ID for audit purposes.

### FR-09: Admin Master Submission List
**MUST** provide admins with a master list of all submissions and their current status for tracking and oversight.

- Acceptance Criteria:
  - List displays all submissions across all statuses with columns: Student Name, Submission Date, Status, Assigned Validator, Last Updated.
  - List supports sorting by any column and filtering by status, date range, or validator.
  - List is paginated (50 records per page) and exports to CSV.

### FR-10: Admin User Account Management
**MUST** allow admins to manage Student and Validator user accounts (create, update, deactivate).

- Acceptance Criteria:
  - Admin can create new student/validator accounts with email, name, and role assignment.
  - Admin can update user details (name, email, role) and deactivate accounts (soft delete).
  - Deactivated accounts cannot log in; their submissions remain in the system for audit purposes.
  - Account creation/updates are logged with timestamp and admin user ID.

### FR-11: Validator Dashboard & Assigned Submissions
**MUST** display a queue of submissions specifically assigned to the Validator.

- Acceptance Criteria:
  - Validator dashboard shows only submissions in `Pending Validator Review` state assigned to that validator.
  - Queue displays student name, submission date, and number of proposed titles.
  - Validator can filter by submission date or student name.

### FR-12: Validator Submission Details View
**MUST** allow Validators to view the full details of an assigned submission, including all proposed titles.

- Acceptance Criteria:
  - Validator can view student name, all 3 proposed titles, optional description, and submission date.
  - View is read-only; no editing is permitted.
  - Validator can access this view from the dashboard queue or via a direct link.

### FR-13: Validator Approval/Rejection Decision
**MUST** allow Validators to make a binary decision: Approve (select one title) or Reject (with mandatory reasoning).

- Acceptance Criteria:
  - **Approve Path:** Validator selects one of the three proposed titles as the approved title. Selection is mandatory. Action is final and irreversible.
  - **Reject Path:** Validator enters rejection reasoning (min 10 characters, max 1000 characters). Reasoning is mandatory. Rejection is final.
  - Both actions update submission status and trigger automated notifications to the student.
  - Decision is logged with timestamp, validator user ID, and decision details.

### FR-14: Automatic Approval Letter Generation
**MUST** automatically trigger the generation and storage of the official approval letter upon Validator approval.

- Acceptance Criteria:
  - Letter is generated within 5 seconds of approval action completion.
  - Letter is a PDF based on a predefined HTML template, populated with student name, approved title, approval date, validator name, and institution details.
  - Letter is stored in AWS S3 with a unique identifier and remains accessible for download.
  - Letter generation failure is logged and triggers an alert to admins; student is notified of the issue.

### FR-15: Automated Notifications
**MUST** send automated in-app and email notifications to users at key status changes.

- Acceptance Criteria:
  - **Student Notifications:**
    - Submission received: Email + in-app notification within 1 minute of submission.
    - Assigned to validator: Email + in-app notification within 1 minute of assignment.
    - Final decision (approved/rejected): Email + in-app notification within 1 minute of decision.
  - **Validator Notifications:**
    - New submission assigned: Email + in-app notification within 1 minute of assignment.
  - **Admin Notifications:**
    - New submission received: In-app notification within 1 minute (email optional).
  - All notifications include relevant submission details (student name, submission ID, status).
  - Email delivery is tracked; failed deliveries are logged and retried up to 3 times.

### FR-16: Approval Letter Template & Generation
**MUST** generate approval letters as system-generated PDFs based on a predefined HTML template.

- Acceptance Criteria:
  - Template includes institution letterhead, student details, approved title, approval date, validator signature block, and official seal/stamp placeholder.
  - Template is configurable by admins (text content only; layout is fixed).
  - Generated PDF is professional-grade, printable, and compliant with institutional standards.
  - PDF generation uses Puppeteer and completes within 5 seconds.

### FR-17: Admin Authentication
**MUST** allow admins to log in using university-provided credentials with role-based access control.

- Acceptance Criteria:
  - Admin can authenticate with valid credentials and receive a JWT token with admin role claims.
  - Admin dashboard is only accessible to users with the `admin` role.
  - Invalid credentials result in a clear error message.

### FR-18: Validator Authentication
**MUST** allow validators to log in using university-provided credentials with role-based access control.

- Acceptance Criteria:
  - Validator can authenticate with valid credentials and receive a JWT token with validator role claims.
  - Validator dashboard is only accessible to users with the `validator` role.
  - Invalid credentials result in a clear error message.

### FR-19: Submission History & Audit Trail
**MUST** maintain a complete audit trail of all submission state changes and actions.

- Acceptance Criteria:
  - Every state transition (submission, assignment, approval, rejection) is logged with timestamp, user ID, and action details.
  - Students can view a timeline of their submission's status changes.
  - Admins can view a full audit log for any submission for compliance and troubleshooting purposes.
  - Audit logs are immutable and retained for at least 2 years.

### FR-20: In-App Notification Center
**MUST** provide an in-app notification center where users can view all notifications and mark them as read.

- Acceptance Criteria:
  - Notification center displays all notifications (read and unread) sorted by date (newest first).
  - Unread notifications are visually distinct (e.g., bold, highlighted).
  - Users can mark individual notifications as read or clear all notifications.
  - Notification center is accessible from the main navigation bar and shows an unread count badge.

---

## Non-Functional Requirements

| Category | Requirement | Measurable Target |
|:---|:---|:---|
| **Performance** | API Response Time | < 300ms (p95) for all endpoints |
| | Dashboard Page Load Time | < 2 seconds (first contentful paint) |
| | PDF Generation Time | < 5 seconds per document |
| | Database Query Time | < 100ms (p95) for standard queries |
| **Security** | Authentication Method | JWT with role-based claims (RBAC) |
| | Data Encryption in Transit | TLS 1.2+ for all HTTP/HTTPS communication |
| | Data Encryption at Rest | AES-256 encryption for sensitive data in MySQL |
| | Password Policy | Minimum 8 characters, uppercase, lowercase, number, special character |
| | Session Timeout | 30 minutes of inactivity; user must re-authenticate |
| | SQL Injection Prevention | Prepared statements and parameterized queries for all database operations |
| **Scalability** | Concurrent Users | System must support 500 concurrent users without performance degradation |
| | Database Connections | Connection pooling with max 100 connections; auto-scaling enabled |
| | File Storage Capacity | AWS S3 with unlimited scalability; initial quota 100 GB |
| | Request Rate Limiting | 100 requests per minute per user; 1000 requests per minute per IP |
| **Availability** | System Uptime | 99.5% monthly availability (max 3.6 hours downtime) |
| | Backup Frequency | Daily automated backups; retention for 30 days |
| | Disaster Recovery RTO | < 4 hours to restore from backup |
| | Disaster Recovery RPO | < 1 hour of data loss acceptable |
| **Usability** | Browser Compatibility | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| | Mobile Responsiveness | Fully functional on devices with screen width ≥ 320px |
| | Accessibility | WCAG 2.1 Level AA compliance (color contrast, keyboard navigation, screen reader support) |
| | UI Response Time | User interactions (clicks, form submissions) receive visual feedback within 200ms |
| **Reliability** | Error Rate | < 0.1% of requests result in 5xx errors |
| | Data Consistency | ACID compliance for all database transactions |
| | Notification Delivery Rate | ≥ 99% of notifications delivered within 5 minutes |
| **Maintainability** | Code Coverage | ≥ 80% unit test coverage for backend; ≥ 70% for frontend |
| | Documentation | API documentation (OpenAPI/Swagger), deployment guide, runbook for common issues |
| | Log Retention | Application logs retained for 90 days; audit logs for 2 years |

---

## Technical Constraints

### Technology Stack (Fixed)
- **Frontend:** React.js with Tailwind CSS + shadcn/ui
- **Backend:** Nest.js (Node.js) with TypeScript
- **Database:** MySQL 8.0+
- **Authentication:** JWT + RBAC
- **Document Generation:** Puppeteer
- **Email Service:** SendGrid
- **File Storage:** AWS S3
- **Hosting:** Vercel (frontend) + Railway (backend)
- **Monitoring:** Sentry for error tracking

### Infrastructure Constraints
- **Database Size Limit:** Initial MySQL instance limited to 100 GB; auto-scaling to larger instance if exceeded.
- **AWS S3 Quota:** 100 GB initial quota; additional storage provisioned on-demand.
- **Concurrent Connection Limit:** Railway backend limited to 500 concurrent connections; horizontal scaling required if exceeded.
- **Email Rate Limit:** SendGrid free tier limited to 100 emails/day; upgrade to paid tier if exceeded.

### Budget Constraints
- **Monthly Infrastructure Cost Cap:** USD 500 (Vercel, Railway, AWS S3, SendGrid, Sentry combined).
- **Development Timeline:** 12 weeks from kickoff to production launch.

### Regulatory & Compliance Constraints
- **Data Residency:** All data must be stored in Indonesia or Southeast Asia region (AWS ap-southeast-1).
- **Data Privacy:** Comply with Indonesian data protection regulations (if applicable); implement GDPR-like data retention and deletion policies.
- **Audit Requirements:** Maintain immutable audit logs for all submission state changes for institutional compliance.

### Integration Constraints
- **University Identity Provider:** System MUST support integration with university's existing LDAP/Active Directory if available; otherwise, manage credentials internally.
- **Email Domain:** All system-generated emails MUST use the institution's official email domain (e.g., @university.ac.id).

---

## Assumptions

### User & Organizational Assumptions
- The university will provide a definitive list of students, admins, and validators for initial account creation.
- Users have access to a modern web browser (Chrome, Firefox, Safari, Edge) and a stable internet connection (≥ 2 Mbps).
- The approval workflow (Student → Admin → Validator) is fixed and does not change per department or semester.
- The format and content of the approval letter template are standardized and pre-approved by the institution.
- Validators are available and responsive; average review time is 2–3 business days per submission.

### Technical Assumptions
- MySQL 8.0+ is available and properly configured with automated backups.
- AWS S3 bucket is pre-created and configured with appropriate IAM permissions.
- SendGrid API key is provisioned and verified for the institution's email domain.
- Vercel and Railway accounts are set up with CI/CD pipelines configured.
- DNS records are configured to point to Vercel (frontend) and Railway (backend).

### Process Assumptions
- Students submit thesis titles during a designated submission window (e.g., semester start); no submissions outside this window.
- Admins review submissions within 1 business day of receipt.
- Validators review assigned submissions within 3 business days.
- Rejected submissions can be resubmitted by students after addressing feedback; no limit on resubmission attempts.
- Approved submissions are final; no changes to approved titles are permitted.

### Language & Localization Assumptions
- Initial release supports Indonesian language for UI text, notifications, and templates.
- English language support is secondary and provided as a fallback.
- All system-generated documents (approval letters) are in Indonesian.

---

## Acceptance Criteria Summary by Role

### Student Role
| Requirement | Acceptance Criteria |
|:---|:---|
| Submit Titles | Can submit 1–3 titles; form validates and rejects invalid submissions. |
| View Status | Dashboard displays current status and historical records in real-time. |
| View Feedback | Rejected submissions display validator's feedback with date and validator name. |
| Download Letter | Approval letter downloads as PDF within 5 seconds; remains accessible for 1 year. |
| Submission Blocking | Cannot submit new proposal while one is in review; UI and API enforce this. |

### Admin Role
| Requirement | Acceptance Criteria |
|:---|:---|
| Review Queue | Dashboard displays submissions in `Pending Admin Review` sorted by date. |
| Assign Validator | Can select validator from dropdown; assignment triggers notification and status update. |
| View All Submissions | Master list displays all submissions with filtering, sorting, and CSV export. |
| Manage Accounts | Can create, update, deactivate student/validator accounts; changes are logged. |

### Validator Role
| Requirement | Acceptance Criteria |
|:---|:---|
| View Assigned | Dashboard displays only submissions assigned to that validator. |
| Review Details | Can view all submission details (titles, description, student info). |
| Approve | Can select one title as approved; action is final and triggers letter generation. |
| Reject | Can enter rejection reasoning (mandatory); action is final and triggers notification. |

---

## Design Decision Mappings

The following design decisions from the user interview are reflected in these requirements:

| Design Decision | Implementation in Requirements |
|:---|:---|
| **q1_submission_limit: max_3_unlimited** | FR-03 enforces exactly 1–3 titles per submission; students can resubmit after rejection (no limit on attempts). |
| **q2_approval_flow: conditional_admin_gate** | FR-08 requires admin assignment to validator before validator review; admin acts as gatekeeper. |
| **q3_rejection_workflow: new_submission_allowed** | FR-06 allows new submissions only after final decision; rejected submissions can be resubmitted. |
| **q4_notification_timing: custom** | FR-15 specifies custom notification timing: within 1 minute of key events (submission, assignment, decision). |
| **q5_letter_generation: auto_generate_instant** | FR-14 automatically generates letter upon approval; FR-05 allows instant download. |
| **q6_ui_priority: dashboard_priority** | All role-specific dashboards (FR-02, FR-07, FR-11) are the primary interface; all key actions are dashboard-centric. |

---

## Out of Scope

See PRD.md for the complete list of out-of-scope features. The following are explicitly NOT included in this release:
- Plagiarism detection integration.
- Direct messaging or chat functionality.
- Thesis advisor/mentor assignment.
- Full thesis document uploading and versioning.
- Scheduling for thesis defense or progress meetings.
- Grading or scoring modules.