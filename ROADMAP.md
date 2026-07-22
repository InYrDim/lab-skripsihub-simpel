# ROADMAP.md: SkripsiHub

## Phased Delivery Plan

| Phase | Duration | Goals | Key Deliverables |
|:---|:---|:---|:---|
| **Phase 1: Foundation & Core Workflow** | 6 weeks | Establish authentication, user roles, and the complete submission-to-approval workflow. | User management, submission form, admin assignment, validator review, approval letter generation. |
| **Phase 2: Notifications & Polish** | 3 weeks | Implement automated notifications and refine UI/UX based on early feedback. | Email + in-app notifications, dashboard refinements, performance optimization. |
| **Phase 3: Testing & Deployment** | 2 weeks | Comprehensive testing, security hardening, and production deployment. | QA sign-off, security audit, go-live preparation, monitoring setup. |
| **Phase 4: Post-Launch Monitoring & Iteration** | Ongoing | Monitor system health, gather user feedback, and plan P1/P2 features. | Bug fixes, performance tuning, user training materials. |

**Timeline Disclaimer:** This roadmap assumes a team of **3–4 developers** (1 frontend, 1–2 backend, 1 DevOps/QA). Adjust phase durations proportionally for different team sizes. A smaller team (1–2 devs) may extend each phase by 50–100%; a larger team (5+ devs) may compress by 25–40%.

---

## MVP Feature List

### P0: Must Have for Launch (Phase 1 & 2)

These features are **critical** for the system to function and deliver core value. All P0 items must be complete before go-live.

| Feature | Requirement | Status |
|:---|:---|:---|
| **User Authentication & Authorization** | JWT-based login with RBAC for Student, Admin, Validator roles. See FR-01. | Phase 1 |
| **Student Submission Form** | Students submit up to 3 thesis titles in a single proposal. See FR-03. | Phase 1 |
| **Student Dashboard** | Display active submission status and history. See FR-02. | Phase 1 |
| **Admin Submission Queue** | Admins view and assign submissions to validators. See FR-07, FR-08. | Phase 1 |
| **Validator Dashboard** | Validators view assigned submissions and make approve/reject decisions. See FR-11, FR-12, FR-13. | Phase 1 |
| **Approval Letter Generation** | Auto-generate PDF approval letter upon validator approval. See FR-14, FR-16. | Phase 1 |
| **Rejection Workflow** | Validators provide rejection feedback; students can resubmit. See FR-04, FR-13. | Phase 1 |
| **Automated Notifications** | Email + in-app alerts for key status changes. See FR-15. | Phase 2 |
| **Submission Lock** | Students blocked from new submissions while one is in review. See FR-06. | Phase 1 |
| **User Account Management** | Admins create, update, deactivate student and validator accounts. See FR-10. | Phase 1 |

### P1: Should Have Within 1 Month Post-Launch

These features enhance usability and operational efficiency but are not blocking for launch.

| Feature | Requirement | Rationale |
|:---|:---|:---|
| **Bulk User Import** | Admins upload CSV to create multiple student/validator accounts at once. | Reduces manual account creation overhead during semester start. |
| **Submission Analytics Dashboard** | Admins view metrics: total submissions, approval rate, avg. review time. | Provides institutional insights and identifies bottlenecks. |
| **Rejection Reason Templates** | Validators select from predefined rejection reasons with optional custom notes. | Standardizes feedback and speeds up the rejection process. |
| **Email Notification Preferences** | Users opt in/out of specific notification types. | Reduces notification fatigue and improves user experience. |
| **Submission Search & Filter** | Admins/validators search submissions by student name, status, date range. | Improves navigation for high-volume submission queues. |
| **Audit Log** | System logs all state changes (submission, assignment, approval, rejection) with timestamps and user IDs. | Ensures accountability and supports compliance audits. |

### P2: Nice to Have for Future Releases

These features are out of scope for MVP but represent potential future enhancements.

| Feature | Rationale |
|:---|:---|
| **Plagiarism Detection Integration** | Integrate with Turnitin or similar to flag potentially plagiarized titles. |
| **Thesis Advisor Assignment** | Allow admins to assign advisors to approved theses and track advisor-student communication. |
| **Defense Scheduling Module** | Coordinate thesis defense dates and invite examiners. |
| **Full Thesis Document Upload** | Students upload thesis drafts; validators provide document-level feedback. |
| **Multi-Language Support** | Extend UI and notifications to support multiple languages beyond Indonesian and English. |
| **Mobile App** | Native iOS/Android app for on-the-go submission tracking and notifications. |
| **Webhook Integrations** | Allow external systems (e.g., student information system) to subscribe to submission events. |

---

## Milestones

| Milestone | Phase | Target Date | Deliverables |
|:---|:---|:---|:---|
| **M1: Authentication & User Management** | Phase 1 | Week 2 | JWT implementation, RBAC middleware, user account CRUD, role-based dashboards. |
| **M2: Submission & Admin Workflow** | Phase 1 | Week 4 | Student submission form, admin queue, validator assignment, submission state machine. |
| **M3: Validator Review & Approval** | Phase 1 | Week 5 | Validator dashboard, approve/reject logic, approval letter PDF generation. |
| **M4: Notifications & Refinement** | Phase 2 | Week 8 | Email + in-app notifications, UI polish, performance optimization, user testing. |
| **M5: QA & Security Hardening** | Phase 3 | Week 9 | End-to-end testing, security audit, penetration testing, monitoring setup. |
| **M6: Production Deployment** | Phase 3 | Week 11 | Go-live, user training, documentation, post-launch support plan. |
| **M7: Post-Launch Monitoring** | Phase 4 | Week 12+ | Bug fixes, performance tuning, user feedback collection, roadmap for P1 features. |

---

## Dependencies

### External Dependencies

These are third-party services, accounts, or integrations required for the system to function.

| Dependency | Purpose | Status | Notes |
|:---|:---|:---|:---|
| **SendGrid / Mailgun Account** | Email delivery for notifications. | Required | Obtain API keys before Phase 2. Test email templates in staging. |
| **AWS S3 Bucket** | Storage for generated PDF approval letters. | Required | Set up bucket with versioning and lifecycle policies. Configure IAM roles for secure access. |
| **University Identity Provider (Optional)** | SSO integration if available (e.g., LDAP, OAuth). | Optional | If not available, system will manage its own credentials. Clarify with IT before Phase 1. |
| **SSL/TLS Certificate** | Secure HTTPS communication. | Required | Obtain from Let's Encrypt or institutional CA. Configure on hosting platform. |
| **Sentry Account** | Error tracking and performance monitoring. | Required | Set up project, configure alerts, integrate with backend before Phase 3. |
| **Hosting Accounts (Vercel + Railway/Render)** | Frontend and backend deployment platforms. | Required | Create accounts, configure CI/CD pipelines, set environment variables. |

### Internal Dependencies

These are artifacts, specifications, or decisions that must be finalized before development can proceed.

| Dependency | Owner | Deadline | Notes |
|:---|:---|:---|:---|
| **Approval Letter HTML Template** | Academic Affairs / Stakeholders | Week 1 | Finalize layout, branding, and required fields (student name, title, date, signatures). Provide as HTML/CSS mockup. |
| **User Account Seed Data** | University Admin | Week 1 | Provide CSV with initial list of students, admins, and validators for account creation. |
| **API Specification Document** | Backend Lead | Week 1 | Detailed OpenAPI/Swagger spec for all endpoints, request/response schemas, error codes. |
| **UI/UX Mockups** | Design Team | Week 1 | Figma/Adobe XD mockups for all dashboards (student, admin, validator) and forms. Reference FR-02, FR-07, FR-11. |
| **Database Schema Diagram** | Backend Lead | Week 1 | ER diagram showing all entities (User, Submission, Title, ApprovalLetter, Notification) and relationships. |
| **Notification Message Templates** | Product / Communications | Week 2 | Email and in-app notification text for all status changes (submission received, assigned, approved, rejected). |
| **Security & Compliance Checklist** | Security Officer | Week 3 | Requirements for data encryption, access logging, password policies, and compliance with institutional standards. |
| **Test Plan & QA Checklist** | QA Lead | Week 8 | Comprehensive test cases covering all user flows, edge cases, and non-functional requirements. |

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|:---|:---|:---|:---|
| **Scope Creep** | Delays launch; diverts resources from core features. | High | Strictly adhere to this PRD. Document all feature requests in a backlog. Require formal change control for any additions. Communicate scope boundaries to stakeholders early. |
| **Integration Delays with University Systems** | Blocks user account provisioning; delays go-live. | Medium | Clarify identity provider requirements in Week 1. If SSO unavailable, finalize manual account import process early. Have fallback plan (CSV import) ready. |
| **PDF Generation Performance Issues** | Approval letter generation takes > 5 seconds; poor user experience. | Medium | Load-test Puppeteer with realistic templates in Phase 1. Consider async PDF generation with email delivery if needed. Monitor generation times in production. |
| **Low User Adoption** | Students/validators continue manual processes; system underutilized. | Medium | Conduct user training sessions before go-live. Provide clear, simple UI (dashboard-first design). Gather feedback post-launch and iterate quickly. Communicate benefits clearly to stakeholders. |
| **Data Loss or Corruption** | Loss of submission records or approval letters; regulatory/compliance issues. | Low | Implement automated daily database backups with point-in-time recovery. Store PDFs in AWS S3 with versioning. Test backup restoration monthly. |
| **Security Breach or Unauthorized Access** | Exposure of student data; reputational damage; compliance violations. | Low | Implement strict RBAC and input validation. Use prepared statements to prevent SQL injection. Conduct security audit in Phase 3. Enable audit logging for all state changes. Enforce strong password policies. |
| **Validator Bottleneck** | Submissions pile up if validators are unavailable or slow; SLA breaches. | Medium | Monitor submission queue depth and validator workload. Implement assignment balancing logic. Set clear SLAs (e.g., 2-day review target). Escalate overdue submissions to admin. |
| **Email Delivery Failures** | Notifications don't reach users; poor communication and user frustration. | Low | Use SendGrid with retry logic and bounce handling. Monitor delivery rates. Provide in-app notifications as fallback. Test email delivery in staging before go-live. |
| **Browser Compatibility Issues** | UI broken on older browsers; poor user experience for some users. | Low | Test on Chrome, Firefox, Safari, and Edge during Phase 2. Use responsive design and progressive enhancement. Document supported browsers. |

---

## Success Criteria & Go-Live Checklist

### Launch Readiness Criteria

The system is ready for production deployment when **all** of the following are met:

- ✅ All P0 features are complete and tested.
- ✅ Security audit completed with no critical findings.
- ✅ Performance testing confirms < 300ms API response time (p95) and < 2s dashboard load time.
- ✅ Database backups and disaster recovery procedures tested and documented.
- ✅ Monitoring (Sentry, logging) configured and alerting rules set.
- ✅ User training materials prepared and delivered to stakeholders.
- ✅ Approval letter template finalized and tested with sample data.
- ✅ Initial user account seed data imported and verified.
- ✅ Email notification delivery tested end-to-end.
- ✅ Stakeholder sign-off obtained from Academic Affairs and IT.

### Post-Launch Monitoring (First 2 Weeks)

- Monitor system uptime and error rates hourly.
- Track submission volume and average review time.
- Collect user feedback via surveys and support tickets.
- Respond to critical bugs within 4 hours.
- Document lessons learned and plan P1 feature prioritization.

---

## Resource Allocation & Team Structure

| Role | Responsibility | Allocation |
|:---|:---|:---|
| **Frontend Developer** | React.js UI, dashboards, forms, responsive design. | 100% (Phases 1–3) |
| **Backend Developer(s)** | Nest.js API, database schema, business logic, integrations. | 100–200% (Phases 1–3) |
| **DevOps / Infrastructure** | Hosting setup, CI/CD pipelines, monitoring, security. | 50% (Phases 1–3) |
| **QA / Tester** | Test planning, manual testing, performance testing, security testing. | 50% (Phases 2–3) |
| **Product Manager** | Stakeholder communication, scope management, prioritization. | 25% (Ongoing) |
| **Designer (Optional)** | UI/UX mockups, design system, user testing. | 25% (Phase 1) |

---

## Technology Stack Confirmation

See [PRD.md](./PRD.md) for detailed rationale. Summary:

- **Frontend:** React.js + Tailwind CSS + shadcn/ui
- **Backend:** Nest.js (Node.js + TypeScript)
- **Database:** MySQL
- **Authentication:** JWT + RBAC
- **Document Generation:** Puppeteer
- **Notifications:** SendGrid + In-App (WebSockets/polling)
- **File Storage:** AWS S3
- **Hosting:** Vercel (FE) + Railway (BE)
- **Monitoring:** Sentry

---

## Next Steps

1. **Week 1:** Finalize all internal dependencies (API spec, mockups, database schema, approval letter template).
2. **Week 1:** Obtain external accounts and API keys (SendGrid, AWS S3, Sentry, hosting platforms).
3. **Week 2:** Kick off Phase 1 development with authentication and user management.
4. **Week 4:** Conduct mid-phase review; adjust timeline if needed.
5. **Week 8:** Begin Phase 2 (notifications and refinement).
6. **Week 9:** Initiate Phase 3 (QA and security hardening).
7. **Week 11:** Go-live and transition to Phase 4 (post-launch monitoring).