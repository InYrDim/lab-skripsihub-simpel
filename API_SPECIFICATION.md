# API.md: SkripsiHub

## Authentication & Authorization

SkripsiHub uses **JWT (JSON Web Tokens)** with **Role-Based Access Control (RBAC)** for all API endpoints.

**Authentication Method:**
- Clients must include a valid JWT in the `Authorization` header as a Bearer token: `Authorization: Bearer <token>`
- JWT payload contains user ID, role (`student`, `admin`, `validator`), and permissions.
- Tokens expire after 24 hours; refresh tokens are issued upon login for extended sessions.

**Authorization:**
- All endpoints enforce role-based access control. Requests from unauthorized roles receive a `403 Forbidden` response.
- Validators can only access submissions explicitly assigned to them.
- Students can only view and manage their own submissions.

---

## Standard Response & Pagination Formats

**Success Response (2xx):**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Operation completed successfully"
}
```

**Error Response (4xx/5xx):**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error description",
  "details": { /* optional additional context */ }
}
```

**Pagination Format (for list endpoints):**
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

## API Endpoints

### Authentication

#### POST /auth/login
**Description:** Authenticate a user and issue a JWT token.

**Auth Level:** Public

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "securePassword123"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "usr_001",
      "email": "student@university.edu",
      "name": "John Doe",
      "role": "student",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Login successful"
}
```

**Status Codes:**
- `200 OK` — Login successful.
- `401 Unauthorized` — Invalid email or password.
- `429 Too Many Requests` — Too many failed login attempts; account temporarily locked.

---

#### POST /auth/refresh
**Description:** Refresh an expired access token using a valid refresh token.

**Auth Level:** Public

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Token refreshed successfully"
}
```

**Status Codes:**
- `200 OK` — Token refreshed.
- `401 Unauthorized` — Invalid or expired refresh token.

---

#### POST /auth/logout
**Description:** Invalidate the current session and refresh token.

**Auth Level:** Authenticated (all roles)

**Request Body:** (empty)

**Response Body (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Status Codes:**
- `200 OK` — Logout successful.
- `401 Unauthorized` — Invalid or missing token.

---

### Student Submissions

#### POST /submissions
**Description:** Create a new thesis title submission. A student can only have one active submission at a time; a new submission is blocked until the current one reaches a final state (Approved or Rejected).

**Auth Level:** Student

**Request Body:**
```json
{
  "titles": [
    {
      "title": "Machine Learning Applications in Healthcare",
      "description": "Exploring ML algorithms for disease prediction"
    },
    {
      "title": "Blockchain Security in Financial Systems",
      "description": "Analyzing consensus mechanisms and vulnerabilities"
    },
    {
      "title": "IoT Integration in Smart Cities",
      "description": "Designing scalable IoT architectures"
    }
  ]
}
```

**Response Body (201 Created):**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_001",
    "studentId": "usr_001",
    "status": "pending_admin_review",
    "titles": [
      {
        "titleId": "tit_001",
        "title": "Machine Learning Applications in Healthcare",
        "description": "Exploring ML algorithms for disease prediction"
      },
      {
        "titleId": "tit_002",
        "title": "Blockchain Security in Financial Systems",
        "description": "Analyzing consensus mechanisms and vulnerabilities"
      },
      {
        "titleId": "tit_003",
        "title": "IoT Integration in Smart Cities",
        "description": "Designing scalable IoT architectures"
      }
    ],
    "submittedAt": "2024-01-20T14:30:00Z",
    "statusHistory": [
      {
        "status": "pending_admin_review",
        "timestamp": "2024-01-20T14:30:00Z",
        "actor": "system"
      }
    ]
  },
  "message": "Submission created successfully"
}
```

**Status Codes:**
- `201 Created` — Submission created successfully.
- `400 Bad Request` — Invalid input (e.g., fewer than 1 or more than 3 titles, missing required fields).
- `409 Conflict` — Student already has an active submission in review.
- `401 Unauthorized` — Invalid or missing token.

---

#### GET /submissions/me
**Description:** Retrieve the current and historical submissions for the authenticated student.

**Auth Level:** Student

**Query Parameters:**
- `page` (optional, default: 1) — Page number for pagination.
- `limit` (optional, default: 10) — Number of records per page.
- `status` (optional) — Filter by status: `pending_admin_review`, `pending_validator_review`, `approved`, `rejected`.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "submissionId": "sub_001",
      "status": "approved",
      "titles": [
        {
          "titleId": "tit_001",
          "title": "Machine Learning Applications in Healthcare",
          "description": "Exploring ML algorithms for disease prediction",
          "isApproved": true
        },
        {
          "titleId": "tit_002",
          "title": "Blockchain Security in Financial Systems",
          "description": "Analyzing consensus mechanisms and vulnerabilities",
          "isApproved": false
        },
        {
          "titleId": "tit_003",
          "title": "IoT Integration in Smart Cities",
          "description": "Designing scalable IoT architectures",
          "isApproved": false
        }
      ],
      "submittedAt": "2024-01-20T14:30:00Z",
      "approvedAt": "2024-01-25T10:15:00Z",
      "approvedTitle": "Machine Learning Applications in Healthcare",
      "approvedBy": "Dr. Jane Smith",
      "letterUrl": "https://s3.amazonaws.com/skripsihub/letters/sub_001_letter.pdf",
      "statusHistory": [
        {
          "status": "pending_admin_review",
          "timestamp": "2024-01-20T14:30:00Z",
          "actor": "system"
        },
        {
          "status": "pending_validator_review",
          "timestamp": "2024-01-21T09:00:00Z",
          "actor": "adm_001",
          "assignedValidator": "val_001"
        },
        {
          "status": "approved",
          "timestamp": "2024-01-25T10:15:00Z",
          "actor": "val_001"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "message": "Submissions retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Submissions retrieved successfully.
- `401 Unauthorized` — Invalid or missing token.

---

#### GET /submissions/me/current
**Description:** Retrieve the current active submission for the authenticated student (if one exists).

**Auth Level:** Student

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_002",
    "status": "pending_validator_review",
    "titles": [
      {
        "titleId": "tit_004",
        "title": "Quantum Computing in Cryptography",
        "description": "Analyzing quantum algorithms for encryption"
      },
      {
        "titleId": "tit_005",
        "title": "Neural Networks for Natural Language Processing",
        "description": "Building advanced NLP models"
      },
      {
        "titleId": "tit_006",
        "title": "Distributed Systems Consensus Protocols",
        "description": "Comparing Raft and PBFT implementations"
      }
    ],
    "submittedAt": "2024-01-22T11:00:00Z",
    "assignedValidator": {
      "validatorId": "val_002",
      "name": "Dr. Robert Johnson",
      "email": "r.johnson@university.edu"
    },
    "assignedAt": "2024-01-22T15:30:00Z",
    "statusHistory": [
      {
        "status": "pending_admin_review",
        "timestamp": "2024-01-22T11:00:00Z",
        "actor": "system"
      },
      {
        "status": "pending_validator_review",
        "timestamp": "2024-01-22T15:30:00Z",
        "actor": "adm_002",
        "assignedValidator": "val_002"
      }
    ]
  },
  "message": "Current submission retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Current submission retrieved.
- `204 No Content` — No active submission exists.
- `401 Unauthorized` — Invalid or missing token.

---

#### GET /submissions/me/:submissionId
**Description:** Retrieve detailed information about a specific submission belonging to the authenticated student.

**Auth Level:** Student

**Path Parameters:**
- `submissionId` — The unique identifier of the submission.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_001",
    "studentId": "usr_001",
    "studentName": "John Doe",
    "studentEmail": "john.doe@university.edu",
    "status": "rejected",
    "titles": [
      {
        "titleId": "tit_001",
        "title": "Machine Learning Applications in Healthcare",
        "description": "Exploring ML algorithms for disease prediction"
      },
      {
        "titleId": "tit_002",
        "title": "Blockchain Security in Financial Systems",
        "description": "Analyzing consensus mechanisms and vulnerabilities"
      },
      {
        "titleId": "tit_003",
        "title": "IoT Integration in Smart Cities",
        "description": "Designing scalable IoT architectures"
      }
    ],
    "submittedAt": "2024-01-20T14:30:00Z",
    "rejectedAt": "2024-01-23T16:45:00Z",
    "rejectionReason": "The proposed titles lack sufficient novelty and specificity. Please refine the research scope and provide more detailed problem statements.",
    "rejectedBy": "Dr. Jane Smith",
    "statusHistory": [
      {
        "status": "pending_admin_review",
        "timestamp": "2024-01-20T14:30:00Z",
        "actor": "system"
      },
      {
        "status": "pending_validator_review",
        "timestamp": "2024-01-21T09:00:00Z",
        "actor": "adm_001",
        "assignedValidator": "val_001"
      },
      {
        "status": "rejected",
        "timestamp": "2024-01-23T16:45:00Z",
        "actor": "val_001",
        "reason": "The proposed titles lack sufficient novelty and specificity. Please refine the research scope and provide more detailed problem statements."
      }
    ]
  },
  "message": "Submission details retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Submission details retrieved.
- `403 Forbidden` — Student attempting to access another student's submission.
- `404 Not Found` — Submission does not exist.
- `401 Unauthorized` — Invalid or missing token.

---

### Admin Submissions Management

#### GET /admin/submissions
**Description:** Retrieve all submissions in the system with filtering and pagination. Admins can view submissions at all stages.

**Auth Level:** Admin

**Query Parameters:**
- `page` (optional, default: 1) — Page number for pagination.
- `limit` (optional, default: 20) — Number of records per page.
- `status` (optional) — Filter by status: `pending_admin_review`, `pending_validator_review`, `approved`, `rejected`.
- `sortBy` (optional, default: `submittedAt`) — Sort field: `submittedAt`, `status`, `studentName`.
- `sortOrder` (optional, default: `desc`) — Sort order: `asc` or `desc`.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "submissionId": "sub_001",
      "studentId": "usr_001",
      "studentName": "John Doe",
      "studentEmail": "john.doe@university.edu",
      "status": "pending_admin_review",
      "titleCount": 3,
      "submittedAt": "2024-01-20T14:30:00Z",
      "assignedValidator": null,
      "assignedAt": null
    },
    {
      "submissionId": "sub_002",
      "studentId": "usr_002",
      "studentName": "Jane Smith",
      "studentEmail": "jane.smith@university.edu",
      "status": "pending_validator_review",
      "titleCount": 3,
      "submittedAt": "2024-01-19T10:15:00Z",
      "assignedValidator": {
        "validatorId": "val_001",
        "name": "Dr. Robert Johnson"
      },
      "assignedAt": "2024-01-19T16:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  },
  "message": "Submissions retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Submissions retrieved.
- `401 Unauthorized` — Invalid or missing token.
- `403 Forbidden` — User is not an admin.

---

#### GET /admin/submissions/:submissionId
**Description:** Retrieve detailed information about a specific submission for admin review and assignment.

**Auth Level:** Admin

**Path Parameters:**
- `submissionId` — The unique identifier of the submission.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_001",
    "studentId": "usr_001",
    "studentName": "John Doe",
    "studentEmail": "john.doe@university.edu",
    "studentPhone": "+62812345678",
    "status": "pending_admin_review",
    "titles": [
      {
        "titleId": "tit_001",
        "title": "Machine Learning Applications in Healthcare",
        "description": "Exploring ML algorithms for disease prediction"
      },
      {
        "titleId": "tit_002",
        "title": "Blockchain Security in Financial Systems",
        "description": "Analyzing consensus mechanisms and vulnerabilities"
      },
      {
        "titleId": "tit_003",
        "title": "IoT Integration in Smart Cities",
        "description": "Designing scalable IoT architectures"
      }
    ],
    "submittedAt": "2024-01-20T14:30:00Z",
    "statusHistory": [
      {
        "status": "pending_admin_review",
        "timestamp": "2024-01-20T14:30:00Z",
        "actor": "system"
      }
    ]
  },
  "message": "Submission details retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Submission details retrieved.
- `404 Not Found` — Submission does not exist.
- `401 Unauthorized` — Invalid or missing token.
- `403 Forbidden` — User is not an admin.

---

#### POST /admin/submissions/:submissionId/assign
**Description:** Assign a submission to a specific validator. This action moves the submission to `pending_validator_review` status and notifies the validator.

**Auth Level:** Admin

**Path Parameters:**
- `submissionId` — The unique identifier of the submission.

**Request Body:**
```json
{
  "validatorId": "val_001"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_001",
    "status": "pending_validator_review",
    "assignedValidator": {
      "validatorId": "val_001",
      "name": "Dr. Jane Smith",
      "email": "jane.smith@university.edu"
    },
    "assignedAt": "2024-01-20T15:45:00Z",
    "statusHistory": [
      {
        "status": "pending_admin_review",
        "timestamp": "2024-01-20T14:30:00Z",
        "actor": "system"
      },
      {
        "status": "pending_validator_review",
        "timestamp": "2024-01-20T15:45:00Z",
        "actor": "adm_001",
        "assignedValidator": "val_001"
      }
    ]
  },
  "message": "Submission assigned to validator successfully"
}
```

**Status Codes:**
- `200 OK` — Submission assigned successfully.
- `400 Bad Request` — Invalid validator ID or submission already assigned.
- `404 Not Found` — Submission or validator does not exist.
- `409 Conflict` — Submission is not in `pending_admin_review` status.
- `401 Unauthorized` — Invalid or missing token.
- `403 Forbidden` — User is not an admin.

---

#### GET /admin/validators
**Description:** Retrieve a list of all available validators for assignment.

**Auth Level:** Admin

**Query Parameters:**
- `page` (optional, default: 1) — Page number for pagination.
- `limit` (optional, default: 50) — Number of records per page.
- `status` (optional) — Filter by status: `active`, `inactive`.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "validatorId": "val_001",
      "name": "Dr. Jane Smith",
      "email": "jane.smith@university.edu",
      "department": "Computer Science",
      "status": "active",
      "assignedSubmissions": 3,
      "createdAt": "2024-01-01T08:00:00Z"
    },
    {
      "validatorId": "val_002",
      "name": "Dr. Robert Johnson",
      "email": "r.johnson@university.edu",
      "department": "Information Technology",
      "status": "active",
      "assignedSubmissions": 1,
      "createdAt": "2024-01-01T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 12,
    "totalPages": 1
  },
  "message": "Validators retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Validators retrieved.
- `401 Unauthorized` — Invalid or missing token.
- `403 Forbidden` — User is not an admin.

---

### Validator Submissions Review

#### GET /validator/submissions
**Description:** Retrieve all submissions assigned to the authenticated validator.

**Auth Level:** Validator

**Query Parameters:**
- `page` (optional, default: 1) — Page number for pagination.
- `limit` (optional, default: 20) — Number of records per page.
- `status` (optional) — Filter by status: `pending_validator_review`, `approved`, `rejected`.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "submissionId": "sub_001",
      "studentId": "usr_001",
      "studentName": "John Doe",
      "studentEmail": "john.doe@university.edu",
      "status": "pending_validator_review",
      "titleCount": 3,
      "submittedAt": "2024-01-20T14:30:00Z",
      "assignedAt": "2024-01-20T15:45:00Z",
      "assignedBy": "adm_001"
    },
    {
      "submissionId": "sub_003",
      "studentId": "usr_003",
      "studentName": "Alice Brown",
      "studentEmail": "alice.brown@university.edu",
      "status": "pending_validator_review",
      "titleCount": 3,
      "submittedAt": "2024-01-21T09:20:00Z",
      "assignedAt": "2024-01-21T10:00:00Z",
      "assignedBy": "adm_001"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  },
  "message": "Assigned submissions retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Submissions retrieved.
- `401 Unauthorized` — Invalid or missing token.
- `403 Forbidden` — User is not a validator.

---

#### GET /validator/submissions/:submissionId
**Description:** Retrieve detailed information about a submission assigned to the authenticated validator.

**Auth Level:** Validator

**Path Parameters:**
- `submissionId` — The unique identifier of the submission.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_001",
    "studentId": "usr_001",
    "studentName": "John Doe",
    "studentEmail": "john.doe@university.edu",
    "studentPhone": "+62812345678",
    "status": "pending_validator_review",
    "titles": [
      {
        "titleId": "tit_001",
        "title": "Machine Learning Applications in Healthcare",
        "description": "Exploring ML algorithms for disease prediction"
      },
      {
        "titleId": "tit_002",
        "title": "Blockchain Security in Financial Systems",
        "description": "Analyzing consensus mechanisms and vulnerabilities"
      },
      {
        "titleId": "tit_003",
        "title": "IoT Integration in Smart Cities",
        "description": "Designing scalable IoT architectures"
      }
    ],
    "submittedAt": "2024-01-20T14:30:00Z",
    "assignedAt": "2024-01-20T15:45:00Z",
    "statusHistory": [
      {
        "status": "pending_admin_review",
        "timestamp": "2024-01-20T14:30:00Z",
        "actor": "system"
      },
      {
        "status": "pending_validator_review",
        "timestamp": "2024-01-20T15:45:00Z",
        "actor": "adm_001",
        "assignedValidator": "val_001"
      }
    ]
  },
  "message": "Submission details retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Submission details retrieved.
- `403 Forbidden` — Submission is not assigned to the authenticated validator.
- `404 Not Found` — Submission does not exist.
- `401 Unauthorized` — Invalid or missing token.

---

#### POST /validator/submissions/:submissionId/approve
**Description:** Approve a submission by selecting one of the proposed titles as the final approved title. This action is final and triggers automatic PDF letter generation.

**Auth Level:** Validator

**Path Parameters:**
- `submissionId` — The unique identifier of the submission.

**Request Body:**
```json
{
  "approvedTitleId": "tit_001"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_001",
    "status": "approved",
    "approvedTitle": "Machine Learning Applications in Healthcare",
    "approvedTitleId": "tit_001",
    "approvedAt": "2024-01-25T10:15:00Z",
    "approvedBy": "val_001",
    "approvedByName": "Dr. Jane Smith",
    "letterUrl": "https://s3.amazonaws.com/skripsihub/letters/sub_001_letter.pdf",
    "letterGeneratedAt": "2024-01-25T10:15:30Z",
    "statusHistory": [
      {
        "status": "pending_admin_review",
        "timestamp": "2024-01-20T14:30:00Z",
        "actor": "system"
      },
      {
        "status": "pending_validator_review",
        "timestamp": "2024-01-20T15:45:00Z",
        "actor": "adm_001",
        "assignedValidator": "val_001"
      },
      {
        "status": "approved",
        "timestamp": "2024-01-25T10:15:00Z",
        "actor": "val_001",
        "approvedTitle": "Machine Learning Applications in Healthcare"
      }
    ]
  },
  "message": "Submission approved successfully. Approval letter generated and sent to student."
}
```

**Status Codes:**
- `200 OK` — Submission approved successfully.
- `400 Bad Request` — Invalid title ID or title does not belong to the submission.
- `403 Forbidden` — Submission is not assigned to the authenticated validator.
- `404 Not Found` — Submission or title does not exist.
- `409 Conflict` — Submission is not in `pending_validator_review` status.
- `500 Internal Server Error` — PDF generation failed.
- `401 Unauthorized` — Invalid or missing token.

---

#### POST /validator/submissions/:submissionId/reject
**Description:** Reject a submission with mandatory feedback. The submission returns to the student, who can then submit a new proposal.

**Auth Level:** Validator

**Path Parameters:**
- `submissionId` — The unique identifier of the submission.

**Request Body:**
```json
{
  "rejectionReason": "The proposed titles lack sufficient novelty and specificity. Please refine the research scope and provide more detailed problem statements. Consider focusing on a narrower domain with clearer research questions."
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_001",
    "status": "rejected",
    "rejectedAt": "2024-01-23T16:45:00Z",
    "rejectedBy": "val_001",
    "rejectedByName": "Dr. Jane Smith",
    "rejectionReason": "The proposed titles lack sufficient novelty and specificity. Please refine the research scope and provide more detailed problem statements. Consider focusing on a narrower domain with clearer research questions.",
    "statusHistory": [
      {
        "status": "pending_admin_review",
        "timestamp": "2024-01-20T14:30:00Z",
        "actor": "system"
      },
      {
        "status": "pending_validator_review",
        "timestamp": "2024-01-20T15:45:00Z",
        "actor": "adm_001",
        "assignedValidator": "val_001"
      },
      {
        "status": "rejected",
        "timestamp": "2024-01-23T16:45:00Z",
        "actor": "val_001",
        "reason": "The proposed titles lack sufficient novelty and specificity. Please refine the research scope and provide more detailed problem statements. Consider focusing on a narrower domain with clearer research questions."
      }
    ]
  },
  "message": "Submission rejected successfully. Student has been notified and may submit a new proposal."
}
```

**Status Codes:**
- `200 OK` — Submission rejected successfully.
- `400 Bad Request` — Missing or empty rejection reason.
- `403 Forbidden` — Submission is not assigned to the authenticated validator.
- `404 Not Found` — Submission does not exist.
- `409 Conflict` — Submission is not in `pending_validator_review` status.
- `401 Unauthorized` — Invalid or missing token.

---

### User Management (Admin Only)

#### POST /admin/users
**Description:** Create a new user account (student, admin, or validator).

**Auth Level:** Admin

**Request Body:**
```json
{
  "email": "newstudent@university.edu",
  "name": "New Student",
  "role": "student",
  "password": "InitialPassword123!"
}
```

**Response Body (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": "usr_010",
    "email": "newstudent@university.edu",
    "name": "New Student",
    "role": "student",
    "status": "active",
    "createdAt": "2024-01-26T11:20:00Z"
  },
  "message": "User created successfully"
}
```

**Status Codes:**
- `201 Created` — User created successfully.
- `400 Bad Request` — Invalid input or missing required fields.
- `409 Conflict` — Email already exists.
- `401 Unauthorized` — Invalid or missing token.
- `403 Forbidden` — User is not an admin.

---

#### GET /admin/users
**Description:** Retrieve all users in the system with filtering and pagination.

**Auth Level:** Admin

**Query Parameters:**
- `page` (optional, default: 1) — Page number for pagination.
- `limit` (optional, default: 20) — Number of records per page.
- `role` (optional) — Filter by role: `student`, `admin`, `validator`.
- `status` (optional) — Filter by status: `active`, `inactive`.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "usr_001",
      "email": "john.doe@university.edu",
      "name": "John Doe",
      "role": "student",
      "status": "active",
      "createdAt": "2024-01-01T08:00:00Z",
      "lastLogin": "2024-01-26T09:30:00Z"
    },
    {
      "userId": "val_001",
      "email": "jane.smith@university.edu",
      "name": "Dr. Jane Smith",
      "role": "validator",
      "status": "active",
      "createdAt": "2024-01-01T08:00:00Z",
      "lastLogin": "2024-01-25T14:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "message": "Users retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Users retrieved.
- `401 Unauthorized` — Invalid or missing token.
- `403 Forbidden` — User is not an admin.

---

#### PUT /admin/users/:userId
**Description:** Update user information (name, email, role, status).

**Auth Level:** Admin

**Path Parameters:**
- `userId` — The unique identifier of the user.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.doe.updated@university.edu",
  "status": "active"
}
```

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "usr_001",
    "email": "john.doe.updated@university.edu",
    "name": "John Doe Updated",
    "role": "student",
    "status": "active",
    "updatedAt": "2024-01-26T12:00:00Z"
  },
  "message": "User updated successfully"
}
```

**Status Codes:**
- `200 OK` — User updated successfully.
- `400 Bad Request` — Invalid input.
- `404 Not Found` — User does not exist.
- `409 Conflict` — Email already exists for another user.
- `401 Unauthorized` — Invalid or missing token.
- `403 Forbidden` — User is not an admin.

---

#### DELETE /admin/users/:userId
**Description:** Deactivate a user account (soft delete; account data is retained).

**Auth Level:** Admin

**Path Parameters:**
- `userId` — The unique identifier of the user.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "usr_001",
    "status": "inactive",
    "deactivatedAt": "2024-01-26T12:15:00Z"
  },
  "message": "User deactivated successfully"
}
```

**Status Codes:**
- `200 OK` — User deactivated successfully.
- `404 Not Found` — User does not exist.
- `401 Unauthorized` — Invalid or missing token.
- `403 Forbidden` — User is not an admin.

---

### Notifications

#### GET /notifications
**Description:** Retrieve in-app notifications for the authenticated user.

**Auth Level:** Authenticated (all roles)

**Query Parameters:**
- `page` (optional, default: 1) — Page number for pagination.
- `limit` (optional, default: 20) — Number of records per page.
- `read` (optional) — Filter by read status: `true` or `false`.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "notificationId": "notif_001",
      "type": "submission_received",
      "title": "Submission Received",
      "message": "Your thesis title submission has been received and is pending admin review.",
      "relatedSubmissionId": "sub_001",
      "read": false,
      "createdAt": "2024-01-20T14:30:00Z"
    },
    {
      "notificationId": "notif_002",
      "type": "assigned_to_validator",
      "title": "Assigned to Validator",
      "message": "Your submission has been assigned to Dr. Jane Smith for review.",
      "relatedSubmissionId": "sub_001",
      "read": false,
      "createdAt": "2024-01-20T15:45:00Z"
    },
    {
      "notificationId": "notif_003",
      "type": "submission_approved",
      "title": "Submission Approved",
      "message": "Your thesis title 'Machine Learning Applications in Healthcare' has been approved. Your approval letter is ready for download.",
      "relatedSubmissionId": "sub_001",
      "read": true,
      "createdAt": "2024-01-25T10:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  },
  "message": "Notifications retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Notifications retrieved.
- `401 Unauthorized` — Invalid or missing token.

---

#### PUT /notifications/:notificationId/read
**Description:** Mark a notification as read.

**Auth Level:** Authenticated (all roles)

**Path Parameters:**
- `notificationId` — The unique identifier of the notification.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "notificationId": "notif_001",
    "read": true,
    "readAt": "2024-01-26T13:00:00Z"
  },
  "message": "Notification marked as read"
}
```

**Status Codes:**
- `200 OK` — Notification marked as read.
- `404 Not Found` — Notification does not exist.
- `401 Unauthorized` — Invalid or missing token.

---

#### PUT /notifications/mark-all-read
**Description:** Mark all notifications as read for the authenticated user.

**Auth Level:** Authenticated (all roles)

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "markedCount": 5
  },
  "message": "All notifications marked as read"
}
```

**Status Codes:**
- `200 OK` — All notifications marked as read.
- `401 Unauthorized` — Invalid or missing token.

---

### Documents & Letters

#### GET /documents/letter/:submissionId
**Description:** Download the approval letter (PDF) for an approved submission. Only the student who submitted and admins can access this endpoint.

**Auth Level:** Student (own submission only) or Admin

**Path Parameters:**
- `submissionId` — The unique identifier of the submission.

**Response:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="approval_letter_sub_001.pdf"`
- **Body:** Binary PDF file

**Status Codes:**
- `200 OK` — PDF file returned.
- `403 Forbidden` — User does not have permission to access this letter.
- `404 Not Found` — Submission or letter does not exist.
- `410 Gone` — Submission is not in approved status.
- `401 Unauthorized` — Invalid or missing token.

---

#### GET /documents/letter/:submissionId/preview
**Description:** Retrieve a preview of the approval letter as JSON (for UI display before download).

**Auth Level:** Student (own submission only) or Admin

**Path Parameters:**
- `submissionId` — The unique identifier of the submission.

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_001",
    "studentName": "John Doe",
    "studentId": "usr_001",
    "approvedTitle": "Machine Learning Applications in Healthcare",
    "approvedAt": "2024-01-25T10:15:00Z",
    "approvedBy": "Dr. Jane Smith",
    "letterUrl": "https://s3.amazonaws.com/skripsihub/letters/sub_001_letter.pdf",
    "letterGeneratedAt": "2024-01-25T10:15:30Z",
    "institutionName": "University of Technology",
    "letterNumber": "SKR/2024/001"
  },
  "message": "Letter preview retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Letter preview retrieved.
- `403 Forbidden` — User does not have permission to access this letter.
- `404 Not Found` — Submission or letter does not exist.
- `410 Gone` — Submission is not in approved status.
- `401 Unauthorized` — Invalid or missing token.

---

### Dashboard & Analytics (Admin Only)

#### GET /admin/dashboard/stats
**Description:** Retrieve high-level statistics for the admin dashboard.

**Auth Level:** Admin

**Response Body (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalSubmissions": 156,
    "pendingAdminReview": 12,
    "pendingValidatorReview": 28,
    "approved": 98,
    "rejected": 18,
    "totalStudents": 145,
    "totalValidators": 12,
    "averageTimeToApproval": "4.2 days",
    "rejectionRate": "11.5%",
    "recentActivity": [
      {
        "timestamp": "2024-01-26T13:45:00Z",
        "action": "Submission Approved",
        "actor": "Dr. Jane Smith",
        "details": "Submission sub_045 approved"
      },
      {
        "timestamp": "2024-01-26T12:30:00Z",
        "action": "Submission Assigned",
        "actor": "Admin User",
        "details": "Submission sub_044 assigned to Dr. Robert Johnson"
      }
    ]
  },
  "message": "Dashboard statistics retrieved successfully"
}
```

**Status Codes:**
- `200 OK` — Statistics retrieved.
- `401 Unauthorized` — Invalid or missing token.
- `403 Forbidden` — User is not an admin.

---

## Error Codes Reference

| Error Code | HTTP Status | Description |
|:---|:---:|:---|
| `INVALID_CREDENTIALS` | 401 | Email or password is incorrect. |
| `TOKEN_EXPIRED` | 401 | JWT token has expired. |
| `INVALID_TOKEN` | 401 | JWT token is malformed or invalid. |
| `UNAUTHORIZED` | 403 | User does not have permission to access this resource. |
| `SUBMISSION_BLOCKED` | 409 | Student already has an active submission in review. |
| `INVALID_SUBMISSION_STATE` | 409 | Submission cannot transition to the requested state. |
| `VALIDATOR_NOT_FOUND` | 404 | Specified validator does not exist. |
| `SUBMISSION_NOT_FOUND` | 404 | Submission does not exist. |
| `TITLE_NOT_FOUND` | 404 | Specified title does not exist in the submission. |
| `PDF_GENERATION_FAILED` | 500 | Automatic PDF letter generation encountered an error. |
| `EMAIL_SEND_FAILED` | 500 | Notification email could not be sent. |
| `DUPLICATE_EMAIL` | 409 | Email address already exists in the system. |
| `INVALID_INPUT` | 400 | Request body contains invalid or missing required fields. |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests from this IP address. |

---

## Rate Limiting

All API endpoints are subject to rate limiting to prevent abuse:

- **Authenticated Users:** 100 requests per 15 minutes per user.
- **Public Endpoints (Login):** 5 requests per 15 minutes per IP address.

Rate limit information is included in response headers:
- `X-RateLimit-Limit` — Maximum requests allowed in the window.
- `X-RateLimit-Remaining` — Requests remaining in the current window.
- `X-RateLimit-Reset` — Unix timestamp when the rate limit window resets.

When rate limit is exceeded, the API returns `429 Too Many Requests`.

---

## Webhook Events (Future Enhancement)

The following webhook events may be implemented in future versions for third-party integrations:

- `submission.created` — Triggered when a student submits a new proposal.
- `submission.assigned` — Triggered when an admin assigns a submission to a validator.
- `submission.approved` — Triggered when a validator approves a submission.
- `submission.rejected` — Triggered when a validator rejects a submission.

See the Webhooks documentation (future) for implementation details.