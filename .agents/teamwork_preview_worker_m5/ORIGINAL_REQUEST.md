## 2026-07-22T23:08:56Z
You are teamwork_preview_worker for Milestone 5 (Frontend React/Vite/Tailwind UI & Routing) of SkripsiHub.
Your working directory is: C:\Users\iyede\code\__lab__\skripsihub\.agents\teamwork_preview_worker_m5

Tasks:
1. Immediately create progress.md in your working directory C:\Users\iyede\code\__lab__\skripsihub\.agents\teamwork_preview_worker_m5\progress.md with "Last visited: [timestamp]" and track your progress.
2. Read the project specifications:
   - C:\Users\iyede\code\__lab__\skripsihub\UI_UX_DESIGN.md
   - C:\Users\iyede\code\__lab__\skripsihub\USER_FLOW.md
   - C:\Users\iyede\code\__lab__\skripsihub\API_SPECIFICATION.md
   - C:\Users\iyede\code\__lab__\skripsihub\BUSINESS_RULES.md
   - C:\Users\iyede\code\__lab__\skripsihub\frontend\package.json
3. Implement the React (Vite + Tailwind CSS v4) frontend in `C:\Users\iyede\code\__lab__\skripsihub\frontend`:
   - Install/ensure required router package (e.g. react-router-dom) or build standard SPA routing.
   - API client service (`src/services/api.ts`): JWT bearer token management, endpoints for auth (`/auth/login`), student (`/submissions`, `/submissions/me`, `/submissions/me/current`), admin (`/admin/submissions`, `/admin/submissions/:id/assign`, `/admin/validators`), validator (`/validator/submissions`, `/validator/submissions/:id/approve`, `/validator/submissions/:id/reject`).
   - Auth Context (`src/context/AuthContext.tsx`): manage authenticated user state (token, role: STUDENT, ADMIN, VALIDATOR, user details), login, logout.
   - Route Protection & Guards (`src/components/ProtectedRoute.tsx`):
     - Redirect unauthenticated users to `/login`.
     - Route by role: Student -> `/student`, Admin -> `/admin`, Validator -> `/validator`.
     - Restrict unauthorized role access (e.g. Student accessing `/admin` gets redirected or shown access denied).
   - Login Page (`src/pages/LoginPage.tsx`): email/password form with quick-login buttons for demo accounts (Student, Admin, Validator).
   - Student Dashboard (`src/pages/StudentDashboard.tsx`):
     - Display active submission card or history list.
     - Submission Form modal/card: allows submitting 1 to 3 distinct thesis titles (with title and optional description).
     - UI Blocking: IF student has an active submission in DRAFT, PENDING_ADMIN_REVIEW, or PENDING_VALIDATOR_REVIEW, block/disable the "Create New Submission" button and display a prominent warning banner explaining an active submission is under review.
     - View Rejection Feedback modal/card: if status is REJECTED, display validator rejection feedback text clearly.
     - Download Approval Letter button: if status is APPROVED, display download link/button for PDF letter.
   - Admin Dashboard (`src/pages/AdminDashboard.tsx`):
     - Table/list of all student submissions with status filter (`PENDING_ADMIN_REVIEW`, etc.).
     - Assignment modal/action: select an active Validator from dropdown list and assign submission (`POST /admin/submissions/:id/assign`).
     - User Management tab/view.
   - Validator Dashboard (`src/pages/ValidatorDashboard.tsx`):
     - Table/list of submissions assigned to the logged-in validator (`PENDING_VALIDATOR_REVIEW`).
     - Review modal/page:
       - Approve option: Radio button to select EXACTLY ONE of the 3 proposed titles, then submit approval (`POST /validator/submissions/:id/approve`).
       - Reject option: Textarea for mandatory rejection reason (min 10 characters validation), submit rejection (`POST /validator/submissions/:id/reject`).
4. Run frontend build (`npm run build`) or linting to ensure no TypeScript compilation errors.
5. Create handoff.md in C:\Users\iyede\code\__lab__\skripsihub\.agents\teamwork_preview_worker_m5\handoff.md detailing implemented components, routing structure, build verification, and send completion message to parent.
