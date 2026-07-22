# NOTIFICATION.md: SkripsiHub

## Overview

This document specifies the notification system architecture, triggers, channels, and templates for SkripsiHub. Notifications inform users of critical status changes, assignments, and decisions throughout the thesis title submission lifecycle. The system employs a multi-channel approach combining email and in-app notifications to ensure timely, reliable communication.

## Notification Architecture

### Channels

| Channel | Technology | Use Case | Delivery Guarantee |
|:---|:---|:---|:---|
| **Email** | SendGrid | Official, persistent notifications; approval letters; rejection feedback | At-least-once with retry logic |
| **In-App** | WebSocket / Polling | Real-time dashboard updates; immediate status changes | Best-effort; stored in database |

### Delivery Strategy

*   **Email:** Primary channel for critical, official communications (approvals, rejections, letter generation). Sent asynchronously via a job queue to prevent blocking API requests.
*   **In-App:** Secondary channel for real-time feedback and dashboard updates. Enables users to see status changes without page refresh.
*   **Retry Logic:** Failed email sends are retried up to 3 times with exponential backoff (5s, 15s, 45s) before logging as failed.
*   **Idempotency:** All notifications are tagged with a unique `notificationId` to prevent duplicate sends in case of system failures.

## Notification Triggers & Events

### Student Notifications

#### Event: Submission Created
*   **Trigger:** Student successfully submits a thesis title proposal.
*   **Status:** `Pending Admin Review`
*   **Channels:** In-App + Email
*   **Template:** `SUBMISSION_RECEIVED`
*   **Content:**
    *   Confirmation of submission receipt.
    *   Submission ID and timestamp.
    *   List of submitted titles.
    *   Expected timeline for admin review.
    *   Link to view submission status in dashboard.

#### Event: Submission Assigned to Validator
*   **Trigger:** Admin assigns the submission to a validator.
*   **Status:** `With Validator`
*   **Channels:** In-App + Email
*   **Template:** `ASSIGNED_TO_VALIDATOR`
*   **Content:**
    *   Notification that submission has been forwarded for academic review.
    *   Name of assigned validator (optional, per institution policy).
    *   Expected timeline for validator decision.
    *   Link to dashboard for status tracking.

#### Event: Submission Approved
*   **Trigger:** Validator approves the submission and selects one title.
*   **Status:** `Approved`
*   **Channels:** In-App + Email
*   **Template:** `SUBMISSION_APPROVED`
*   **Content:**
    *   Congratulations message.
    *   Approved thesis title.
    *   Approval date.
    *   **Direct link to download approval letter (PDF).**
    *   Instructions for next steps (if any).

#### Event: Submission Rejected
*   **Trigger:** Validator rejects the submission.
*   **Status:** `Rejected`
*   **Channels:** In-App + Email
*   **Template:** `SUBMISSION_REJECTED`
*   **Content:**
    *   Notification of rejection.
    *   Detailed rejection feedback provided by validator.
    *   Instructions to resubmit with revised titles.
    *   Link to submit a new proposal.
    *   Timeline for resubmission (if applicable).

### Admin Notifications

#### Event: New Submission Received
*   **Trigger:** Student submits a thesis title proposal.
*   **Status:** `Pending Admin Review`
*   **Channels:** In-App
*   **Template:** `ADMIN_NEW_SUBMISSION`
*   **Content:**
    *   Alert of new submission in queue.
    *   Student name and ID.
    *   Submission ID.
    *   Link to review submission details.
    *   Count of pending submissions in queue.

#### Event: Submission Assigned to Validator (Confirmation)
*   **Trigger:** Admin successfully assigns submission to validator.
*   **Status:** `With Validator`
*   **Channels:** In-App
*   **Template:** `ADMIN_ASSIGNMENT_CONFIRMED`
*   **Content:**
    *   Confirmation of assignment.
    *   Validator name.
    *   Submission ID.

### Validator Notifications

#### Event: New Submission Assigned
*   **Trigger:** Admin assigns a submission to the validator.
*   **Status:** `With Validator`
*   **Channels:** In-App + Email
*   **Template:** `VALIDATOR_NEW_ASSIGNMENT`
*   **Content:**
    *   Alert of new submission assigned for review.
    *   Student name and ID.
    *   Submission ID.
    *   List of proposed titles.
    *   Link to review submission in dashboard.
    *   Expected review deadline (if set by admin).

#### Event: Submission Decision Recorded (Confirmation)
*   **Trigger:** Validator submits approval or rejection decision.
*   **Status:** `Approved` or `Rejected`
*   **Channels:** In-App
*   **Template:** `VALIDATOR_DECISION_CONFIRMED`
*   **Content:**
    *   Confirmation of decision submission.
    *   Decision type (Approved/Rejected).
    *   Submission ID.
    *   Timestamp of decision.

## Notification Templates

All templates are stored in the database and support variable interpolation using `{{variable}}` syntax.

### Email Template Structure

```
Subject: [INSTITUTION_NAME] - {{EVENT_TITLE}}
From: noreply@skripsihub.institution.edu
To: {{USER_EMAIL}}
Reply-To: support@skripsihub.institution.edu

---

Dear {{USER_NAME}},

{{BODY_CONTENT}}

---

Best regards,
SkripsiHub Team
[Institution Name]

---

[Footer with system info, unsubscribe link, contact support]
```

### In-App Notification Structure

```json
{
  "id": "{{notificationId}}",
  "userId": "{{userId}}",
  "type": "{{eventType}}",
  "title": "{{shortTitle}}",
  "message": "{{briefMessage}}",
  "actionUrl": "{{dashboardLink}}",
  "actionLabel": "{{buttonText}}",
  "createdAt": "{{timestamp}}",
  "read": false,
  "priority": "{{high|normal|low}}"
}
```

## Notification Preferences & Opt-Out

*   **Email Opt-Out:** Users may disable email notifications for non-critical events (e.g., assignment notifications) via account settings. Critical notifications (approvals, rejections) cannot be disabled.
*   **In-App Notifications:** Always enabled; users can mark as read or dismiss from the notification center.
*   **Preference Storage:** User notification preferences are stored in the `user_notification_preferences` table with flags for each notification type.

## Notification Scheduling & Timing

### Immediate Notifications
*   Submission received (student).
*   Submission assigned to validator (student, validator).
*   Approval decision (student).
*   Rejection decision (student).

### Batch Notifications (Daily Digest, Optional)
*   Admin queue summary (if more than 5 pending submissions, send daily digest at 8:00 AM).

### Delayed Notifications (Reminders, Optional)
*   Validator reminder: If submission is pending for > 3 days, send reminder to validator (configurable by admin).
*   Student reminder: If submission is pending for > 7 days, send status update to student (configurable by admin).

## Approval Letter Generation & Delivery

### Trigger
*   Automatically generated when validator approves a submission and selects the final title.

### Generation Process
1. Validator submits approval decision with selected title.
2. System generates a unique `letterId` and stores metadata in `approval_letters` table.
3. Puppeteer renders the HTML approval letter template with student details, approved title, and approval date.
4. Generated PDF is uploaded to AWS S3 with a secure, time-limited signed URL.
5. Signed URL is stored in the database and made available to the student.
6. Email notification is sent to student with a direct download link.

### Letter Template
*   **Format:** PDF (generated from HTML template).
*   **Content:**
    *   Institution letterhead.
    *   Student name, ID, and program.
    *   Approved thesis title.
    *   Approval date and validator signature (digital or placeholder).
    *   Official seal/stamp (if applicable).
    *   Reference number for record-keeping.

### Storage & Access
*   **Storage Location:** AWS S3 bucket `skripsihub-approval-letters/`.
*   **Naming Convention:** `{studentId}_{submissionId}_{timestamp}.pdf`
*   **Access Control:** Signed URLs valid for 30 days; students can download multiple times within this window.
*   **Archival:** Letters are retained indefinitely for audit and record-keeping purposes.

## Error Handling & Fallback

### Email Delivery Failure
*   If SendGrid fails to send an email after 3 retries, the notification is logged as `FAILED` in the `notifications` table.
*   Admin receives an alert if critical notifications (approvals, rejections) fail to send.
*   System provides a manual resend option in the admin dashboard.

### In-App Notification Failure
*   If WebSocket connection is unavailable, notifications are queued in the database and delivered on next user login or reconnection.
*   Polling fallback ensures notifications are retrieved within 30 seconds if WebSocket is unavailable.

### PDF Generation Failure
*   If Puppeteer fails to generate the approval letter, the system retries up to 2 times.
*   If generation fails after retries, admin is alerted and can manually trigger regeneration.
*   Student receives a notification that their letter is being prepared and will be available shortly.

## Notification Audit & Logging

All notifications are logged in the `notifications` table with the following fields:

| Field | Type | Purpose |
|:---|:---|:---|
| `id` | UUID | Unique notification identifier |
| `userId` | UUID | Recipient user ID |
| `type` | ENUM | Notification event type (e.g., `SUBMISSION_RECEIVED`) |
| `channel` | ENUM | Delivery channel (`EMAIL`, `IN_APP`) |
| `status` | ENUM | Delivery status (`PENDING`, `SENT`, `FAILED`, `READ`) |
| `subject` | VARCHAR | Email subject or in-app title |
| `body` | TEXT | Full notification content |
| `metadata` | JSON | Additional context (e.g., `submissionId`, `validatorId`) |
| `sentAt` | TIMESTAMP | Actual send time |
| `readAt` | TIMESTAMP | Time user read in-app notification (if applicable) |
| `failureReason` | TEXT | Error message if delivery failed |
| `createdAt` | TIMESTAMP | Notification creation time |

### Audit Reports
*   Admins can generate reports on notification delivery success rates, failed sends, and user engagement metrics.
*   System logs all notification events for compliance and troubleshooting.

## Performance & Scalability

*   **Email Queue:** Notifications are enqueued asynchronously using a job queue (e.g., Bull/Redis) to prevent blocking API requests.
*   **Batch Processing:** Multiple notifications are batched and sent in parallel to SendGrid to optimize throughput.
*   **Rate Limiting:** SendGrid rate limits are respected; system implements backpressure to queue excess notifications.
*   **In-App Delivery:** WebSocket connections are managed with connection pooling to support 500+ concurrent users.
*   **Database Indexing:** `notifications` table is indexed on `userId`, `type`, `status`, and `createdAt` for fast queries.

## Notification Content Guidelines

*   **Tone:** Professional, clear, and supportive.
*   **Language:** Indonesian (primary) with English as secondary option, configurable per user.
*   **Clarity:** All messages must be concise and actionable. Avoid jargon.
*   **Personalization:** Always address users by name and include relevant submission/decision details.
*   **Call-to-Action:** Every notification includes a direct link to the relevant dashboard page or action.
*   **Branding:** All notifications include institution branding and SkripsiHub footer.

## Integration Points

*   **SendGrid API:** Used for email delivery. API key stored securely in environment variables.
*   **WebSocket Server:** Integrated with Nest.js backend for real-time in-app notifications.
*   **AWS S3:** Used for storing and retrieving approval letter PDFs.
*   **Puppeteer:** Invoked server-side to generate approval letter PDFs from HTML templates.
*   **Database:** All notification metadata and user preferences stored in MySQL.

## Future Enhancements

*   SMS notifications for critical events (approvals, rejections).
*   Push notifications via mobile app (if mobile app is developed).
*   Notification digest customization (weekly/monthly summaries).
*   Multi-language support expansion beyond Indonesian and English.
*   Webhook support for third-party integrations (e.g., institutional LMS).