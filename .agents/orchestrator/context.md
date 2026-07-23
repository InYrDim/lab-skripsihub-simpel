# Context: SkripsiHub Academic Submission Management System

## Project Overview
SkripsiHub is a full-stack Academic Submission Management System built to streamline thesis title proposal and approval workflows.
- Backend: NestJS, TypeScript, Prisma ORM, MySQL (or SQLite fallback for tests), Passport JWT, Puppeteer.
- Frontend: React 19, Vite, Tailwind CSS v4, Lucide React icons.

## Specifications Summary

### Core Requirements (R1, R2, R3)
- **R1: Backend API Implementation**: Auth (JWT), Submissions management, Validator assignments, Notifications endpoints.
- **R2: Frontend UI & Routing**: React/Vite/Tailwind frontend, role-based dashboards (Student, Admin, Validator), protected routing.
- **R3: Core Business Logic**: Single active submission rule, validator assignment constraints, validator mandatory feedback on rejection, approval PDF letter generation via Puppeteer.

### Acceptance Criteria Checklist
1. `npm run test` succeeds for backend.
2. Student submission limit (up to 3 titles).
3. Admin validator assignment.
4. Validator approve/reject with mandatory feedback.
5. Approval PDF letter generation via Puppeteer.
6. Frontend role-based routing (Student, Admin, Validator).
7. UI blocking new submission when one is active/pending.

## Workspace Layout
- `backend/`: NestJS codebase (package.json, tsconfig, src, test, prisma)
- `frontend/`: React Vite Tailwind codebase (package.json, src, public, vite.config.ts)
- `.agents/`: Coordination and metadata directory for subagent workflows and logs.
