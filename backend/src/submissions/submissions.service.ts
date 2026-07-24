import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { PdfService } from '../pdf/pdf.service';
import { NotificationService } from '../notification/notification.service';
import {
  SubmissionStatus,
  UserRole,
  AssignmentStatus,
  FeedbackDecision,
  NotificationType,
} from '@prisma/client';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly pdfService?: PdfService,
    @Optional() private readonly notificationService?: NotificationService,
  ) {}

  /**
   * Student: Create a new submission
   */
  async createSubmission(
    studentId: string,
    createSubmissionDto: CreateSubmissionDto,
  ) {
    // 1. Check if student already has an active submission
    const activeSubmission = await this.prisma.submission.findFirst({
      where: {
        studentId,
        status: {
          in: [
            SubmissionStatus.DRAFT,
            SubmissionStatus.PENDING_ADMIN_REVIEW,
            SubmissionStatus.PENDING_VALIDATOR_REVIEW,
          ],
        },
      },
    });

    if (activeSubmission) {
      throw new ConflictException({
        success: false,
        error: 'CONFLICT',
        message: 'Student already has an active submission in review.',
      });
    }

    // 2. Validate titles array
    const titles = createSubmissionDto?.titles;
    if (!Array.isArray(titles) || titles.length < 1 || titles.length > 3) {
      throw new BadRequestException('Submission must contain 1 to 3 titles');
    }

    for (const item of titles) {
      if (!item.title || typeof item.title !== 'string') {
        throw new BadRequestException('Each title must be a valid string');
      }
      const trimmed = item.title.trim();
      if (trimmed.length < 10 || trimmed.length > 200) {
        throw new BadRequestException(
          'Each title must be between 10 and 200 characters',
        );
      }
    }

    // 3. Create submission in database
    const now = new Date();
    const submission = await this.prisma.submission.create({
      data: {
        studentId,
        status: SubmissionStatus.PENDING_ADMIN_REVIEW,
        submittedAt: now,
        titles: {
          create: titles.map((item, index) => ({
            title: item.title.trim(),
            description: item.description ? item.description.trim() : null,
            sequenceNumber: index + 1,
          })),
        },
        notifications: {
          create: {
            userId: studentId,
            type: NotificationType.SUBMISSION_RECEIVED,
            message:
              'Your thesis title submission has been received and is pending admin review.',
          },
        },
      },
      include: {
        titles: true,
      },
    });

    return {
      submissionId: submission.id,
      studentId: submission.studentId,
      status: submission.status.toLowerCase(),
      titles: submission.titles.map((t) => ({
        titleId: t.id,
        title: t.title,
        description: t.description,
      })),
      submittedAt: submission.submittedAt,
      statusHistory: this.buildStatusHistory(submission),
    };
  }

  /**
   * Student: List submission history
   */
  async getStudentSubmissions(
    studentId: string,
    query?: { page?: number; limit?: number; status?: string },
  ) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = { studentId };
    if (query?.status) {
      whereClause.status = query.status.toUpperCase() as SubmissionStatus;
    }

    const [total, submissions] = await Promise.all([
      this.prisma.submission.count({ where: whereClause }),
      this.prisma.submission.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          titles: true,
          assignments: {
            include: {
              validator: true,
              feedback: true,
            },
          },
          approvalLetter: true,
        },
      }),
    ]);

    const data = submissions.map((sub) => this.formatSubmissionSummary(sub));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Student: Get current active submission
   */
  async getStudentCurrentSubmission(studentId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: {
        studentId,
        status: {
          in: [
            SubmissionStatus.DRAFT,
            SubmissionStatus.PENDING_ADMIN_REVIEW,
            SubmissionStatus.PENDING_VALIDATOR_REVIEW,
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        titles: true,
        assignments: {
          include: {
            validator: true,
          },
        },
      },
    });

    if (!submission) {
      return null;
    }

    const latestAssignment =
      submission.assignments?.[submission.assignments.length - 1];
    return {
      submissionId: submission.id,
      status: submission.status.toLowerCase(),
      titles: submission.titles.map((t) => ({
        titleId: t.id,
        title: t.title,
        description: t.description,
      })),
      submittedAt: submission.submittedAt,
      assignedValidator: latestAssignment
        ? {
            validatorId: latestAssignment.validator.id,
            name: latestAssignment.validator.fullName,
            email: latestAssignment.validator.email,
          }
        : null,
      assignedAt: latestAssignment ? latestAssignment.assignedAt : null,
      statusHistory: this.buildStatusHistory(submission),
    };
  }

  /**
   * Student: Get detailed submission info by ID
   */
  async getStudentSubmissionById(studentId: string, submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: true,
        titles: true,
        assignments: {
          include: {
            validator: true,
            feedback: true,
          },
        },
        approvalLetter: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    if (submission.studentId !== studentId) {
      throw new ForbiddenException(
        'Access denied: You do not own this submission',
      );
    }

    return this.formatSubmissionDetail(submission);
  }

  /**
   * Admin: Master queue of all submissions
   */
  async getAdminSubmissions(query?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    const requestedStatus = query?.status?.toUpperCase();
    if (requestedStatus === 'REJECTED_BY_ADMIN') {
      whereClause.id = '__unsupported_rejected_by_admin_status__';
    } else if (
      requestedStatus &&
      Object.values(SubmissionStatus).includes(
        requestedStatus as SubmissionStatus,
      )
    ) {
      whereClause.status = requestedStatus as SubmissionStatus;
    }

    const sortField = query?.sortBy === 'status' ? 'status' : 'submittedAt';
    const sortOrder =
      query?.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, submissions] = await Promise.all([
      this.prisma.submission.count({ where: whereClause }),
      this.prisma.submission.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          student: true,
          titles: true,
          assignments: {
            include: {
              validator: true,
              feedback: true,
            },
          },
        },
      }),
    ]);

    const data = submissions.map((sub) => {
      const latestAssignment = sub.assignments?.[sub.assignments.length - 1];
      return {
        submissionId: sub.id,
        studentId: sub.studentId,
        studentName: sub.student.fullName,
        studentEmail: sub.student.email,
        status: sub.status.toLowerCase(),
        titles: sub.titles.map((title) => ({
          titleId: title.id,
          title: title.title,
          description: title.description,
        })),
        submittedAt: sub.submittedAt,
        assignedValidator: latestAssignment
          ? {
              validatorId: latestAssignment.validator.id,
              name: latestAssignment.validator.fullName,
            }
          : null,
        assignedAt: latestAssignment ? latestAssignment.assignedAt : null,
      };
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Shared: Get all submissions for any authenticated role
   */
  async getAllSubmissions(query?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 50;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (query?.status) {
      whereClause.status = query.status.toUpperCase() as SubmissionStatus;
    }

    const sortField = query?.sortBy === 'status' ? 'status' : 'submittedAt';
    const sortOrder =
      query?.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, submissions] = await Promise.all([
      this.prisma.submission.count({ where: whereClause }),
      this.prisma.submission.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          student: true,
          titles: true,
          assignments: {
            include: {
              validator: true,
              feedback: true,
            },
          },
          approvalLetter: true,
        },
      }),
    ]);

    const data = submissions.map((sub) => {
      const latestAssignment = sub.assignments?.[sub.assignments.length - 1];
      const latestFeedback = latestAssignment?.feedback;
      return {
        submissionId: sub.id,
        studentId: sub.studentId,
        nim: sub.student.universityId,
        studentName: sub.student.fullName,
        studentEmail: sub.student.email,
        status: sub.status.toLowerCase(),
        titles: sub.titles.map((t) => ({
          titleId: t.id,
          title: t.title,
          description: t.description,
          isApproved: sub.approvedTitleId === t.id,
        })),
        titleCount: sub.titles.length,
        submittedAt: sub.submittedAt,
        approvedAt: sub.approvalLetter?.generatedAt || null,
        approvedTitle: sub.approvalLetter?.approvedTitle || null,
        approvedByName: latestAssignment?.validator?.fullName || null,
        rejectedAt: latestFeedback?.createdAt || null,
        rejectionReason: latestFeedback?.feedbackText || null,
        assignedValidator: latestAssignment
          ? {
              validatorId: latestAssignment.validator.id,
              name: latestAssignment.validator.fullName,
            }
          : null,
        assignedAt: latestAssignment ? latestAssignment.assignedAt : null,
      };
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin: Detailed view of submission
   */
  async getAdminSubmissionById(submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: true,
        titles: true,
        assignments: {
          include: {
            validator: true,
            feedback: true,
          },
        },
        approvalLetter: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    return this.formatSubmissionDetail(submission);
  }

  /**
   * Admin: Assign submission to validator
   */
  async assignValidator(submissionId: string, validatorId: string) {
    if (!validatorId) {
      throw new BadRequestException('Validator ID is required');
    }

    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignments: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    const assignableStatuses: SubmissionStatus[] = [
      SubmissionStatus.PENDING_ADMIN_REVIEW,
      SubmissionStatus.PENDING_VALIDATOR_REVIEW,
    ];
    if (!assignableStatuses.includes(submission.status)) {
      throw new ConflictException(
        'Submission can only be assigned while awaiting admin or validator review',
      );
    }

    const activeAssignment = submission.assignments.find(
      (assignment) => assignment.status === AssignmentStatus.PENDING,
    );
    if (activeAssignment?.validatorId === validatorId) {
      throw new BadRequestException(
        'Submission is already assigned to the selected validator',
      );
    }

    const validator = await this.prisma.user.findUnique({
      where: { id: validatorId },
    });

    if (!validator || validator.role !== UserRole.VALIDATOR) {
      throw new NotFoundException(`Validator with ID ${validatorId} not found`);
    }

    if (!validator.isActive) {
      throw new BadRequestException('Specified validator is inactive');
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const sub = await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: SubmissionStatus.PENDING_VALIDATOR_REVIEW,
        },
      });

      if (activeAssignment) {
        await tx.assignment.updateMany({
          where: {
            submissionId,
            status: AssignmentStatus.PENDING,
          },
          data: {
            status: AssignmentStatus.COMPLETED,
            completedAt: now,
          },
        });
      }

      await tx.assignment.create({
        data: {
          submissionId,
          validatorId,
          status: AssignmentStatus.PENDING,
          assignedAt: now,
        },
      });

      await tx.notification.create({
        data: {
          userId: validatorId,
          type: NotificationType.ASSIGNED_TO_VALIDATOR,
          message: `New thesis submission assigned to you for review.`,
          relatedSubmissionId: submissionId,
        },
      });

      return tx.submission.findUnique({
        where: { id: submissionId },
        include: {
          student: true,
          titles: true,
          assignments: {
            include: {
              validator: true,
            },
          },
        },
      });
    });

    if (!updated) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    const latestAssignment =
      updated.assignments[updated.assignments.length - 1];

    return {
      submissionId: updated.id,
      status: updated.status.toLowerCase(),
      assignedValidator: {
        validatorId: validator.id,
        name: validator.fullName,
        email: validator.email,
      },
      assignedAt: latestAssignment ? latestAssignment.assignedAt : now,
      statusHistory: this.buildStatusHistory(updated),
    };
  }

  async getAdminDashboardStats() {
    const [
      totalSubmissions,
      pendingAdminReview,
      pendingValidatorReview,
      approved,
      rejected,
      totalStudents,
      totalValidators,
    ] = await Promise.all([
      this.prisma.submission.count(),
      this.prisma.submission.count({
        where: { status: SubmissionStatus.PENDING_ADMIN_REVIEW },
      }),
      this.prisma.submission.count({
        where: { status: SubmissionStatus.PENDING_VALIDATOR_REVIEW },
      }),
      this.prisma.submission.count({
        where: { status: SubmissionStatus.APPROVED },
      }),
      this.prisma.submission.count({
        where: { status: SubmissionStatus.REJECTED_BY_VALIDATOR },
      }),
      this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
      this.prisma.user.count({ where: { role: UserRole.VALIDATOR } }),
    ]);

    const rejectionRate = totalSubmissions
      ? `${((rejected / totalSubmissions) * 100).toFixed(1)}%`
      : '0%';

    return {
      totalSubmissions,
      pendingAdminReview,
      pendingValidatorReview,
      approved,
      rejected,
      totalStudents,
      totalValidators,
      averageTimeToApproval: '0 days',
      rejectionRate,
    };
  }

  async getAllTitles() {
    const titles = await this.prisma.submissionTitle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        submission: {
          include: { student: true },
        },
      },
    });

    return titles.map((title) => ({
      titleId: title.id,
      title: title.title,
      topic: title.topic,
      studentName: title.submission.student.fullName,
      studentNIM: title.submission.student.universityId,
      studentProdi: title.submission.student.prodi,
      submissionStatus: title.submission.status.toLowerCase(),
    }));
  }

  /**
   * Admin: List active/available validators
   */
  async getAdminValidators(query?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 50;
    const skip = (page - 1) * limit;

    const whereClause: any = { role: UserRole.VALIDATOR };
    if (query?.status === 'active') {
      whereClause.isActive = true;
    } else if (query?.status === 'inactive') {
      whereClause.isActive = false;
    }

    const [total, validators] = await Promise.all([
      this.prisma.user.count({ where: whereClause }),
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
        include: {
          assignments: {
            where: { status: AssignmentStatus.PENDING },
          },
        },
      }),
    ]);

    const data = validators.map((v) => ({
      validatorId: v.id,
      name: v.fullName,
      email: v.email,
      universityId: v.universityId,
      status: v.isActive ? 'active' : 'inactive',
      assignedSubmissions: v.assignments.length,
      createdAt: v.createdAt,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Validator: List assigned submissions
   */
  async getValidatorSubmissions(
    validatorId: string,
    query?: { page?: number; limit?: number; status?: string },
  ) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = { validatorId };

    if (query?.status) {
      whereClause.submission = {
        status: query.status.toUpperCase() as SubmissionStatus,
      };
    }

    const [total, assignments] = await Promise.all([
      this.prisma.assignment.count({ where: whereClause }),
      this.prisma.assignment.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { assignedAt: 'desc' },
        include: {
          submission: {
            include: {
              student: true,
              titles: true,
            },
          },
        },
      }),
    ]);

    const data = assignments.map((a) => ({
      submissionId: a.submission.id,
      studentId: a.submission.studentId,
      studentName: a.submission.student.fullName,
      studentEmail: a.submission.student.email,
      status: a.submission.status.toLowerCase(),
      titleCount: a.submission.titles.length,
      submittedAt: a.submission.submittedAt,
      assignedAt: a.assignedAt,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Validator: Get detailed assigned submission
   */
  async getValidatorSubmissionById(validatorId: string, submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: true,
        titles: true,
        assignments: {
          include: {
            validator: true,
            feedback: true,
          },
        },
        approvalLetter: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    const isAssigned = submission.assignments.some(
      (a) => a.validatorId === validatorId,
    );
    if (!isAssigned) {
      throw new ForbiddenException('Submission is not assigned to you');
    }

    return this.formatSubmissionDetail(submission);
  }

  /**
   * Validator: Approve submission
   */
  async approveSubmission(
    validatorId: string,
    submissionId: string,
    approvedTitleId: string,
  ) {
    if (!approvedTitleId) {
      throw new BadRequestException('Approved title ID is required');
    }

    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        titles: true,
        assignments: {
          where: { validatorId, status: AssignmentStatus.PENDING },
          orderBy: { assignedAt: 'desc' },
        },
        student: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    const activeAssignment = submission.assignments?.[0];
    if (!activeAssignment) {
      throw new ForbiddenException(
        'Submission is not assigned to you or assignment is completed',
      );
    }

    if (submission.status !== SubmissionStatus.PENDING_VALIDATOR_REVIEW) {
      throw new ConflictException(
        'Submission is not in PENDING_VALIDATOR_REVIEW status',
      );
    }

    const selectedTitle = submission.titles.find(
      (t) => t.id === approvedTitleId,
    );
    if (!selectedTitle) {
      throw new BadRequestException(
        'Approved title ID does not belong to this submission',
      );
    }

    const now = new Date();
    let pdfUrl = `https://s3.amazonaws.com/skripsihub/letters/${submission.id}_letter.pdf`;
    let pdfS3Key = `letters/${submission.id}_letter.pdf`;

    const validator = await this.prisma.user.findUnique({
      where: { id: validatorId },
    });

    if (this.pdfService) {
      try {
        const studentName = submission.student?.fullName || 'Student';
        const universityId = submission.student?.universityId || '';
        const validatorName = validator?.fullName || 'Validator';

        const pdfResult = await this.pdfService.generateApprovalLetterPdf({
          studentName,
          universityId,
          approvedTitle: selectedTitle.title,
          validatorName,
          approvalDate: now,
          submissionId,
        });

        pdfUrl = pdfResult.pdfUrl;
        pdfS3Key = pdfResult.pdfS3Key;
      } catch (err) {
        // Fallback to default path if error
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Update submission
      await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: SubmissionStatus.APPROVED,
          approvedTitleId,
        },
      });

      // 2. Complete assignment
      await tx.assignment.update({
        where: { id: activeAssignment.id },
        data: {
          status: AssignmentStatus.COMPLETED,
          completedAt: now,
        },
      });

      // 3. Create Validator Feedback
      await tx.validatorFeedback.create({
        data: {
          assignmentId: activeAssignment.id,
          submissionId,
          decision: FeedbackDecision.APPROVED,
          approvedTitleId,
        },
      });

      // 4. Create Approval Letter
      await tx.approvalLetter.create({
        data: {
          submissionId,
          studentId: submission.studentId,
          approvedTitle: selectedTitle.title,
          pdfUrl,
          pdfS3Key,
          generatedAt: now,
        },
      });

      // 5. Notify Student
      await tx.notification.create({
        data: {
          userId: submission.studentId,
          type: NotificationType.FINAL_DECISION,
          message: `Your submission has been approved! Title: ${selectedTitle.title}`,
          relatedSubmissionId: submissionId,
        },
      });

      return tx.submission.findUnique({
        where: { id: submissionId },
        include: {
          student: true,
          titles: true,
          assignments: {
            include: {
              validator: true,
              feedback: true,
            },
          },
          approvalLetter: true,
        },
      });
    });

    if (!updated) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    return {
      submissionId: updated.id,
      status: updated.status.toLowerCase(),
      approvedTitle: selectedTitle.title,
      approvedTitleId: selectedTitle.id,
      approvedAt: now,
      approvedBy: validatorId,
      approvedByName: validator?.fullName || 'Validator',
      letterUrl: pdfUrl,
      letterGeneratedAt: now,
      statusHistory: this.buildStatusHistory(updated),
    };
  }

  /**
   * Validator: Reject submission
   */
  async rejectSubmission(
    validatorId: string,
    submissionId: string,
    rejectionReason: string,
  ) {
    if (
      !rejectionReason ||
      typeof rejectionReason !== 'string' ||
      rejectionReason.trim().length < 10
    ) {
      throw new BadRequestException(
        'Rejection reason must be at least 10 characters long',
      );
    }

    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        titles: true,
        assignments: {
          where: { validatorId, status: AssignmentStatus.PENDING },
          orderBy: { assignedAt: 'desc' },
        },
        student: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    const activeAssignment = submission.assignments?.[0];
    if (!activeAssignment) {
      throw new ForbiddenException(
        'Submission is not assigned to you or assignment is completed',
      );
    }

    if (submission.status !== SubmissionStatus.PENDING_VALIDATOR_REVIEW) {
      throw new ConflictException(
        'Submission is not in PENDING_VALIDATOR_REVIEW status',
      );
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Update submission
      await tx.submission.update({
        where: { id: submissionId },
        data: {
          status: SubmissionStatus.REJECTED_BY_VALIDATOR,
        },
      });

      // 2. Complete assignment
      await tx.assignment.update({
        where: { id: activeAssignment.id },
        data: {
          status: AssignmentStatus.COMPLETED,
          completedAt: now,
        },
      });

      // 3. Create Validator Feedback
      await tx.validatorFeedback.create({
        data: {
          assignmentId: activeAssignment.id,
          submissionId,
          decision: FeedbackDecision.REJECTED,
          feedbackText: rejectionReason.trim(),
        },
      });

      // 4. Notify Student
      await tx.notification.create({
        data: {
          userId: submission.studentId,
          type: NotificationType.FINAL_DECISION,
          message: `Your submission was rejected. Reason: ${rejectionReason.trim()}`,
          relatedSubmissionId: submissionId,
        },
      });

      return tx.submission.findUnique({
        where: { id: submissionId },
        include: {
          student: true,
          titles: true,
          assignments: {
            include: {
              validator: true,
              feedback: true,
            },
          },
        },
      });
    });

    if (!updated) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    const validator = await this.prisma.user.findUnique({
      where: { id: validatorId },
    });

    return {
      submissionId: updated.id,
      status: updated.status.toLowerCase(),
      rejectedAt: now,
      rejectedBy: validatorId,
      rejectedByName: validator?.fullName || 'Validator',
      rejectionReason: rejectionReason.trim(),
      statusHistory: this.buildStatusHistory(updated),
    };
  }

  // --- Helper Methods ---

  private buildStatusHistory(submission: any) {
    const history: any[] = [
      {
        status: 'pending_admin_review',
        timestamp: submission.submittedAt || submission.createdAt,
        actor: 'system',
      },
    ];

    if (submission.assignments && submission.assignments.length > 0) {
      for (const assignment of submission.assignments) {
        history.push({
          status: 'pending_validator_review',
          timestamp: assignment.assignedAt,
          actor: 'admin',
          assignedValidator: assignment.validatorId,
        });

        if (assignment.feedback) {
          if (assignment.feedback.decision === FeedbackDecision.APPROVED) {
            history.push({
              status: 'approved',
              timestamp: assignment.feedback.createdAt,
              actor: assignment.validatorId,
              approvedTitle: submission.approvalLetter?.approvedTitle || '',
            });
          } else if (
            assignment.feedback.decision === FeedbackDecision.REJECTED
          ) {
            history.push({
              status: 'rejected',
              timestamp: assignment.feedback.createdAt,
              actor: assignment.validatorId,
              reason: assignment.feedback.feedbackText,
            });
          }
        }
      }
    }

    return history;
  }

  private formatSubmissionSummary(sub: any) {
    const approvedTitleObj = sub.titles?.find(
      (t: any) => t.id === sub.approvedTitleId,
    );

    const result: any = {
      submissionId: sub.id,
      status: sub.status.toLowerCase(),
      titles: sub.titles?.map((t: any) => ({
        titleId: t.id,
        title: t.title,
        description: t.description,
        isApproved: t.id === sub.approvedTitleId,
      })),
      submittedAt: sub.submittedAt,
      statusHistory: this.buildStatusHistory(sub),
    };

    if (sub.status === SubmissionStatus.APPROVED) {
      const latestFeedback = sub.assignments
        ?.map((a: any) => a.feedback)
        .filter(Boolean)
        .pop();
      result.approvedAt =
        sub.approvalLetter?.generatedAt || latestFeedback?.createdAt;
      result.approvedTitle =
        sub.approvalLetter?.approvedTitle || approvedTitleObj?.title;
      result.letterUrl = sub.approvalLetter?.pdfUrl;
    }

    return result;
  }

  private formatSubmissionDetail(submission: any) {
    const approvedTitleObj = submission.titles?.find(
      (t: any) => t.id === submission.approvedTitleId,
    );

    const latestAssignment =
      submission.assignments?.[submission.assignments.length - 1];
    const latestFeedback = latestAssignment?.feedback;

    const result: any = {
      submissionId: submission.id,
      studentId: submission.studentId,
      studentName: submission.student?.fullName,
      studentEmail: submission.student?.email,
      status: submission.status.toLowerCase(),
      titles: submission.titles?.map((t: any) => ({
        titleId: t.id,
        title: t.title,
        description: t.description,
      })),
      submittedAt: submission.submittedAt,
      statusHistory: this.buildStatusHistory(submission),
    };

    if (submission.status === SubmissionStatus.APPROVED) {
      result.approvedAt =
        submission.approvalLetter?.generatedAt || latestFeedback?.createdAt;
      result.approvedTitle =
        submission.approvalLetter?.approvedTitle || approvedTitleObj?.title;
      result.approvedBy =
        latestAssignment?.validator?.fullName || latestAssignment?.validatorId;
      result.letterUrl = submission.approvalLetter?.pdfUrl;
    } else if (
      submission.status === SubmissionStatus.REJECTED_BY_VALIDATOR &&
      latestFeedback
    ) {
      result.rejectedAt = latestFeedback.createdAt;
      result.rejectionReason = latestFeedback.feedbackText;
      result.rejectedBy =
        latestAssignment?.validator?.fullName || latestAssignment?.validatorId;
    }

    return result;
  }
}
