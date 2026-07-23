# Project: SkripsiHub - Academic Submission Management System

## Architecture
- **Backend Stack**: NestJS (v11), TypeScript, Prisma ORM, MySQL (with SQLite option for local Jest tests), Passport JWT, Bcrypt, Puppeteer for HTML-to-PDF rendering.
- **Frontend Stack**: React 19, Vite 8, Tailwind CSS v4, Lucide React icons, Role-Based Route Guards.
- **Data Flow**:
  1. Student submits 1 to 3 distinct thesis titles. Backend verifies single-active submission constraint (rejects with HTTP 409 if an active submission exists). Submission status: `PENDING_ADMIN_REVIEW`.
  2. Admin views submission queue, assigns an active Validator. Submission status transitions to `PENDING_VALIDATOR_REVIEW`.
  3. Validator views assigned submissions queue, selects 1 title to approve OR rejects with mandatory feedback text (≥10 chars).
  4. On approval, Puppeteer generates an official PDF letter (containing Student Name, ID, Approved Title, Validator Name, Date). PDF link is stored in `ApprovalLetter` record.
  5. Notifications (`SUBMISSION_RECEIVED`, `ASSIGNED_TO_VALIDATOR`, `FINAL_DECISION`) are logged and visible to respective roles.
  6. Frontend blocks Student from accessing/submitting new proposals when an active submission is pending.

## Code Layout
- `backend/`:
  - `prisma/schema.prisma`: Data models for User, Submission, SubmissionTitle, Assignment, ValidatorFeedback, ApprovalLetter, Notification.
  - `src/auth/`: JWT strategy, AuthController, AuthService, RolesGuard, JwtAuthGuard.
  - `src/user/`: User module, Admin user management service.
  - `src/submission/`: SubmissionController, AdminSubmissionController, ValidatorSubmissionController, SubmissionService.
  - `src/pdf/`: PdfService (Puppeteer HTML-to-PDF rendering and storage).
  - `src/notification/`: NotificationService & Controller.
  - `test/`: Jest unit and integration spec files.
- `frontend/`:
  - `src/components/`: Navigation bar, Status badges, Submission forms, Feedback modal.
  - `src/pages/`: Login page, Student Dashboard, Admin Dashboard, Validator Dashboard.
  - `src/context/`: AuthContext (role state, login/logout, JWT storage).
  - `src/services/`: API client service for auth, submissions, admin, validator, pdf.
  - `src/routes/`: App routes with ProtectedRoute (role checks).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Database Schema & Auth Module | Prisma schema setup, User CRUD, JWT auth, RBAC guards, User seed | None | DONE |
| M2 | Backend Submissions & Business Logic | Submissions CRUD, single active submission constraint, 1-3 titles, Admin assign, Validator approve/reject | M1 | DONE |
| M3 | PDF Generation & Storage | Puppeteer PDF letter generator, HTML template, letter download endpoint, Notification service | M2 | DONE |
| M4 | Backend Automated Test Suite | Complete Jest test suite verifying `npm run test` for all AC | M3 | DONE |
| M5 | Frontend React/Tailwind UI & Routing | React/Vite/Tailwind UI, role-based dashboards & routing, submission blocking UI | M2, M3 | DONE |
| M6 | System Integration & Forensic Audit | End-to-end integration verification, Reviewer validation, Challenger testing, Forensic Audit | M4, M5 | DONE |

## Interface Contracts
- **Response Format**: `{ "success": boolean, "data": object|array, "message": string }`
- **Error Format**: `{ "success": false, "error": string, "message": string }`
- **Auth Header**: `Authorization: Bearer <jwt_token>`
- **Roles**: `STUDENT`, `ADMIN`, `VALIDATOR`
- **Submission Statuses**: `DRAFT`, `PENDING_ADMIN_REVIEW`, `PENDING_VALIDATOR_REVIEW`, `APPROVED`, `REJECTED`
