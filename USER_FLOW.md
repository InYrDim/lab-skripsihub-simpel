# USERFLOW.md: SkripsiHub

## Overview

This document details the primary user flows and interactions within SkripsiHub. It captures the step-by-step actions, system responses, and alternative paths for the three core user journeys: Student Submission, Admin Review & Assignment, and Validator Review & Decision. Each flow is presented in a structured table format with accompanying pre/post-condition descriptions.

---

## Flow 1: Student Thesis Title Submission

### Description

A student logs into SkripsiHub and submits a proposal containing up to three distinct thesis titles. The system validates the submission, stores it, and transitions it to the `Pending Admin Review` state. The student receives a confirmation notification.

### Flow Table

| No | Actor | Action/Step | System Response | Alternative/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Student | Logs in with university credentials | System authenticates via JWT, displays student dashboard with submission status | Invalid credentials: Display error message, prompt retry |
| 2 | Student | Clicks "Submit New Thesis Title" button | System checks if student has an active submission in progress | Active submission exists: Display warning, block new submission, show current status |
| 3 | Student | Enters thesis title 1 in form field | Form validates input (non-empty, max 255 chars) | Invalid input: Display inline validation error |
| 4 | Student | (Optional) Enters thesis title 2 | Form validates input | Invalid input: Display inline validation error |
| 5 | Student | (Optional) Enters thesis title 3 | Form validates input | Invalid input: Display inline validation error |
| 6 | Student | Clicks "Submit" button | System validates all titles, creates submission record in DB with status `Pending Admin Review`, generates unique submission ID | Validation fails (e.g., all titles empty): Display error, prevent submission |
| 7 | System | (Automatic) Generates confirmation | In-app notification displayed to student; email sent via SendGrid with submission ID and expected timeline | Email delivery fails: Log error in Sentry, retry queue triggered |
| 8 | Student | Views dashboard | Dashboard refreshes, shows submission status as `Pending Admin Review` with submission ID and timestamp | N/A |

### Trigger
Student initiates submission via the "Submit New Thesis Title" button on the dashboard.

### Pre-conditions
- Student is authenticated and logged in.
- Student has no active submission currently in review (status is either `Approved`, `Rejected`, or no prior submission exists).
- Student has filled in at least one thesis title.

### Post-conditions
- Submission record is created in the database with status `Pending Admin Review`.
- Student receives in-app and email confirmation.
- Submission is now visible in the Admin queue.
- Student is blocked from creating a new submission until the current one reaches a final state.

---

## Flow 2: Admin Review & Validator Assignment

### Description

An admin reviews a submission from the queue, verifies its completeness, and assigns it to an available validator. The system transitions the submission to `Pending Validator Review` and notifies the assigned validator.

### Flow Table

| No | Actor | Action/Step | System Response | Alternative/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Admin | Logs in with admin credentials | System authenticates via JWT, displays admin dashboard with submission queue | Invalid credentials: Display error message, prompt retry |
| 2 | Admin | Views "Pending Admin Review" queue | System retrieves all submissions with status `Pending Admin Review`, displays list with student name, submission ID, submission date | No submissions in queue: Display empty state message |
| 3 | Admin | Clicks on a submission to open details | System displays full submission details: student info, all proposed titles, submission timestamp | Submission not found: Display error, redirect to queue |
| 4 | Admin | Reviews submission content for completeness | Admin performs manual verification (visual inspection) | Issues detected (e.g., incomplete data): Admin may request student to resubmit via email (manual process, out of system scope) |
| 5 | Admin | Clicks "Assign to Validator" button | System displays dropdown list of available validators (active, not overloaded) | No validators available: Display message, allow admin to defer assignment |
| 6 | Admin | Selects a validator from dropdown | System highlights selected validator | N/A |
| 7 | Admin | Clicks "Confirm Assignment" button | System updates submission status to `Pending Validator Review`, records validator assignment in DB, generates assignment timestamp | Assignment fails (DB error): Display error, log to Sentry, allow retry |
| 8 | System | (Automatic) Sends notification to validator | In-app notification displayed to validator; email sent via SendGrid with submission details and link to review | Email delivery fails: Log error, retry queue triggered |
| 9 | System | (Automatic) Sends notification to student | In-app notification: "Your submission has been assigned to a validator"; email sent with validator name and expected review timeline | Email delivery fails: Log error, retry queue triggered |
| 10 | Admin | Views updated queue | Submission no longer appears in `Pending Admin Review` queue; appears in "Assigned" or "In Progress" view | N/A |

### Trigger
Admin initiates assignment via the "Assign to Validator" button on a submission detail page.

### Pre-conditions
- Admin is authenticated and logged in.
- Submission exists with status `Pending Admin Review`.
- At least one validator is available and active in the system.
- Submission data is complete and valid.

### Post-conditions
- Submission status is updated to `Pending Validator Review`.
- Validator is assigned and receives notification.
- Student is notified of assignment.
- Submission appears in the validator's queue.
- Admin can no longer modify the assignment (immutable once confirmed).

---

## Flow 3: Validator Review & Final Decision (Approval Path)

### Description

A validator reviews an assigned submission and approves one of the proposed titles. The system automatically generates an approval letter, stores it, and notifies the student. The student can then download the letter.

### Flow Table

| No | Actor | Action/Step | System Response | Alternative/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Validator | Logs in with validator credentials | System authenticates via JWT, displays validator dashboard with assigned submissions queue | Invalid credentials: Display error message, prompt retry |
| 2 | Validator | Views "Pending Validator Review" queue | System retrieves all submissions assigned to this validator with status `Pending Validator Review`, displays list with student name, submission ID, assignment date | No submissions in queue: Display empty state message |
| 3 | Validator | Clicks on a submission to open details | System displays full submission details: student info, all proposed titles, submission history | Submission not found: Display error, redirect to queue |
| 4 | Validator | Reviews all proposed titles | Validator performs substantive review (visual inspection, academic judgment) | N/A |
| 5 | Validator | Selects "Approve" action | System displays radio button options for each proposed title | N/A |
| 6 | Validator | Selects one title as the approved title | System highlights selected title | No title selected: Display validation error, prevent submission |
| 7 | Validator | Clicks "Confirm Approval" button | System validates selection, updates submission status to `Approved`, records approved title and validator decision timestamp in DB | Validation fails: Display error, allow retry |
| 8 | System | (Automatic) Generates approval letter | Puppeteer renders HTML template populated with: student name, student ID, approved title, approval date, validator name, institution details; generates PDF and stores in AWS S3 with unique file ID | PDF generation fails: Log error to Sentry, display error to validator, allow retry |
| 9 | System | (Automatic) Stores letter reference | Submission record updated with approval letter file ID and S3 URL | DB write fails: Log error, retry mechanism triggered |
| 10 | System | (Automatic) Sends notification to student | In-app notification: "Your thesis title has been approved!"; email sent with approved title and link to download letter | Email delivery fails: Log error, retry queue triggered |
| 11 | Validator | Views updated queue | Submission no longer appears in validator's queue; appears in "Completed" or "Approved" view | N/A |
| 12 | Student | Logs in and views dashboard | Dashboard displays submission status as `Approved` with approved title and "Download Letter" button | N/A |
| 13 | Student | Clicks "Download Letter" button | System retrieves PDF from AWS S3 using stored file ID, initiates browser download | File not found in S3: Display error message, log to Sentry |
| 14 | Student | Receives PDF file | Approval letter PDF downloaded to student's device | Download interrupted: Browser handles retry; system logs event |

### Trigger
Validator initiates approval via the "Approve" action and selects a title.

### Pre-conditions
- Validator is authenticated and logged in.
- Submission exists with status `Pending Validator Review` and is assigned to this validator.
- All proposed titles are present and valid.
- Validator has reviewed the submission content.

### Post-conditions
- Submission status is updated to `Approved`.
- Approved title is recorded in the database.
- Approval letter is generated and stored in AWS S3.
- Student receives notification and can download the letter.
- Student is now able to create a new submission (if needed).
- Submission is removed from validator's active queue.

---

## Flow 4: Validator Review & Final Decision (Rejection Path)

### Description

A validator reviews an assigned submission and rejects it, providing mandatory feedback. The system records the rejection, notifies the student, and allows the student to resubmit with new titles.

### Flow Table

| No | Actor | Action/Step | System Response | Alternative/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Validator | Logs in with validator credentials | System authenticates via JWT, displays validator dashboard with assigned submissions queue | Invalid credentials: Display error message, prompt retry |
| 2 | Validator | Views "Pending Validator Review" queue | System retrieves all submissions assigned to this validator with status `Pending Validator Review`, displays list | No submissions in queue: Display empty state message |
| 3 | Validator | Clicks on a submission to open details | System displays full submission details: student info, all proposed titles, submission history | Submission not found: Display error, redirect to queue |
| 4 | Validator | Reviews all proposed titles | Validator performs substantive review (visual inspection, academic judgment) | N/A |
| 5 | Validator | Selects "Reject" action | System displays rejection form with mandatory text field for feedback | N/A |
| 6 | Validator | Enters rejection feedback/reason | Form validates input (non-empty, max 1000 chars) | Invalid input (empty): Display validation error, prevent submission |
| 7 | Validator | Clicks "Confirm Rejection" button | System validates feedback, updates submission status to `Rejected`, records rejection reason, validator name, and rejection timestamp in DB | Validation fails: Display error, allow retry |
| 8 | System | (Automatic) Sends notification to student | In-app notification: "Your submission has been rejected"; email sent with rejection reason and link to view feedback | Email delivery fails: Log error, retry queue triggered |
| 9 | Validator | Views updated queue | Submission no longer appears in validator's queue; appears in "Completed" or "Rejected" view | N/A |
| 10 | Student | Logs in and views dashboard | Dashboard displays submission status as `Rejected` with rejection reason visible in a collapsible section | N/A |
| 11 | Student | Reviews rejection feedback | Student reads detailed feedback from validator | N/A |
| 12 | Student | Clicks "Submit New Thesis Title" button | System checks submission status; since current submission is `Rejected` (final state), new submission is allowed | N/A |
| 13 | Student | Submits new proposal with up to 3 new titles | System creates new submission record with status `Pending Admin Review`, generates new submission ID | Validation fails: Display error, prevent submission |
| 14 | System | (Automatic) Sends confirmation | In-app and email notification sent to student with new submission ID | Email delivery fails: Log error, retry queue triggered |
| 15 | Admin | Views updated queue | New submission appears in `Pending Admin Review` queue for admin review and assignment | N/A |

### Trigger
Validator initiates rejection via the "Reject" action and provides feedback.

### Pre-conditions
- Validator is authenticated and logged in.
- Submission exists with status `Pending Validator Review` and is assigned to this validator.
- Validator has reviewed the submission content and determined it does not meet academic standards.
- Rejection feedback is mandatory and must be provided.

### Post-conditions
- Submission status is updated to `Rejected`.
- Rejection reason is recorded in the database.
- Student receives notification with detailed feedback.
- Student is now able to create a new submission with different titles.
- Submission is removed from validator's active queue.
- New submission (if created by student) enters the admin queue.

---

## Flow 5: Student Views Submission History & Status

### Description

A student accesses their dashboard to view the current status of their active submission and a history of all past submissions with their outcomes.

### Flow Table

| No | Actor | Action/Step | System Response | Alternative/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Student | Logs in with university credentials | System authenticates via JWT, displays student dashboard | Invalid credentials: Display error message, prompt retry |
| 2 | Student | Views dashboard main section | System retrieves current active submission (if any) and displays: status badge, submission ID, submitted titles, current stage (e.g., "With Validator"), expected timeline | No active submission: Display message "No active submission" |
| 3 | Student | Scrolls to "Submission History" section | System retrieves all past submissions for this student, displays in reverse chronological order with: submission ID, submission date, final status (Approved/Rejected), approved title (if approved), rejection reason (if rejected) | No history: Display empty state message |
| 4 | Student | Clicks on a past submission row | System displays detailed view: all proposed titles, status timeline (submitted → assigned → reviewed → final decision), dates for each stage | Submission not found: Display error, redirect to dashboard |
| 5 | Student | (If approved) Clicks "Download Letter" button | System retrieves PDF from AWS S3, initiates browser download | File not found: Display error message, log to Sentry |
| 6 | Student | (If rejected) Views rejection feedback | System displays rejection reason in a collapsible section | N/A |
| 7 | Student | Returns to dashboard | System refreshes dashboard view | N/A |

### Trigger
Student navigates to the dashboard or clicks on a submission history entry.

### Pre-conditions
- Student is authenticated and logged in.
- Student has at least one submission (current or past).

### Post-conditions
- Student views complete submission history and current status.
- Student can download approval letters for approved submissions.
- Student can review rejection feedback for rejected submissions.

---

## Flow 6: Admin Views All Submissions & Generates Reports

### Description

An admin accesses a master view of all submissions across all students, filtered by status, and can generate summary reports for institutional oversight.

### Flow Table

| No | Actor | Action/Step | System Response | Alternative/Error Path |
|:---|:---|:---|:---|:---|
| 1 | Admin | Logs in with admin credentials | System authenticates via JWT, displays admin dashboard | Invalid credentials: Display error message, prompt retry |
| 2 | Admin | Clicks "All Submissions" or "Reports" tab | System retrieves all submissions from database, displays in table format with columns: Submission ID, Student Name, Status, Assigned Validator, Submission Date, Last Updated | No submissions: Display empty state message |
| 3 | Admin | (Optional) Filters by status | Admin selects filter: "Pending Admin Review", "Pending Validator Review", "Approved", "Rejected" | No results for filter: Display empty state message |
| 4 | Admin | (Optional) Filters by date range | Admin enters start and end dates | Invalid date range: Display validation error |
| 5 | Admin | (Optional) Exports report | Admin clicks "Export to CSV" button | System generates CSV file with filtered submissions, initiates download | Export fails: Display error, log to Sentry |
| 6 | Admin | Views summary statistics | System displays: total submissions, approved count, rejected count, average time to approval, rejection rate | N/A |
| 7 | Admin | Clicks on a submission row | System displays full submission details and assignment history | Submission not found: Display error, redirect to list |

### Trigger
Admin navigates to the "All Submissions" or "Reports" section.

### Pre-conditions
- Admin is authenticated and logged in.
- At least one submission exists in the system.

### Post-conditions
- Admin has visibility into all submissions and their statuses.
- Admin can generate reports for institutional reporting and analysis.
- Admin can identify bottlenecks or trends in the approval process.

---

## Key State Transitions

The following table summarizes the valid state transitions for a submission throughout its lifecycle:

| Current State | Allowed Next State(s) | Triggered By | Actor |
|:---|:---|:---|:---|
| `Pending Admin Review` | `Pending Validator Review` | Admin assigns to validator | Admin |
| `Pending Validator Review` | `Approved` | Validator approves and selects title | Validator |
| `Pending Validator Review` | `Rejected` | Validator rejects with feedback | Validator |
| `Approved` | (Terminal) | N/A | N/A |
| `Rejected` | (Terminal) | N/A | N/A |

**Note:** A student with a `Rejected` submission can create a new submission, which enters the `Pending Admin Review` state. A student with an `Approved` submission cannot create a new submission (business rule: one approved title per student per academic period).

---

## Notification Triggers & Timing

The following table documents all automated notifications sent by the system:

| Event | Recipient | Notification Type | Timing | Content |
|:---|:---|:---|:---|:---|
| Submission created | Student | In-app + Email | Immediate | Confirmation with submission ID and expected timeline |
| Assigned to validator | Validator | In-app + Email | Immediate | Submission details and link to review |
| Assigned to validator | Student | In-app + Email | Immediate | Validator name and expected review timeline |
| Approved | Student | In-app + Email | Immediate | Approved title and link to download letter |
| Rejected | Student | In-app + Email | Immediate | Rejection reason and link to view feedback |

---

## Error Handling & Recovery

### Common Error Scenarios

| Scenario | Error Message | Recovery Action |
|:---|:---|:---|
| Student attempts to submit while active submission exists | "You have an active submission in review. Please wait for a decision before submitting a new one." | Display current submission status; block submission button |
| PDF generation fails | "Unable to generate approval letter. Please try again or contact support." | Log error to Sentry; retry mechanism triggered; admin notified |
| Email delivery fails | (Silent; logged to Sentry) | Automatic retry queue; admin dashboard shows delivery status |
| Validator assignment fails (DB error) | "Assignment failed. Please try again." | Log error; allow admin to retry |
| Student downloads expired/missing letter | "The approval letter is no longer available. Please contact support." | Log error; admin can regenerate letter if needed |

---

## Accessibility & Responsive Design

All flows are designed to work seamlessly on:
- **Desktop browsers:** Chrome, Firefox, Safari (latest versions)
- **Mobile browsers:** Chrome Mobile, Safari iOS (responsive layout)
- **Accessibility:** WCAG 2.1 AA compliance; keyboard navigation support; screen reader compatibility via shadcn/ui components

---

## Performance Considerations

- **Dashboard load time:** < 2 seconds (includes fetching submission status and history)
- **PDF generation:** < 5 seconds from approval action to file storage
- **Email delivery:** Queued asynchronously; does not block user action
- **API response time:** < 300ms (p95) for all endpoints

See [ARCHITECTURE.md] for technical implementation details on caching, database optimization, and async job processing.