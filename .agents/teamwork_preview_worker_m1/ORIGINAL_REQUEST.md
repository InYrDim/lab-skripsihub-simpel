## 2026-07-23T07:08:45+08:00
You are teamwork_preview_worker for Milestone 1 (Database Schema & Authentication Module) of SkripsiHub.
Your working directory is: C:\Users\iyede\code\__lab__\skripsihub\.agents\teamwork_preview_worker_m1

Tasks:
1. Immediately create progress.md in your working directory C:\Users\iyede\code\__lab__\skripsihub\.agents\teamwork_preview_worker_m1\progress.md with "Last visited: [timestamp]" and track your progress.
2. Read the project specifications:
   - C:\Users\iyede\code\__lab__\skripsihub\DATABASE_SCHEMA.md
   - C:\Users\iyede\code\__lab__\skripsihub\API_SPECIFICATION.md
   - C:\Users\iyede\code\__lab__\skripsihub\BUSINESS_RULES.md
   - C:\Users\iyede\code\__lab__\skripsihub\backend\package.json
3. Implement Prisma Schema in backend/prisma/schema.prisma according to DATABASE_SCHEMA.md:
   - Enums: UserRole (STUDENT, ADMIN, VALIDATOR), SubmissionStatus (DRAFT, PENDING_ADMIN_REVIEW, PENDING_VALIDATOR_REVIEW, APPROVED, REJECTED), AssignmentStatus (PENDING, COMPLETED), FeedbackDecision (APPROVED, REJECTED), NotificationType (SUBMISSION_RECEIVED, ASSIGNED_TO_VALIDATOR, FINAL_DECISION, NEW_ASSIGNMENT).
   - Models: User, Submission, SubmissionTitle, Assignment, ValidatorFeedback, ApprovalLetter, Notification.
   - Note: For database provider, support both mysql and sqlite (or configure schema to work with SQLite/MySQL via env DATABASE_URL).
4. Create seed script prisma/seed.ts (configured in package.json) to seed default accounts:
   - Student: student@university.edu / password123 (role: STUDENT, universityId: STD001)
   - Admin: admin@university.edu / password123 (role: ADMIN, universityId: ADM001)
   - Validator 1: validator1@university.edu / password123 (role: VALIDATOR, universityId: VAL001)
   - Validator 2: validator2@university.edu / password123 (role: VALIDATOR, universityId: VAL002)
5. Implement Prisma Service in backend/src/prisma/prisma.service.ts and PrismaModule.
6. Implement Auth Module in backend/src/auth/ and User Module in backend/src/user/:
   - AuthController endpoints:
     - POST /auth/login: Accepts email, password. Returns JWT accessToken, refreshToken, user object. Standard response format: { success: true, data: { accessToken, refreshToken, user }, message: "..." }.
     - POST /auth/refresh: Accepts refreshToken. Returns new accessToken.
     - POST /auth/logout: Invalidates session / success response.
   - AuthGuards & Decorators:
     - JwtAuthGuard (Passport JWT)
     - RolesGuard (RBAC checking user role against @Roles() decorator)
     - @Roles('STUDENT', 'ADMIN', 'VALIDATOR')
     - Custom decorator @CurrentUser() / @GetUser() to get authenticated user profile.
7. Run prisma generation (`npx prisma generate`), run backend build (`npm run build`), and run initial test (`npm run test`).
8. Create handoff.md in C:\Users\iyede\code\__lab__\skripsihub\.agents\teamwork_preview_worker_m1\handoff.md detailing all created files, build/test outputs, and send a completion message back to parent.
