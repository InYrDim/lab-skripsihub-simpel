# PRD: SkripsiHub

## Executive Summary & Product Vision

SkripsiHub is an Academic Submission Management System designed to digitize and streamline the thesis title proposal and approval process. The system facilitates a structured workflow from student submission to final approval, enhancing transparency, efficiency, and record-keeping for academic institutions.

The product vision is to create a centralized, paperless platform that eliminates the manual, error-prone process of thesis title submissions, providing a clear and auditable trail for every proposal.

## Problem Statement & Target Users

The current manual process for thesis title submission is inefficient, opaque, and administratively burdensome. Students lack visibility into their submission status, and academic staff spend significant time on manual tracking, routing, and paperwork. This leads to delays, lost documents, and a frustrating experience for all stakeholders.

*   **Target Users:**
    *   **Students:** Undergraduate/graduate students required to submit a thesis.
    *   **Academic Admins:** Administrative staff responsible for initial verification and routing of submissions.
    *   **Validators (Lecturers/Reviewers):** Academic faculty responsible for reviewing the substance of the thesis titles and making the final approval/rejection decision.

## System Scope & User Roles

The system covers the complete lifecycle of a thesis title submission, from initial proposal by a student to the final decision and letter generation.

| Permission | Student | Admin | Validator |
|:---|:---:|:---:|:---:|
| Submit Titles (up to 3) | ✅ | ❌ | ❌ |
| View Own Submission Status/History | ✅ | ❌ | ❌ |
| Download Final Approval Letter | ✅ | ❌ | ❌ |
| View All Submissions | ❌ | ✅ | ❌ |
| Assign Submission to Validator | ❌ | ✅ | ❌ |
| Manage User Accounts | ❌ | ✅ | ❌ |
| View Assigned Submissions | ❌ | ❌ | ✅ |
| Approve/Reject Assigned Submission | ❌ | ❌ | ✅ |
| Provide Rejection Feedback | ❌ | ❌ | ✅ |

## Functional Requirements

### Student-Facing Requirements
*   **FR-01:** Users must be able to log in using their university-provided credentials.
*   **FR-02:** The student dashboard must prominently display the status of their active submission (e.g., `Pending Admin Review`, `With Validator`, `Approved`, `Rejected`) and a history of past submissions.
*   **FR-03:** A dedicated form shall allow students to submit a single proposal containing up to three distinct thesis titles.
*   **FR-04:** Students must be able to view detailed rejection feedback provided by the Validator if their submission is rejected.
*   **FR-05:** Upon final approval, the system must allow the student to instantly download the generated approval letter (PDF).
*   **FR-06:** A student is blocked from creating a new submission while one is actively in review. A new submission is only allowed after a final decision (Approved/Rejected) is made on the current one.

### Admin-Facing Requirements
*   **FR-07:** The admin dashboard must display a queue of new submissions awaiting initial review.
*   **FR-08:** Admins must be able to review a submission and assign it to a specific, available Validator from a system list. This action moves the submission to the `Pending Validator Review` state.
*   **FR-09:** Admins can view a master list of all submissions and their current status for tracking and oversight.
*   **FR-10:** Admins have the capability to manage Student and Validator user accounts (create, update, deactivate).

### Validator-Facing Requirements
*   **FR-11:** The validator dashboard must display a queue of submissions specifically assigned to them.
*   **FR-12:** Validators can view the full details of an assigned submission, including all proposed titles.
*   **FR-13:** Validators must make a binary decision:
    *   **Approve:** Select one of the proposed titles as the approved one. This action is final.
    *   **Reject:** Reject the entire submission. A text field for mandatory rejection reasoning must be filled out.
*   **FR-14:** The final approval action by a Validator must automatically trigger the generation and storage of the official approval letter.

### System-Wide Requirements
*   **FR-15:** The system must send automated in-app and email notifications to users at key status changes:
    *   **Student:** Submission received, assigned to validator, final decision (approved/rejected).
    *   **Validator:** New submission assigned for review.
*   **FR-16:** The approval letter must be a system-generated PDF based on a predefined HTML template, populated with student details, the approved title, and the date of approval.

## Non-Functional Requirements

| Category | Requirement | Metric |
|:---|:---|:---|
| **Performance** | API Response Time | < 300ms (p95) |
| | Page Load Time (Dashboard) | < 2 seconds |
| | PDF Generation Time | < 5 seconds |
| **Security** | Authentication | JWT with role-based claims (RBAC) |
| | Data Protection | All data encrypted in transit (TLS 1.2+) and at rest. |
| | Access Control | Endpoints strictly protected based on user role. |
| **Scalability** | Concurrent Users | System must support 500 concurrent users with no performance degradation. |
| | Database Connections | Connection pooling must be implemented to handle request spikes. |
| **Availability** | System Uptime | 99.5% |
| **Usability** | UI/UX | The UI must be responsive and functional on modern web browsers (Chrome, Firefox, Safari). The dashboard must be the primary, most intuitive view for all roles. |

## Technology Stack & Rationale

| Component | Technology | Rationale |
|:---|:---|:---|
| Frontend | React.js | Large ecosystem, component-based architecture, and strong community support. Ideal for building a dynamic, single-page application. |
| UI/Styling | Tailwind CSS + shadcn/ui | Utility-first CSS for rapid, consistent styling. shadcn/ui provides accessible, high-quality, unstyled components. |
| Backend | Nest.js (Node.js) | Provides a structured, scalable architecture with TypeScript. Its modularity is well-suited for building robust, maintainable APIs. |
| Database | MySQL | Relational integrity is crucial for academic records. MySQL is reliable, widely supported, and sufficient for the system's scale. |
| Authentication | JWT + RBAC | Stateless, secure, and standard for modern web apps. RBAC is essential for enforcing the defined user permissions. |
| Doc Generation | Puppeteer | Generates high-fidelity PDFs from HTML/CSS templates, ensuring professional-looking and consistent official documents. |
| Notifications | SendGrid & In-App | SendGrid for reliable, scalable email delivery. In-app notifications (via WebSockets or polling) for real-time updates. |
| File Storage | AWS S3 | Industry-standard, highly durable, and scalable object storage for generated PDF documents. |
| Hosting | Vercel (FE) + Railway (BE) | Excellent developer experience, seamless CI/CD, and auto-scaling capabilities suitable for production environments. |
| Monitoring | Sentry | Proactive real-time error tracking and performance monitoring to quickly identify and resolve issues in production. |

## Success Metrics & KPIs

| Metric | Description | Target |
|:---|:---|:---|
| Avg. Time to Approval | Average time from student submission to final validator approval. | < 5 business days |
| Submission Rejection Rate | Percentage of submissions rejected by validators. | < 20% (indicates title quality) |
| User Adoption Rate | % of target students actively using the system within the first semester. | > 90% |
| System Uptime | Percentage of time the system is operational and accessible. | 99.5% |
| Admin Task Reduction | Reduction in time spent by admins on manual submission processing. | > 50% |

## Risk Analysis & Mitigation

| Risk | Impact | Mitigation Strategy |
|:---|:---|:---|
| **Security Breach** | High | Unauthorized access to student data and academic records. | Implement strict RBAC, use prepared statements to prevent SQLi, conduct regular security audits, and enforce strong password policies. |
| **Data Loss** | High | Loss of submission records or generated approval letters. | Implement automated, regular database backups. Store generated PDFs in a durable object store like AWS S3 with versioning enabled. |
| **Scope Creep** | Medium | Requests for features like plagiarism checking or defense scheduling delay the core product. | Adhere strictly to this PRD. All new feature requests must go through a formal change request process and be slated for future versions. |
| **Low User Adoption** | Medium | Students and faculty continue using manual processes due to a complex UI or lack of trust. | Prioritize a simple, dashboard-centric UI. Conduct user training sessions and provide clear documentation. Gather user feedback post-launch. |

## Constraints & Assumptions

*   **Assumptions:**
    *   The university will provide a definitive list of students, admins, and validators for account creation.
    *   Users have access to a modern web browser and a stable internet connection.
    *   The approval workflow (Student -> Admin -> Validator) is fixed and does not change per department.
    *   The format and content of the approval letter template are standardized and pre-approved by the institution.
*   **Constraints:**
    *   The system must integrate with the university's existing identity provider if available; otherwise, it will manage its own user credentials.
    *   The initial release will only support the Indonesian language for UI text and notifications, with English as a secondary option.

## Out of Scope

The initial version of SkripsiHub will **NOT** include:
*   Plagiarism detection integration.
*   Direct messaging or chat functionality between users.
*   Thesis advisor/mentor assignment and communication.
*   Full thesis document uploading and versioning.
*   Scheduling for thesis defense or progress meetings.
*   Grading or scoring modules.