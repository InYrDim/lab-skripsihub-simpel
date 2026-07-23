import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { SubmissionStatus, UserRole, AssignmentStatus } from '@prisma/client';

interface E2EResponse<T = any> {
  body: {
    success?: boolean;
    error?: string;
    message?: string;
    data?: T;
  };
}

describe('SkripsiHub Backend End-to-End Tests (e2e)', () => {
  let app: INestApplication;

  const mockDate = new Date('2026-01-01T00:00:00.000Z');

  const mockStudent = {
    id: 'student-1',
    fullName: 'John Doe',
    email: 'john@student.edu',
    role: UserRole.STUDENT,
    isActive: true,
  };

  const mockValidator = {
    id: 'validator-1',
    fullName: 'Dr. Jane Smith',
    email: 'jane@validator.edu',
    role: UserRole.VALIDATOR,
    isActive: true,
  };

  const mockSubmission = {
    id: 'sub-1',
    studentId: 'student-1',
    status: SubmissionStatus.PENDING_ADMIN_REVIEW,
    approvedTitleId: null,
    submittedAt: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate,
    student: mockStudent,
    titles: [
      {
        id: 'title-1',
        submissionId: 'sub-1',
        title: 'Machine Learning in Healthcare Applications',
        description: 'ML for diagnosis',
        sequenceNumber: 1,
        createdAt: mockDate,
      },
      {
        id: 'title-2',
        submissionId: 'sub-1',
        title: 'Blockchain Security in Financial Systems',
        description: 'Blockchain consensus',
        sequenceNumber: 2,
        createdAt: mockDate,
      },
    ],
    assignments: [],
    approvalLetter: null,
  };

  const mockPrismaService = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    submission: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    assignment: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    validatorFeedback: {
      create: jest.fn(),
    },
    approvalLetter: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
    $transaction: jest
      .fn()
      .mockImplementation((cb: (prisma: Record<string, any>) => Promise<any>) =>
        cb(mockPrismaService),
      ),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest<{
        headers: Record<string, string | undefined>;
        user?: { id: string; role: string };
      }>();
      const roleHeader = req.headers['x-test-role'];
      if (roleHeader === 'admin') {
        req.user = { id: 'admin-1', role: 'ADMIN' };
      } else if (roleHeader === 'validator') {
        req.user = { id: 'validator-1', role: 'VALIDATOR' };
      } else {
        req.user = { id: 'student-1', role: 'STUDENT' };
      }
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: () => true,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Root Endpoint', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer() as object)
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Acceptance Criteria 1 & 2: Student Submissions API (/submissions)', () => {
    it('POST /submissions - should create submission with valid titles (1-3 titles)', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(null);
      mockPrismaService.submission.create.mockResolvedValue(mockSubmission);

      const res = (await request(app.getHttpServer() as object)
        .post('/submissions')
        .set('x-test-role', 'student')
        .send({
          titles: [
            {
              title: 'Machine Learning in Healthcare Applications',
              description: 'ML for diagnosis',
            },
            {
              title: 'Blockchain Security in Financial Systems',
              description: 'Blockchain consensus',
            },
          ],
        })
        .expect(201)) as E2EResponse;

      expect(res.body.success).toBe(true);
      expect(res.body.data?.submissionId).toBe('sub-1');
      expect(res.body.data?.status).toBe('pending_admin_review');
    });

    it('POST /submissions - should reject 0 titles with 400 Bad Request', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(null);

      const res = (await request(app.getHttpServer() as object)
        .post('/submissions')
        .set('x-test-role', 'student')
        .send({
          titles: [],
        })
        .expect(400)) as E2EResponse;

      expect(res.body.message).toContain('1 to 3 titles');
    });

    it('POST /submissions - should reject > 3 titles with 400 Bad Request', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(null);

      const res = (await request(app.getHttpServer() as object)
        .post('/submissions')
        .set('x-test-role', 'student')
        .send({
          titles: [
            { title: 'Valid Proposal Title Number One' },
            { title: 'Valid Proposal Title Number Two' },
            { title: 'Valid Proposal Title Number Three' },
            { title: 'Valid Proposal Title Number Four' },
          ],
        })
        .expect(400)) as E2EResponse;

      expect(res.body.message).toContain('1 to 3 titles');
    });

    it('POST /submissions - should return HTTP 409 Conflict if active submission exists', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(mockSubmission);

      const res = (await request(app.getHttpServer() as object)
        .post('/submissions')
        .set('x-test-role', 'student')
        .send({
          titles: [
            { title: 'Machine Learning in Healthcare Applications' },
          ],
        })
        .expect(409)) as E2EResponse;

      expect(res.body.error).toBe('CONFLICT');
    });
  });

  describe('Acceptance Criteria 3: Admin Validator Assignment (/admin)', () => {
    it('POST /admin/submissions/:id/assign - should assign validator and transition status to pending_validator_review', async () => {
      const assignedSubmission = {
        ...mockSubmission,
        status: SubmissionStatus.PENDING_VALIDATOR_REVIEW,
        assignments: [
          {
            id: 'assign-1',
            submissionId: 'sub-1',
            validatorId: 'validator-1',
            status: AssignmentStatus.PENDING,
            assignedAt: mockDate,
            validator: mockValidator,
          },
        ],
      };

      mockPrismaService.submission.findUnique.mockResolvedValueOnce(mockSubmission);
      mockPrismaService.user.findUnique.mockResolvedValue(mockValidator);
      mockPrismaService.submission.findUnique.mockResolvedValueOnce(assignedSubmission);

      const res = (await request(app.getHttpServer() as object)
        .post('/admin/submissions/sub-1/assign')
        .set('x-test-role', 'admin')
        .send({ validatorId: 'validator-1' })
        .expect(201)) as E2EResponse;

      expect(res.body.success).toBe(true);
      expect(res.body.data?.status).toBe('pending_validator_review');
      expect(res.body.data?.assignedValidator?.validatorId).toBe('validator-1');
    });
  });

  describe('Acceptance Criteria 4 & 5: Validator Approval & Rejection (/validator)', () => {
    const pendingValSubmission = {
      ...mockSubmission,
      status: SubmissionStatus.PENDING_VALIDATOR_REVIEW,
      assignments: [
        {
          id: 'assign-1',
          submissionId: 'sub-1',
          validatorId: 'validator-1',
          status: AssignmentStatus.PENDING,
          assignedAt: mockDate,
        },
      ],
    };

    it('POST /validator/submissions/:id/approve - should approve submission, transition status to approved, and return letterUrl', async () => {
      const approvedSub = {
        ...pendingValSubmission,
        status: SubmissionStatus.APPROVED,
        approvedTitleId: 'title-1',
        approvalLetter: {
          approvedTitle: 'Machine Learning in Healthcare Applications',
          pdfUrl: 'https://s3.amazonaws.com/skripsihub/letters/sub-1_letter.pdf',
          generatedAt: mockDate,
        },
      };

      mockPrismaService.submission.findUnique.mockResolvedValueOnce(pendingValSubmission);
      mockPrismaService.submission.findUnique.mockResolvedValueOnce(approvedSub);
      mockPrismaService.user.findUnique.mockResolvedValue(mockValidator);

      const res = (await request(app.getHttpServer() as object)
        .post('/validator/submissions/sub-1/approve')
        .set('x-test-role', 'validator')
        .send({ approvedTitleId: 'title-1' })
        .expect(201)) as E2EResponse;

      expect(res.body.success).toBe(true);
      expect(res.body.data?.status).toBe('approved');
      expect(res.body.data?.approvedTitleId).toBe('title-1');
      expect(res.body.data?.letterUrl).toBeDefined();
    });

    it('POST /validator/submissions/:id/reject - should return 400 Bad Request when feedback is < 10 chars', async () => {
      const res = (await request(app.getHttpServer() as object)
        .post('/validator/submissions/sub-1/reject')
        .set('x-test-role', 'validator')
        .send({ rejectionReason: 'Too short' })
        .expect(400)) as E2EResponse;

      expect(res.body.message).toContain('at least 10 characters');
    });

    it('POST /validator/submissions/:id/reject - should reject submission when feedback is >= 10 chars', async () => {
      const rejectedSub = {
        ...pendingValSubmission,
        status: SubmissionStatus.REJECTED,
      };

      mockPrismaService.submission.findUnique.mockResolvedValueOnce(pendingValSubmission);
      mockPrismaService.submission.findUnique.mockResolvedValueOnce(rejectedSub);
      mockPrismaService.user.findUnique.mockResolvedValue(mockValidator);

      const res = (await request(app.getHttpServer() as object)
        .post('/validator/submissions/sub-1/reject')
        .set('x-test-role', 'validator')
        .send({ rejectionReason: 'The proposed title scope needs significantly more detail and rigor.' })
        .expect(201)) as E2EResponse;

      expect(res.body.success).toBe(true);
      expect(res.body.data?.status).toBe('rejected');
      expect(res.body.data?.rejectionReason).toContain('significantly more detail');
    });
  });
});
