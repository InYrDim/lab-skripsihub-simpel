# TESTING.md: SkripsiHub

## Test Strategy

SkripsiHub employs a comprehensive, multi-layered testing approach to ensure reliability, security, and performance across all user roles and workflows. The testing strategy aligns with the system's critical academic submission workflow and enforces strict data integrity and access control requirements.

### Testing Pyramid

The testing approach follows a standard pyramid structure:

- **Unit Tests (60%):** Individual functions, utilities, validators, and business logic.
- **Integration Tests (25%):** API endpoints, database interactions, notification triggers, and cross-service workflows.
- **End-to-End Tests (15%):** Complete user journeys across all roles (Student → Admin → Validator), PDF generation, and approval workflows.

### Test Scope & Coverage Targets

| Layer | Target Coverage | Tools | Execution |
|:---|:---|:---|:---|
| Unit | 80%+ | Jest, Vitest | Per commit (CI) |
| Integration | 70%+ | Jest, Supertest, MySQL test DB | Per PR |
| E2E | 60%+ (critical paths) | Playwright, Cypress | Pre-release, nightly |

### Testing Environments

- **Local Development:** Developers run unit and integration tests locally before pushing.
- **CI/CD Pipeline:** Automated test execution on every commit and PR.
- **Staging:** Full integration and E2E tests against a production-like environment.
- **Production:** Smoke tests and synthetic monitoring post-deployment.

---

## Unit Testing

### Backend Unit Tests (Nest.js)

#### Authentication & Authorization Module

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `validateJWT_validToken` | Valid JWT token with correct signature | Token decoded successfully; user claims extracted |
| `validateJWT_expiredToken` | Expired JWT token | Throws `UnauthorizedException` |
| `validateJWT_invalidSignature` | JWT with tampered signature | Throws `UnauthorizedException` |
| `rbac_studentCanSubmit` | Student role attempting to submit a title | Permission granted |
| `rbac_studentCannotAssignValidator` | Student role attempting to assign validator | Permission denied; throws `ForbiddenException` |
| `rbac_adminCanManageUsers` | Admin role attempting to create a user account | Permission granted |
| `rbac_validatorCannotManageUsers` | Validator role attempting to manage accounts | Permission denied |

**Tools:** Jest, `@nestjs/testing`  
**Coverage Target:** 90%+

#### Submission Service

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `createSubmission_validTitles` | Student submits 3 valid thesis titles | Submission created with status `Pending Admin Review` |
| `createSubmission_duplicateTitles` | Student submits duplicate titles in same submission | Validation error; submission rejected |
| `createSubmission_exceeds3Titles` | Student attempts to submit 4 titles | Validation error; only 3 allowed |
| `createSubmission_activeSubmissionExists` | Student attempts to submit while one is in review | Throws `ConflictException`; new submission blocked |
| `getSubmissionStatus_student` | Student retrieves their submission status | Returns only their own submission; no cross-student data leak |
| `getSubmissionStatus_admin` | Admin retrieves all submissions | Returns complete list with all statuses |
| `getSubmissionStatus_validator` | Validator retrieves assigned submissions | Returns only submissions assigned to them |

**Tools:** Jest, Supertest (for service layer)  
**Coverage Target:** 85%+

#### Admin Assignment Service

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `assignValidator_validAssignment` | Admin assigns a pending submission to an available validator | Submission status changes to `Pending Validator Review`; validator notified |
| `assignValidator_validatorNotFound` | Admin attempts to assign to non-existent validator | Throws `NotFoundException` |
| `assignValidator_submissionNotPending` | Admin attempts to assign an already-approved submission | Throws `ConflictException` |
| `assignValidator_multipleAssignments` | Admin reassigns a submission to a different validator | Previous assignment cleared; new validator assigned |

**Tools:** Jest  
**Coverage Target:** 80%+

#### Validator Decision Service

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `approveSubmission_selectTitle` | Validator approves submission and selects one title | Submission status → `Approved`; letter generation triggered |
| `approveSubmission_invalidTitleIndex` | Validator attempts to approve with invalid title index | Throws `BadRequestException` |
| `rejectSubmission_withFeedback` | Validator rejects submission with feedback text | Submission status → `Rejected`; feedback stored; student notified |
| `rejectSubmission_emptyFeedback` | Validator attempts to reject without feedback | Throws `BadRequestException`; feedback is mandatory |
| `rejectSubmission_studentCanResubmit` | After rejection, student can create new submission | New submission allowed; previous rejection does not block |

**Tools:** Jest  
**Coverage Target:** 85%+

#### PDF Generation Service

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `generateApprovalLetter_validData` | Generate PDF with valid student, title, and date | PDF created successfully; stored in S3 |
| `generateApprovalLetter_missingData` | Generate PDF with missing student name or title | Throws `BadRequestException` |
| `generateApprovalLetter_templateRendering` | Verify HTML template renders correctly | All placeholders replaced; no template syntax visible in output |
| `generateApprovalLetter_fileStorage` | Verify generated PDF stored in S3 | File accessible via S3 URL; metadata correct |

**Tools:** Jest, Puppeteer (mocked)  
**Coverage Target:** 80%+

#### Notification Service

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `sendEmailNotification_validRecipient` | Send email to valid student address | Email queued with SendGrid; no errors |
| `sendEmailNotification_invalidEmail` | Send email to malformed address | Throws `BadRequestException` |
| `sendInAppNotification_create` | Create in-app notification for user | Notification stored in DB; marked as unread |
| `sendInAppNotification_markRead` | User marks notification as read | Notification status updated to read |
| `notificationTrigger_submissionReceived` | Submission created; notification triggered | Email + in-app notification sent to student |
| `notificationTrigger_assignedToValidator` | Submission assigned to validator | Email + in-app notification sent to validator |
| `notificationTrigger_approvalDecision` | Submission approved/rejected | Email + in-app notification sent to student with decision |

**Tools:** Jest, SendGrid mock  
**Coverage Target:** 85%+

### Frontend Unit Tests (React.js)

#### Authentication & Login Component

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `LoginForm_validCredentials` | User enters valid email and password | Form submitted; API call made; redirect to dashboard |
| `LoginForm_invalidCredentials` | User enters incorrect password | Error message displayed; no redirect |
| `LoginForm_emptyFields` | User submits form with empty fields | Validation error shown; form not submitted |
| `LoginForm_emailValidation` | User enters malformed email | Inline validation error; submit button disabled |
| `ProtectedRoute_authenticated` | Authenticated user accesses protected route | Route renders; no redirect |
| `ProtectedRoute_unauthenticated` | Unauthenticated user accesses protected route | Redirect to login page |
| `ProtectedRoute_roleCheck` | Student attempts to access admin-only route | Redirect to unauthorized page or dashboard |

**Tools:** Vitest, React Testing Library  
**Coverage Target:** 85%+

#### Student Dashboard Component

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `StudentDashboard_displayStatus` | Dashboard loads with active submission | Current status displayed prominently (e.g., "With Validator") |
| `StudentDashboard_displayHistory` | Dashboard loads with past submissions | Submission history table populated with all past submissions |
| `StudentDashboard_noActiveSubmission` | Student has no active submission | "Submit New Proposal" button enabled and prominent |
| `StudentDashboard_activeSubmissionExists` | Student has active submission | "Submit New Proposal" button disabled with tooltip |
| `StudentDashboard_rejectionFeedback` | Student views rejected submission | Rejection feedback displayed in readable format |
| `StudentDashboard_downloadLetter` | Student clicks download on approved submission | PDF downloaded successfully; file named correctly |

**Tools:** Vitest, React Testing Library, MSW (Mock Service Worker)  
**Coverage Target:** 80%+

#### Submission Form Component

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `SubmissionForm_addTitle` | User adds first title | Title field 1 populated; "Add Title" button remains visible |
| `SubmissionForm_add3Titles` | User adds 3 titles | All 3 title fields visible; "Add Title" button disabled |
| `SubmissionForm_removeTitle` | User removes a title | Title field removed; form re-renders correctly |
| `SubmissionForm_submitValid` | User submits form with 3 valid titles | API call made; success message shown; redirect to dashboard |
| `SubmissionForm_submitInvalid` | User submits form with empty title | Validation error shown; form not submitted |
| `SubmissionForm_submitDuplicate` | User submits with duplicate titles | Validation error; user prompted to enter unique titles |

**Tools:** Vitest, React Testing Library  
**Coverage Target:** 80%+

#### Admin Dashboard Component

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `AdminDashboard_displayQueue` | Admin dashboard loads | Queue of pending submissions displayed |
| `AdminDashboard_assignValidator` | Admin clicks "Assign Validator" on a submission | Modal/form opens with list of available validators |
| `AdminDashboard_confirmAssignment` | Admin selects validator and confirms | Submission status updated to "Pending Validator Review"; UI refreshed |
| `AdminDashboard_viewAllSubmissions` | Admin navigates to "All Submissions" tab | Complete list of all submissions with filters (status, date) |
| `AdminDashboard_filterByStatus` | Admin filters submissions by status | List filtered correctly (e.g., only "Approved" shown) |

**Tools:** Vitest, React Testing Library, MSW  
**Coverage Target:** 75%+

#### Validator Dashboard Component

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `ValidatorDashboard_displayAssigned` | Validator dashboard loads | Queue of assigned submissions displayed |
| `ValidatorDashboard_viewSubmissionDetails` | Validator clicks on a submission | Full submission details (all 3 titles) displayed |
| `ValidatorDashboard_approveSubmission` | Validator clicks "Approve" | Modal opens; user selects one title from the 3 options |
| `ValidatorDashboard_confirmApproval` | Validator confirms approval with selected title | Submission status → "Approved"; success message shown |
| `ValidatorDashboard_rejectSubmission` | Validator clicks "Reject" | Modal opens with feedback text area |
| `ValidatorDashboard_confirmRejection` | Validator enters feedback and confirms rejection | Submission status → "Rejected"; feedback stored; success message |
| `ValidatorDashboard_emptyFeedback` | Validator attempts to reject without feedback | Error message; rejection not allowed |

**Tools:** Vitest, React Testing Library, MSW  
**Coverage Target:** 80%+

---

## Integration Testing

### Backend Integration Tests

#### Submission Workflow (Student → Admin → Validator)

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `workflow_submitToApprove` | Student submits → Admin assigns → Validator approves | Submission progresses through all states; letter generated; student notified |
| `workflow_submitToReject` | Student submits → Admin assigns → Validator rejects | Submission rejected; feedback stored; student can resubmit |
| `workflow_resubmitAfterRejection` | Student resubmits after rejection | New submission created; previous rejection does not block |
| `workflow_multipleSubmissions` | Student submits, gets rejected, resubmits, gets approved | System correctly tracks multiple submissions; only latest active |

**Tools:** Jest, Supertest, test MySQL database  
**Coverage Target:** 85%+

#### API Endpoint Integration Tests

**Student Endpoints:**

| Endpoint | Method | Test Case | Expected Status |
|:---|:---|:---|:---|
| `/api/submissions` | POST | Create valid submission | 201 Created |
| `/api/submissions` | POST | Create while active submission exists | 409 Conflict |
| `/api/submissions/me` | GET | Retrieve own submissions | 200 OK |
| `/api/submissions/:id/letter` | GET | Download approval letter (approved submission) | 200 OK + PDF |
| `/api/submissions/:id/letter` | GET | Download letter (non-approved submission) | 403 Forbidden |

**Admin Endpoints:**

| Endpoint | Method | Test Case | Expected Status |
|:---|:---|:---|:---|
| `/api/admin/submissions` | GET | Retrieve all submissions | 200 OK |
| `/api/admin/submissions/:id/assign` | POST | Assign validator | 200 OK |
| `/api/admin/submissions/:id/assign` | POST | Assign with invalid validator ID | 404 Not Found |
| `/api/admin/users` | POST | Create user account | 201 Created |
| `/api/admin/users/:id` | PUT | Update user account | 200 OK |

**Validator Endpoints:**

| Endpoint | Method | Test Case | Expected Status |
|:---|:---|:---|:---|
| `/api/validator/submissions` | GET | Retrieve assigned submissions | 200 OK |
| `/api/validator/submissions/:id/approve` | POST | Approve with valid title index | 200 OK |
| `/api/validator/submissions/:id/approve` | POST | Approve with invalid title index | 400 Bad Request |
| `/api/validator/submissions/:id/reject` | POST | Reject with feedback | 200 OK |
| `/api/validator/submissions/:id/reject` | POST | Reject without feedback | 400 Bad Request |

**Tools:** Supertest, Jest  
**Coverage Target:** 80%+

#### Database Integration Tests

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `db_transactionRollback` | Submission creation fails mid-transaction | All changes rolled back; DB remains consistent |
| `db_foreignKeyConstraint` | Attempt to assign non-existent validator | Foreign key constraint violation; operation rejected |
| `db_uniqueConstraint` | Attempt to create duplicate user email | Unique constraint violation; operation rejected |
| `db_dataIntegrity` | Verify submission record after approval | All related records (approval, letter, notification) consistent |
| `db_concurrentSubmissions` | Two students submit simultaneously | Both submissions created; no race conditions |

**Tools:** Jest, test MySQL database with transaction rollback  
**Coverage Target:** 75%+

#### Notification Integration Tests

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `notification_emailSent` | Submission created; email triggered | Email queued in SendGrid; delivery confirmed |
| `notification_inAppCreated` | Submission created; in-app notification triggered | Notification record created in DB; user can view |
| `notification_multipleRecipients` | Validator assigned; validator + admin notified | Both receive appropriate notifications |
| `notification_failureHandling` | Email service temporarily unavailable | Notification queued for retry; system continues |

**Tools:** Jest, SendGrid mock, test database  
**Coverage Target:** 80%+

#### PDF Generation Integration Tests

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `pdf_generateAndStore` | Validator approves submission | PDF generated from template; stored in S3; URL returned |
| `pdf_templatePopulation` | PDF generated with student data | All placeholders replaced; no template syntax visible |
| `pdf_s3Upload` | PDF uploaded to S3 | File accessible; metadata correct; versioning enabled |
| `pdf_downloadByStudent` | Student downloads approval letter | Correct PDF file returned; headers set for download |

**Tools:** Jest, Puppeteer, AWS S3 mock (or LocalStack)  
**Coverage Target:** 80%+

### Frontend Integration Tests

#### Student Submission Flow

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `flow_submitAndViewStatus` | Student submits form → navigates to dashboard | Submission appears in dashboard with "Pending Admin Review" status |
| `flow_submitAndReceiveNotification` | Student submits → in-app notification appears | Notification badge updates; notification visible in notification center |
| `flow_rejectAndResubmit` | Student views rejection → submits new proposal | New submission created; previous rejection visible in history |
| `flow_approvalAndDownload` | Submission approved → student downloads letter | PDF downloaded successfully; file integrity verified |

**Tools:** Playwright, test backend API  
**Coverage Target:** 75%+

#### Admin Assignment Flow

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `flow_viewQueueAndAssign` | Admin views pending queue → assigns validator | Submission status updated in real-time; validator notified |
| `flow_filterAndSearch` | Admin filters submissions by status and date | List filtered correctly; search results accurate |

**Tools:** Playwright, test backend API  
**Coverage Target:** 70%+

#### Validator Review Flow

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `flow_viewAndApprove` | Validator views assigned submission → approves with title selection | Submission approved; student notified; letter generated |
| `flow_viewAndReject` | Validator views assigned submission → rejects with feedback | Submission rejected; student notified with feedback |

**Tools:** Playwright, test backend API  
**Coverage Target:** 75%+

---

## End-to-End Testing

### Critical User Journeys

#### Journey 1: Student Submission to Approval

**Scenario:** A student submits 3 thesis titles, admin assigns to validator, validator approves one title, student downloads letter.

| Step | Action | Expected Result |
|:---|:---|:---|
| 1 | Student logs in | Dashboard displayed; "Submit New Proposal" button visible |
| 2 | Student clicks "Submit New Proposal" | Submission form opens |
| 3 | Student enters 3 titles and submits | Form submitted; success message shown; redirected to dashboard |
| 4 | Dashboard shows "Pending Admin Review" | Status updated in real-time |
| 5 | Student receives email notification | Email received with submission confirmation |
| 6 | Admin logs in | Admin dashboard shows new submission in queue |
| 7 | Admin assigns validator | Modal opens; validator selected and confirmed |
| 8 | Submission status → "Pending Validator Review" | Status updated; validator notified |
| 9 | Validator logs in | Assigned submission visible in queue |
| 10 | Validator views submission details | All 3 titles displayed |
| 11 | Validator approves and selects title 1 | Approval confirmed; status → "Approved" |
| 12 | Student receives approval notification | Email + in-app notification received |
| 13 | Student views dashboard | "Approved" status displayed; "Download Letter" button visible |
| 14 | Student downloads letter | PDF downloaded; file contains correct student name, title, date |

**Tools:** Playwright  
**Expected Duration:** < 30 seconds per step

#### Journey 2: Student Submission to Rejection and Resubmission

**Scenario:** Student submits, validator rejects with feedback, student resubmits, validator approves.

| Step | Action | Expected Result |
|:---|:---|:---|
| 1-7 | (Same as Journey 1, steps 1-7) | Submission reaches validator |
| 8 | Validator rejects with feedback | Rejection confirmed; feedback stored |
| 9 | Student receives rejection notification | Email + in-app notification with feedback |
| 10 | Student views dashboard | "Rejected" status displayed; feedback visible |
| 11 | Student clicks "Submit New Proposal" | Form opens (button now enabled) |
| 12 | Student enters 3 new titles and submits | New submission created; previous rejection in history |
| 13 | Admin assigns new submission to validator | Status → "Pending Validator Review" |
| 14 | Validator approves new submission | Status → "Approved"; letter generated |
| 15 | Student downloads letter | PDF downloaded successfully |

**Tools:** Playwright  
**Expected Duration:** < 2 minutes total

#### Journey 3: Admin User Management

**Scenario:** Admin creates new student and validator accounts, verifies they can log in.

| Step | Action | Expected Result |
|:---|:---|:---|
| 1 | Admin logs in | Admin dashboard displayed |
| 2 | Admin navigates to "Manage Users" | User management page opens |
| 3 | Admin clicks "Create New User" | User creation form opens |
| 4 | Admin enters student details and saves | Student account created; email sent with credentials |
| 5 | New student logs in with provided credentials | Student dashboard displayed |
| 6 | Admin creates validator account | Validator account created; email sent |
| 7 | New validator logs in | Validator dashboard displayed |

**Tools:** Playwright  
**Expected Duration:** < 5 minutes total

### Cross-Browser & Responsive Testing

| Browser | Versions | Test Focus |
|:---|:---|:---|
| Chrome | Latest 2 versions | Primary browser; full feature testing |
| Firefox | Latest 2 versions | Compatibility; CSS rendering |
| Safari | Latest 2 versions | macOS/iOS compatibility |
| Edge | Latest version | Windows compatibility |

**Responsive Breakpoints:**
- Desktop (1920px, 1366px)
- Tablet (768px)
- Mobile (375px, 414px)

**Tools:** Playwright with multiple browser contexts  
**Coverage Target:** All critical journeys on all browsers and breakpoints

### Performance Testing

| Metric | Target | Tool |
|:---|:---|:---|
| API Response Time (p95) | < 300ms | k6, Artillery |
| Dashboard Load Time | < 2 seconds | Lighthouse, WebPageTest |
| PDF Generation Time | < 5 seconds | Custom timing tests |
| Concurrent Users (no degradation) | 500 | k6 load test |

**Load Test Scenario:**
- 500 concurrent users
- Ramp-up: 50 users/minute
- Duration: 10 minutes
- Endpoints tested: Dashboard load, submission creation, validator assignment

**Tools:** k6, Lighthouse CI  
**Acceptance Criteria:** All metrics meet targets; no errors under load

### Security Testing

| Test Case | Scenario | Expected Outcome |
|:---|:---|:---|
| `auth_sqlInjection` | Attempt SQL injection in login form | Input sanitized; no DB error exposed |
| `auth_xss` | Attempt XSS in submission title field | Input escaped; no script execution |
| `auth_csrf` | Attempt CSRF on form submission | CSRF token validated; request rejected if invalid |
| `auth_jwtTampering` | Tamper with JWT token | Token validation fails; user logged out |
| `rbac_crossUserAccess` | Student attempts to view another student's submission | Access denied; 403 Forbidden |
| `rbac_roleEscalation` | Student attempts to access admin endpoints | Access denied; 403 Forbidden |
| `data_encryption` | Verify data in transit uses TLS | HTTPS enforced; no unencrypted data transmission |
| `data_atRest` | Verify sensitive data encrypted in DB | Passwords hashed (bcrypt); sensitive fields encrypted |

**Tools:** OWASP ZAP, Burp Suite Community, manual testing  
**Coverage Target:** All OWASP Top 10 risks assessed

---

## Testing Tools & Configuration

### Backend Testing Stack

```json
{
  "framework": "Jest",
  "version": "^29.0.0",
  "dependencies": {
    "@nestjs/testing": "^10.0.0",
    "supertest": "^6.3.0",
    "mysql2": "^3.0.0",
    "jest-mock-extended": "^3.0.0"
  },
  "config": "jest.config.js"
}
```

**Jest Configuration Highlights:**
- Test environment: `node`
- Coverage thresholds: 80% statements, 75% branches, 80% functions, 80% lines
- Test timeout: 10 seconds (increased for DB tests)
- Setup files: Database connection, test data seeding

### Frontend Testing Stack

```json
{
  "framework": "Vitest",
  "version": "^0.34.0",
  "dependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "msw": "^1.3.0",
    "vitest": "^0.34.0"
  },
  "config": "vitest.config.ts"
}
```

**Vitest Configuration Highlights:**
- Environment: `jsdom`
- Coverage provider: `v8`
- Coverage thresholds: 80% statements, 75% branches, 80% functions, 80% lines
- Setup files: MSW server initialization, test utilities

### E2E Testing Stack

```json
{
  "framework": "Playwright",
  "version": "^1.40.0",
  "dependencies": {
    "@playwright/test": "^1.40.0"
  },
  "config": "playwright.config.ts"
}
```

**Playwright Configuration Highlights:**
- Browsers: Chromium, Firefox, WebKit
- Base URL: `http://localhost:3000` (dev), `https://staging.skripsihub.com` (staging)
- Timeout: 30 seconds per test
- Retries: 2 (for flaky tests)
- Screenshots on failure: Enabled
- Video on failure: Enabled

### Load Testing Stack

```json
{
  "framework": "k6",
  "version": "^0.47.0",
  "scripts": {
    "load-test": "k6 run tests/load/submission-flow.js",
    "stress-test": "k6 run tests/load/stress.js"
  }
}
```

**k6 Test Scenarios:**
- Ramp-up: 50 users/minute
- Peak load: 500 concurrent users
- Duration: 10 minutes
- Thresholds: p95 response time < 300ms, error rate < 1%

### Security Testing Tools

- **OWASP ZAP:** Automated vulnerability scanning
- **Burp Suite Community:** Manual penetration testing
- **npm audit:** Dependency vulnerability scanning
- **SonarQube:** Code quality and security analysis

---

## CI/CD Integration

### GitHub Actions Workflow

**Trigger:** Every push to `main` and `develop` branches; all pull requests

**Pipeline Stages:**

1. **Lint & Format Check** (2 min)
   - ESLint, Prettier
   - Fail if violations found

2. **Unit Tests** (5 min)
   - Backend: Jest
   - Frontend: Vitest
   - Coverage reports generated
   - Fail if coverage < thresholds

3. **Integration Tests** (8 min)
   - Backend API tests
   - Database tests
   - Notification tests
   - Fail if any test fails

4. **Security Scan** (3 min)
   - npm audit
   - OWASP ZAP baseline scan
   - Fail if critical vulnerabilities found

5. **Build** (3 min)
   - Backend: Nest.js build
   - Frontend: React build
   - Fail if build errors

6. **E2E Tests (Staging)** (10 min)
   - Playwright tests on staging environment
   - Critical journeys only
   - Fail if any journey fails

7. **Performance Tests (Staging)** (5 min)
   - Lighthouse CI
   - k6 smoke test (50 users)
   - Fail if metrics exceed thresholds

**Total Pipeline Duration:** ~40 minutes

**Failure Notifications:** Slack, email to team

### Pre-Commit Hooks

- Run unit tests for changed files
- Run linter and formatter
- Prevent commit if tests fail

### Deployment Gating

- All tests must pass before merge to `main`
- Code review required
- Staging deployment automatic on merge to `main`
- Production deployment manual (requires approval)

---

## Test Data & Fixtures

### Seed Data

**Test Users:**

```
Student:
  - Email: student1@university.edu
  - Password: TestPass123!
  - Role: STUDENT

Admin:
  - Email: admin@university.edu
  - Password: AdminPass123!
  - Role: ADMIN

Validator:
  - Email: validator1@university.edu
  - Password: ValidatorPass123!
  - Role: VALIDATOR
```

**Test Submissions:**

```
Submission 1 (Pending Admin Review):
  - Student: student1@university.edu
  - Titles: ["AI in Healthcare", "Machine Learning Models", "Data Privacy"]
  - Status: PENDING_ADMIN_REVIEW
  - Created: 2024-01-15

Submission 2 (Approved):
  - Student: student2@university.edu
  - Titles: ["Blockchain Security", "Cryptography", "Smart Contracts"]
  - Status: APPROVED
  - Approved Title: "Blockchain Security"
  - Created: 2024-01-10
  - Approved: 2024-01-20

Submission 3 (Rejected):
  - Student: student3@university.edu
  - Titles: ["Generic Title 1", "Generic Title 2", "Generic Title 3"]
  - Status: REJECTED
  - Rejection Feedback: "Titles lack specificity and academic rigor."
  - Created: 2024-01-12
  - Rejected: 2024-01-18
```

### Database Reset

- Before each integration test suite: Truncate all tables
- After each test: Rollback transactions
- Seed test data fresh for each test run

---

## Test Execution & Reporting

### Local Development

```bash
# Run all unit tests
npm run test:unit

# Run unit tests with coverage
npm run test:unit:coverage

# Run integration tests
npm run test:integration

# Run E2E tests (requires running backend + frontend)
npm run test:e2e

# Run all tests
npm run test
```

### CI/CD Execution

- Automated on every commit and PR
- Results reported in GitHub PR comments
- Coverage reports uploaded to Codecov
- Test reports archived as artifacts

### Test Reports

- **Coverage Reports:** HTML reports generated; uploaded to Codecov
- **E2E Reports:** Screenshots and videos on failure; HTML report with timeline
- **Performance Reports:** Lighthouse CI dashboard; k6 results in JSON
- **Security Reports:** OWASP ZAP HTML report; npm audit JSON

### Metrics & Dashboards

- **Test Execution Time:** Tracked per pipeline run
- **Test Pass Rate:** Target 100% on `main` branch
- **Code Coverage:** Dashboard showing coverage trends
- **Flaky Tests:** Identified and tracked; re-runs enabled for known flaky tests

---

## Known Limitations & Future Improvements

### Current Limitations

- E2E tests cover critical paths only; not all edge cases
- Load tests run on staging; production load testing deferred to post-launch
- Security testing is automated baseline; manual penetration testing recommended quarterly
- Cross-browser testing limited to latest 2 versions; older browser support not tested

### Future Improvements

- Implement visual regression testing (Percy, Chromatic)
- Add accessibility testing (axe, WAVE)
- Expand E2E coverage to 80%+ of user journeys
- Implement chaos engineering tests for resilience
- Add contract testing for API versioning
- Implement synthetic monitoring in production

---

## Test Maintenance & Ownership

### Test Ownership

- **Unit Tests:** Owned by feature developers; reviewed in PR
- **Integration Tests:** Owned by backend team; reviewed in PR
- **E2E Tests:** Owned by QA team; maintained in dedicated repository
- **Performance Tests:** Owned by DevOps/Infrastructure team
- **Security Tests:** Owned by Security team; run quarterly

### Test Review Process

- All test code reviewed in PR before merge
- Tests must pass locally before PR submission
- Coverage reports reviewed; coverage regressions blocked
- Flaky tests investigated and fixed within 24 hours

### Test Maintenance Schedule

- **Weekly:** Review and fix failing tests; update test data
- **Monthly:** Review test coverage; identify gaps
- **Quarterly:** Security testing; performance baseline review
- **Annually:** Test strategy review; tool evaluation

---

## Appendix: Test Checklist

### Pre-Release Testing Checklist

- [ ] All unit tests passing (80%+ coverage)
- [ ] All integration tests passing (70%+ coverage)
- [ ] All E2E critical journeys passing
- [ ] Performance tests meet targets (p95 < 300ms, load time < 2s)
- [ ] Security scan passed (no critical vulnerabilities)
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari, Edge)
- [ ] Responsive testing completed (desktop, tablet, mobile)
- [ ] Accessibility audit completed (WCAG 2.1 AA)
- [ ] Load test passed (500 concurrent users, no degradation)
- [ ] Staging environment smoke tests passed
- [ ] Documentation updated (test cases, known issues)
- [ ] Team sign-off obtained

### Post-Deployment Monitoring

- [ ] Production smoke tests passing
- [ ] Error rate < 0.1%
- [ ] API response times within SLA (p95 < 300ms)
- [ ] No critical alerts in Sentry
- [ ] User-reported issues tracked and triaged
- [ ] Performance metrics stable