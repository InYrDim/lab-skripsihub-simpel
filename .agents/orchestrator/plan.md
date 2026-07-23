# Execution Plan: SkripsiHub Academic Submission Management System

## Overview & Objective
Build and verify SkripsiHub, an Academic Submission Management System, adhering to all specifications (`PRD.md`, `API_SPECIFICATION.md`, `DATABASE_SCHEMA.md`, `BUSINESS_RULES.md`, `UI_UX_DESIGN.md`, `USER_FLOW.md`, `ROADMAP.md`, `SYSTEM_ARCHITECTURE.md`, `TESTING_STRATEGY.md`, `NOTIFICATION_SYSTEM.md`, `DEPLOYMENT_GUIDE.md`, `REQUIREMENTS.md`).

## Milestone Roadmap

### Milestone 1: Database Schema & Authentication Module (M1)
- **Objective**: Implement Prisma database schema, seed initial users (Student, Admin, Validator), implement JWT authentication and Role-Based Access Control (RBAC) guards in Nest.js backend.
- **Deliverables**:
  - `backend/prisma/schema.prisma` matching `DATABASE_SCHEMA.md`.
  - Database migration scripts and seed script for test user accounts.
  - NestJS Auth module (`/auth/login`, `/auth/refresh`, `/auth/logout`) with Passport JWT & bcrypt.
  - Role-based guards (`JwtAuthGuard`, `RolesGuard`, `@Roles()`).
- **Worker Working Directory**: `.agents/teamwork_preview_worker_m1/`

### Milestone 2: Backend Core Submissions & Workflow Logic (M2)
- **Objective**: Implement thesis proposal submission, single active submission rule enforcement, title validation (up to 3 titles), admin assignment API, validator approval/rejection API with mandatory feedback.
- **Deliverables**:
  - `POST /submissions` (Student creates submission with 1-3 titles, enforces single active submission rule with HTTP 409).
  - `GET /submissions/me`, `GET /submissions/me/current`, `GET /submissions/me/:id`.
  - `GET /admin/submissions`, `POST /admin/submissions/:id/assign`, `GET /admin/validators`.
  - `GET /validator/submissions`, `POST /validator/submissions/:id/approve`, `POST /validator/submissions/:id/reject` (requires feedback ≥10 chars).
- **Worker Working Directory**: `.agents/teamwork_preview_worker_m2/`

### Milestone 3: Core Business Logic & PDF Generation Module (M3)
- **Objective**: Implement Puppeteer HTML-to-PDF letter generation service for approved submissions, letter storage/retrieval endpoints, and in-app notifications.
- **Deliverables**:
  - `src/pdf/pdf.service.ts` using Puppeteer to render approval HTML template to PDF.
  - `ApprovalLetter` database record creation on validator approval.
  - `GET /submissions/me/:id/letter` or static download link endpoint for approval letter PDF.
  - Notification triggers (`SUBMISSION_RECEIVED`, `ASSIGNED_TO_VALIDATOR`, `FINAL_DECISION`).
- **Worker Working Directory**: `.agents/teamwork_preview_worker_m3/`

### Milestone 4: Backend Automated Test Suite & Verification (M4)
- **Objective**: Develop comprehensive automated test suite (Jest unit & integration tests) in `backend/test` to ensure `npm run test` passes 100% and verifies all core business rules.
- **Deliverables**:
  - NestJS Jest test files covering Auth, Student Submissions (limit 1 active, 1-3 titles), Admin Assignment, Validator Approve/Reject with feedback, PDF Generation.
  - Verified `npm run test` output with 100% test pass rate.
- **Worker Working Directory**: `.agents/teamwork_preview_worker_m4/`

### Milestone 5: Frontend React/Vite/Tailwind UI & Role-Based Routing (M5)
- **Objective**: Implement React/Vite frontend with Tailwind CSS according to `UI_UX_DESIGN.md` & `USER_FLOW.md`.
- **Deliverables**:
  - Login page with role selector / auto-redirection.
  - Role-based routing guards (`StudentRoute`, `AdminRoute`, `ValidatorRoute`).
  - Student Dashboard: displays active submission status, proposal form (up to 3 titles), UI blocking when active proposal is pending, rejection feedback viewer, approval PDF download button.
  - Admin Dashboard: submission queue, validator assignment modal/dropdown, user management.
  - Validator Dashboard: assigned submissions list, approval modal with title selector, rejection modal with mandatory text area feedback.
  - API Integration service using Fetch/Axios.
- **Worker Working Directory**: `.agents/teamwork_preview_worker_m5/`

### Milestone 6: System Integration, Verification & Forensic Audit (M6)
- **Objective**: Execute multi-agent verification (Reviewer, Challenger, Forensic Auditor) across the entire application to verify functional completeness and zero-cheating integrity.
- **Deliverables**:
  - Reviewer report verifying all acceptance criteria.
  - Challenger report verifying stress tests and edge cases.
  - Forensic Auditor report confirming CLEAN verdict.
- **Working Directory**: `.agents/teamwork_preview_auditor_m6/`

## Acceptance Criteria Verification Checklist
- [ ] `npm run test` executes successfully in backend.
- [ ] Student submission limit (up to 3 titles) enforced.
- [ ] Admin validator assignment working.
- [ ] Validator approve/reject with mandatory feedback working.
- [ ] Approval PDF letter generation via Puppeteer working.
- [ ] Frontend role-based routing (Student, Admin, Validator) working.
- [ ] UI blocking new submission when one is active/pending working.
