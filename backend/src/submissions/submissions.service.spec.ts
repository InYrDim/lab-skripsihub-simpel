import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionsService } from './submissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { NotificationService } from '../notification/notification.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SubmissionStatus, UserRole, AssignmentStatus } from '@prisma/client';

describe('SubmissionsService', () => {
  let service: SubmissionsService;

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
      .mockImplementation(async (cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: PdfService,
          useValue: { generateApprovalLetterPdf: jest.fn() },
        },
        { provide: NotificationService, useValue: {} },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSubmission', () => {
    it('Acceptance Criteria 1: should allow student to submit 1 title', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(null);
      mockPrismaService.submission.create.mockResolvedValue({
        ...mockSubmission,
        titles: [mockSubmission.titles[0]],
      });

      const result = await service.createSubmission('student-1', {
        titles: [{ title: 'Machine Learning in Healthcare Applications' }],
      });

      expect(result.submissionId).toEqual('sub-1');
      expect(result.status).toEqual('pending_admin_review');
      expect(result.titles.length).toBe(1);
    });

    it('Acceptance Criteria 1: should allow student to submit up to 3 titles', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(null);
      mockPrismaService.submission.create.mockResolvedValue({
        ...mockSubmission,
        titles: [
          ...mockSubmission.titles,
          {
            id: 'title-3',
            submissionId: 'sub-1',
            title: 'IoT Integration in Smart Cities',
            description: 'IoT architecture',
            sequenceNumber: 3,
            createdAt: mockDate,
          },
        ],
      });

      const result = await service.createSubmission('student-1', {
        titles: [
          { title: 'Machine Learning in Healthcare Applications' },
          { title: 'Blockchain Security in Financial Systems' },
          { title: 'IoT Integration in Smart Cities' },
        ],
      });

      expect(result.submissionId).toEqual('sub-1');
      expect(result.status).toEqual('pending_admin_review');
      expect(result.titles.length).toBe(3);
    });

    it('Acceptance Criteria 1: should throw BadRequestException if student submits 0 titles', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(null);

      await expect(
        service.createSubmission('student-1', {
          titles: [],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Acceptance Criteria 1: should throw BadRequestException if student submits more than 3 titles (4 titles)', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(null);

      await expect(
        service.createSubmission('student-1', {
          titles: [
            { title: 'First Valid Thesis Title Proposal 1' },
            { title: 'Second Valid Thesis Title Proposal 2' },
            { title: 'Third Valid Thesis Title Proposal 3' },
            { title: 'Fourth Valid Thesis Title Proposal 4' },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Acceptance Criteria 2: should throw ConflictException (HTTP 409) if student has active submission in PENDING_ADMIN_REVIEW', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(mockSubmission);

      await expect(
        service.createSubmission('student-1', {
          titles: [{ title: 'Valid Proposal Title with Sufficient Length' }],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('Acceptance Criteria 2: should throw ConflictException (HTTP 409) if student has active submission in PENDING_VALIDATOR_REVIEW', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue({
        ...mockSubmission,
        status: SubmissionStatus.PENDING_VALIDATOR_REVIEW,
      });

      await expect(
        service.createSubmission('student-1', {
          titles: [{ title: 'Valid Proposal Title with Sufficient Length' }],
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if any title length is less than 10 chars', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(null);

      await expect(
        service.createSubmission('student-1', {
          titles: [{ title: 'Too short' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStudentSubmissions', () => {
    it('should return paginated submissions for student', async () => {
      mockPrismaService.submission.count.mockResolvedValue(1);
      mockPrismaService.submission.findMany.mockResolvedValue([mockSubmission]);

      const result = await service.getStudentSubmissions('student-1');

      expect(result.data.length).toBe(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getStudentCurrentSubmission', () => {
    it('should return current active submission if exists', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(mockSubmission);

      const result = await service.getStudentCurrentSubmission('student-1');

      expect(result).not.toBeNull();
      expect(result?.submissionId).toBe('sub-1');
    });

    it('should return null if no active submission exists', async () => {
      mockPrismaService.submission.findFirst.mockResolvedValue(null);

      const result = await service.getStudentCurrentSubmission('student-1');

      expect(result).toBeNull();
    });
  });

  describe('getStudentSubmissionById', () => {
    it('should throw NotFoundException if submission not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(null);

      await expect(
        service.getStudentSubmissionById('student-1', 'sub-999'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if submission belongs to another student', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);

      await expect(
        service.getStudentSubmissionById('student-other', 'sub-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return submission detail if valid', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);

      const result = await service.getStudentSubmissionById(
        'student-1',
        'sub-1',
      );

      expect(result.submissionId).toBe('sub-1');
      expect(result.studentId).toBe('student-1');
    });
  });

  describe('getAdminSubmissions', () => {
    it('should return master queue of submissions', async () => {
      mockPrismaService.submission.count.mockResolvedValue(1);
      mockPrismaService.submission.findMany.mockResolvedValue([mockSubmission]);

      const result = await service.getAdminSubmissions();

      expect(result.data.length).toBe(1);
      expect(result.data[0].studentName).toBe('John Doe');
    });
  });

  describe('assignValidator', () => {
    it('should throw NotFoundException if submission not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(null);

      await expect(
        service.assignValidator('sub-999', 'validator-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if submission status is not PENDING_ADMIN_REVIEW', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue({
        ...mockSubmission,
        status: SubmissionStatus.APPROVED,
      });

      await expect(
        service.assignValidator('sub-1', 'validator-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if validator not found', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.assignValidator('sub-1', 'val-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if validator is inactive', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(mockSubmission);
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockValidator,
        isActive: false,
      });

      await expect(
        service.assignValidator('sub-1', 'validator-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('Acceptance Criteria 3: should assign validator successfully and transition status to PENDING_VALIDATOR_REVIEW', async () => {
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

      mockPrismaService.submission.findUnique.mockResolvedValueOnce(
        mockSubmission,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockValidator);
      mockPrismaService.submission.findUnique.mockResolvedValueOnce(
        assignedSubmission,
      );

      const result = await service.assignValidator('sub-1', 'validator-1');

      expect(result.status).toBe('pending_validator_review');
      expect(result.assignedValidator.validatorId).toBe('validator-1');
    });
  });

  describe('approveSubmission', () => {
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

    it('should throw ConflictException if submission is not in PENDING_VALIDATOR_REVIEW', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue({
        ...mockSubmission,
        status: SubmissionStatus.APPROVED,
        assignments: [
          {
            id: 'assign-1',
            submissionId: 'sub-1',
            validatorId: 'validator-1',
            status: AssignmentStatus.PENDING,
          },
        ],
      });

      await expect(
        service.approveSubmission('validator-1', 'sub-1', 'title-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if approvedTitleId does not belong to submission', async () => {
      mockPrismaService.submission.findUnique.mockResolvedValue(
        pendingValSubmission,
      );

      await expect(
        service.approveSubmission('validator-1', 'sub-1', 'title-999'),
      ).rejects.toThrow(BadRequestException);
    });

    it('Acceptance Criteria 4 & 5: should approve submission by selecting 1 title, transition status to APPROVED, generate PDF letter and create ApprovalLetter record', async () => {
      const approvedSub = {
        ...pendingValSubmission,
        status: SubmissionStatus.APPROVED,
        approvedTitleId: 'title-1',
        approvalLetter: {
          approvedTitle: 'Machine Learning in Healthcare Applications',
          pdfUrl:
            'https://s3.amazonaws.com/skripsihub/letters/sub-1_letter.pdf',
          generatedAt: mockDate,
        },
      };

      mockPrismaService.submission.findUnique.mockResolvedValueOnce(
        pendingValSubmission,
      );
      mockPrismaService.submission.findUnique.mockResolvedValueOnce(
        approvedSub,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockValidator);

      const result = await service.approveSubmission(
        'validator-1',
        'sub-1',
        'title-1',
      );

      expect(result.status).toBe('approved');
      expect(result.approvedTitleId).toBe('title-1');
      expect(result.letterUrl).toBeDefined();
    });
  });

  describe('rejectSubmission', () => {
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

    it('Acceptance Criteria 4: should throw BadRequestException if rejectionReason is empty', async () => {
      await expect(
        service.rejectSubmission('validator-1', 'sub-1', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('Acceptance Criteria 4: should throw BadRequestException if rejectionReason is less than 10 characters', async () => {
      await expect(
        service.rejectSubmission('validator-1', 'sub-1', 'Too short'),
      ).rejects.toThrow(BadRequestException);
    });

    it('Acceptance Criteria 4: should reject submission successfully when feedback is >= 10 characters', async () => {
      const rejectedSub = {
        ...pendingValSubmission,
        status: SubmissionStatus.REJECTED,
      };

      mockPrismaService.submission.findUnique.mockResolvedValueOnce(
        pendingValSubmission,
      );
      mockPrismaService.submission.findUnique.mockResolvedValueOnce(
        rejectedSub,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockValidator);

      const result = await service.rejectSubmission(
        'validator-1',
        'sub-1',
        'Rejection reason is long enough and clear.',
      );

      expect(result.status).toBe('rejected');
      expect(result.rejectionReason).toBe(
        'Rejection reason is long enough and clear.',
      );
    });
  });
});
