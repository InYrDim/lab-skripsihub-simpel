# BUSINESS_RULES.md: SkripsiHub

## Core Business Rules

**BR-01:** A student may submit a maximum of three distinct thesis titles in a single submission proposal.

**BR-02:** A student cannot create a new submission while an existing submission is in any active review state (`Pending Admin Review`, `Pending Validator Review`). A new submission is only permitted after the current submission reaches a terminal state (`Approved` or `Rejected`).

**BR-03:** Only one submission per student may be in active review at any given time.

**BR-04:** An admin must assign a submission to exactly one validator before the submission can proceed to validator review.

**BR-05:** A validator must select exactly one of the three proposed titles as the approved title when approving a submission. Partial or multi-title approval is not permitted.

**BR-06:** A validator must provide mandatory rejection reasoning (text feedback) when rejecting a submission. Rejection without feedback is not allowed.

**BR-07:** When a validator rejects a submission, the submission returns to the student with rejection feedback. The student may then submit a new proposal with up to three new titles.

**BR-08:** An approval letter is automatically generated and stored immediately upon validator approval. The letter is immutable and serves as the official record of thesis title approval.

**BR-09:** An approval letter must contain: student name, student ID, approved thesis title, approval date, and validator name.

**BR-10:** A student may download their approval letter only after their submission has reached the `Approved` state.

**BR-11:** All submissions and their complete history (including rejection feedback and status transitions) must be retained in the system for audit and record-keeping purposes.

**BR-12:** Notifications are triggered at the following key events: submission received (student), submission assigned to validator (validator), and final decision made (student).

## Domain Constraints & Validation Rules

### Submission Constraints

| Constraint | Rule | Enforcement |
|:---|:---|:---|
| Title Count | Each submission must contain 2–3 titles (minimum 2, maximum 3) | Form validation on submission |
| Title Uniqueness | Within a single submission, all three titles must be distinct | Form validation; reject duplicates |
| Title Length | Each title must be between 10 and 200 characters | Form validation |
| Title Language | Titles may be in Indonesian or English | No validation; accept both |
| Submission Frequency | A student may only have one active submission at a time | Database constraint + application logic |
| Resubmission After Rejection | A student may resubmit after rejection with a new set of titles | No cooldown period; immediate resubmission allowed |

### User & Role Constraints

| Constraint | Rule | Enforcement |
|:---|:---|:---|
| Student Account Status | Only active students may submit proposals | Account status check before submission |
| Validator Availability | Only validators with `active` status may be assigned submissions | Admin UI filters inactive validators |
| Admin Authority | Only users with the `admin` role may assign submissions to validators | Role-based access control (RBAC) |
| Validator Authority | Only users with the `validator` role may approve or reject submissions | RBAC on approval/rejection endpoints |

### Approval Letter Constraints

| Constraint | Rule | Enforcement |
|:---|:---|:---|
| Letter Generation Trigger | Letter is generated only upon validator approval | Automatic trigger in approval workflow |
| Letter Immutability | Once generated, an approval letter cannot be modified or deleted | Database constraint; no update/delete endpoints |
| Letter Storage | All approval letters are stored in AWS S3 with a reference in the database | Application logic enforces S3 storage |
| Letter Retention | Approval letters are retained indefinitely for audit purposes | No automatic deletion policy |

## Status Transitions & Workflow

### Submission Status Lifecycle

| Current State | Event/Action | New State | Notes/Side Effects |
|:---|:---|:---|:---|
| `Draft` | Student submits proposal with 2–3 titles | `Pending Admin Review` | Submission timestamp recorded; student notified (in-app + email) |
| `Pending Admin Review` | Admin assigns submission to a validator | `Pending Validator Review` | Validator is notified (in-app + email); submission timestamp updated |
| `Pending Validator Review` | Validator approves and selects one title | `Approved` | Approval letter auto-generated and stored in S3; student notified (in-app + email); letter download link provided to student |
| `Pending Validator Review` | Validator rejects with feedback | `Rejected` | Rejection feedback stored; student notified (in-app + email); student may immediately submit a new proposal |
| `Approved` | (Terminal state) | - | No further transitions; student may download letter; submission is archived |
| `Rejected` | (Terminal state) | - | Student may create a new submission; old submission remains in history for audit |

### Student Submission Eligibility

| Current Student State | Can Submit New Proposal? | Reason |
|:---|:---|:---|
| No active submission | ✅ Yes | Student is eligible to submit |
| Active submission in `Pending Admin Review` | ❌ No | Must wait for admin assignment or rejection |
| Active submission in `Pending Validator Review` | ❌ No | Must wait for validator decision |
| Previous submission `Approved` | ✅ Yes | Terminal state reached; new submission allowed |
| Previous submission `Rejected` | ✅ Yes | Terminal state reached; student may resubmit immediately |

## Role-Based Access Policies

### Student Permissions

| Action | Allowed | Notes |
|:---|:---|:---|
| Submit thesis title proposal (2–3 titles) | ✅ | Only if no active submission exists |
| View own submission status | ✅ | Real-time status visibility on dashboard |
| View own submission history | ✅ | All past submissions (approved, rejected) |
| View rejection feedback | ✅ | Only if submission was rejected |
| Download approval letter | ✅ | Only if submission is in `Approved` state |
| View other students' submissions | ❌ | No cross-student visibility |
| Assign submission to validator | ❌ | Admin-only action |
| Approve/reject submissions | ❌ | Validator-only action |

### Admin Permissions

| Action | Allowed | Notes |
|:---|:---|:---|
| View all submissions (all students) | ✅ | Master queue for oversight |
| View submission details | ✅ | Full proposal and metadata |
| Assign submission to validator | ✅ | Moves submission to `Pending Validator Review` |
| Create/update/deactivate student accounts | ✅ | User account management |
| Create/update/deactivate validator accounts | ✅ | User account management |
| Approve/reject submissions | ❌ | Validator-only action |
| Submit thesis proposals | ❌ | Student-only action |

### Validator Permissions

| Action | Allowed | Notes |
|:---|:---|:---|
| View assigned submissions | ✅ | Only submissions explicitly assigned by admin |
| View submission details | ✅ | Full proposal and student metadata |
| Approve submission (select one title) | ✅ | Triggers letter generation and student notification |
| Reject submission (with feedback) | ✅ | Mandatory feedback required; student notified |
| View all submissions | ❌ | Only assigned submissions visible |
| Assign submissions to other validators | ❌ | Admin-only action |
| Manage user accounts | ❌ | Admin-only action |
| Submit thesis proposals | ❌ | Student-only action |

## Notification Rules

### Submission Received (Student)

| Trigger | Recipient | Channel | Content |
|:---|:---|:---|:---|
| Student submits proposal | Student | In-app + Email | Confirmation of submission receipt; submission ID; next steps (admin review) |

### Submission Assigned to Validator (Validator)

| Trigger | Recipient | Channel | Content |
|:---|:---|:---|:---|
| Admin assigns submission to validator | Validator | In-app + Email | New submission assigned; student name; proposed titles; link to review submission |

### Final Decision - Approved (Student)

| Trigger | Recipient | Channel | Content |
|:---|:---|:---|:---|
| Validator approves submission | Student | In-app + Email | Approval confirmation; approved title; link to download approval letter |

### Final Decision - Rejected (Student)

| Trigger | Recipient | Channel | Content |
|:---|:---|:---|:---|
| Validator rejects submission | Student | In-app + Email | Rejection notification; validator feedback; option to resubmit with new titles |

## Approval Letter Generation & Storage

### Letter Content Template

The approval letter must include the following fields:

- **Header:** Institution name and logo
- **Title:** "Thesis Title Approval Letter" (or equivalent in Indonesian)
- **Student Information:** Full name, student ID, program/department
- **Approved Title:** The single title selected by the validator
- **Approval Date:** Date of validator approval
- **Validator Information:** Validator name and title
- **Signature Block:** Space for digital or printed signature
- **Footer:** System-generated timestamp and document reference number

### Letter Generation Process

| Step | Actor | Action | Output |
|:---|:---|:---|:---|
| 1 | Validator | Approves submission and selects one title | Approval decision recorded in database |
| 2 | System | Triggers letter generation service | HTML template populated with submission data |
| 3 | System | Converts HTML to PDF using Puppeteer | PDF file generated in memory |
| 4 | System | Uploads PDF to AWS S3 | S3 object URL stored in database; letter marked as generated |
| 5 | System | Sends notification to student | Student receives download link via email and in-app notification |
| 6 | Student | Downloads letter from system | PDF retrieved from S3 and delivered to student browser |

### Letter Storage & Retrieval

| Aspect | Rule |
|:---|:---|
| Storage Location | AWS S3 bucket dedicated to approval letters |
| File Naming | `approval_letter_{submission_id}_{timestamp}.pdf` |
| Retention Policy | Indefinite; no automatic deletion |
| Access Control | Only the student who owns the submission and admins may access the letter |
| Versioning | Only one letter per approved submission; no versioning |

## Data Retention & Audit Trail

**BR-13:** All submissions, including rejected ones, must be retained indefinitely for audit and compliance purposes.

**BR-14:** Every status transition, timestamp, and actor (admin, validator) must be logged in an immutable audit trail.

**BR-15:** Rejection feedback provided by validators must be preserved in full and remain accessible to the student and admins for the lifetime of the record.

**BR-16:** Approval letters, once generated, must never be modified, deleted, or regenerated. The original letter is the authoritative record.

## Concurrent Submission Prevention

**BR-17:** The system must implement database-level constraints and application-level checks to ensure a student cannot have more than one submission in an active review state simultaneously.

**BR-18:** If a student attempts to submit while an active submission exists, the system must reject the submission with a clear error message indicating the current submission status and expected resolution timeline.

## Validation & Quality Assurance

**BR-19:** All thesis titles must pass basic validation: non-empty, within character limits (10–200 characters), and free of SQL injection or XSS payloads.

**BR-20:** Admin assignment of submissions to validators must verify that the selected validator is active and has not exceeded a reasonable workload threshold (if applicable).

**BR-21:** Rejection feedback from validators must be non-empty and contain at least 10 characters to ensure meaningful, actionable feedback to students.
