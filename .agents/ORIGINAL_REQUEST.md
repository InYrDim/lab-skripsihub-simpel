# Original User Request

## Initial Request - 2026-07-23T07:07:47Z

# Teamwork Project Prompt - Draft

> Status: Launched
> Goal: Multi-agent system is now building SkripsiHub

Build SkripsiHub, an Academic Submission Management System designed to digitize and streamline the thesis title proposal and approval process. It uses a React/Tailwind frontend and a Nest.js/MySQL backend to manage student submissions, admin routing, and validator approvals, generating a final PDF letter.

Working directory: `C:\Users\iyede\code\__lab__\skripsihub`
Integrity mode: development

## Requirements

### R1. Backend API Implementation
Implement the Nest.js backend according to the provided `API_SPECIFICATION.md` and `DATABASE_SCHEMA.md`. This includes authentication (JWT), submission management, validator assignments, and notification endpoints.

### R2. Frontend Implementation
Implement the React.js (Vite) frontend with Tailwind CSS according to the `UI_UX_DESIGN.md` and `USER_FLOW.md`. Create a dashboard layout, role-based views (Student, Admin, Validator), and integrate with the backend API.

### R3. Core Business Logic
Enforce the rules defined in `BUSINESS_RULES.md`, such as the single active submission rule, validator assignment constraints, and approval PDF generation using Puppeteer.

## Acceptance Criteria

### Backend API Verification
- [ ] Ensure `npm run test` executes successfully.
- [ ] Automated tests verify that a Student can submit up to 3 titles.
- [ ] Automated tests verify Admin can assign a submission to a Validator.
- [ ] Automated tests verify Validator can approve/reject (with mandatory feedback).
- [ ] Tests verify that upon approval, a PDF letter is successfully generated.

### Frontend UI Verification
- [ ] The dashboard correctly routes and displays different views based on the logged-in user's role (Student/Admin/Validator).
- [ ] UI correctly blocks a student from creating a new submission if one is already pending.
