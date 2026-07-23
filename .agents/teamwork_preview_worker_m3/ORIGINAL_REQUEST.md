## 2026-07-23T07:16:01Z

You are teamwork_preview_worker for Milestone 3 (Core Business Logic & Puppeteer PDF Generation Module) of SkripsiHub.
Your working directory is: C:\Users\iyede\code\__lab__\skripsihub\.agents\teamwork_preview_worker_m3

Tasks:
1. Immediately create progress.md in your working directory C:\Users\iyede\code\__lab__\skripsihub\.agents\teamwork_preview_worker_m3\progress.md with "Last visited: [timestamp]" and track your progress.
2. Read the project specifications:
   - C:\Users\iyede\code\__lab__\skripsihub\BUSINESS_RULES.md
   - C:\Users\iyede\code\__lab__\skripsihub\API_SPECIFICATION.md
   - C:\Users\iyede\code\__lab__\skripsihub\NOTIFICATION_SYSTEM.md
   - C:\Users\iyede\code\__lab__\skripsihub\backend\package.json
3. Install/ensure required dependencies:
   - Check if puppeteer is installed in backend/package.json. If not, add `puppeteer` (or `@types/puppeteer`) or ensure Puppeteer module is implemented cleanly.
4. Implement PDF Module in backend/src/pdf/:
   - `PdfService` (`pdf.service.ts`):
     - `generateApprovalLetterPdf`: Accepts studentName, universityId, approvedTitle, validatorName, approvalDate, submissionId.
     - Renders clean HTML template for official Thesis Title Approval Letter ("Surat Keputusan Persetujuan Judul Skripsi") containing header, student details, approved title, approval date, validator signature block, document reference ID.
     - Renders PDF using Puppeteer (`puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })`).
     - Saves generated PDF to local uploads directory (`uploads/letters/approval_letter_<submissionId>.pdf`) and returns public/relative download URL and file key.
     - Implement fallback/mock PDF buffer generator if Puppeteer binary execution encounters environment limits in test runners, while preserving full Puppeteer integration in production mode.
   - Endpoint in controller or SubmissionsController: `GET /submissions/me/:submissionId/letter` (or `GET /pdf/letter/:submissionId`) to serve/stream the generated PDF file to authenticated student/admin.
5. Integrate PDF Generation into `SubmissionsService.approveSubmission`:
   - When a validator approves a proposal, automatically invoke `PdfService.generateApprovalLetterPdf(...)`, save the PDF file, and create/update the `ApprovalLetter` database record (`submissionId`, `studentId`, `approvedTitle`, `pdfUrl`, `pdfS3Key`, `generatedAt`).
6. Implement Notification Module in backend/src/notification/:
   - `NotificationService`: `createNotification`, `getNotificationsForUser`, `markAsRead`.
   - `NotificationController`: `GET /notifications/me`, `PATCH /notifications/:id/read`.
   - Wire notification triggers at key events:
     - `SUBMISSION_RECEIVED`: Created for student when submission is created.
     - `ASSIGNED_TO_VALIDATOR`: Created for validator when admin assigns submission.
     - `FINAL_DECISION`: Created for student when validator approves or rejects.
7. Write unit tests for `PdfService` and `NotificationService`.
8. Run `npm run build` and `npm run test` to verify all tests pass.
9. Create handoff.md in C:\Users\iyede\code\__lab__\skripsihub\.agents\teamwork_preview_worker_m3\handoff.md detailing implementation, tests, build output, and send completion message to parent.
