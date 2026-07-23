"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pdf_service_1 = require("../pdf/pdf.service");
const notification_service_1 = require("../notification/notification.service");
const client_1 = require("@prisma/client");
let SubmissionsService = class SubmissionsService {
    prisma;
    pdfService;
    notificationService;
    constructor(prisma, pdfService, notificationService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
        this.notificationService = notificationService;
    }
    async createSubmission(studentId, createSubmissionDto) {
        const activeSubmission = await this.prisma.submission.findFirst({
            where: {
                studentId,
                status: {
                    in: [
                        client_1.SubmissionStatus.DRAFT,
                        client_1.SubmissionStatus.PENDING_ADMIN_REVIEW,
                        client_1.SubmissionStatus.PENDING_VALIDATOR_REVIEW,
                    ],
                },
            },
        });
        if (activeSubmission) {
            throw new common_1.ConflictException({
                success: false,
                error: 'CONFLICT',
                message: 'Student already has an active submission in review.',
            });
        }
        const titles = createSubmissionDto?.titles;
        if (!Array.isArray(titles) || titles.length < 1 || titles.length > 3) {
            throw new common_1.BadRequestException('Submission must contain 1 to 3 titles');
        }
        for (const item of titles) {
            if (!item.title || typeof item.title !== 'string') {
                throw new common_1.BadRequestException('Each title must be a valid string');
            }
            const trimmed = item.title.trim();
            if (trimmed.length < 10 || trimmed.length > 200) {
                throw new common_1.BadRequestException('Each title must be between 10 and 200 characters');
            }
        }
        const now = new Date();
        const submission = await this.prisma.submission.create({
            data: {
                studentId,
                status: client_1.SubmissionStatus.PENDING_ADMIN_REVIEW,
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
                        type: client_1.NotificationType.SUBMISSION_RECEIVED,
                        message: 'Your thesis title submission has been received and is pending admin review.',
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
    async getStudentSubmissions(studentId, query) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 10;
        const skip = (page - 1) * limit;
        const whereClause = { studentId };
        if (query?.status) {
            whereClause.status = query.status.toUpperCase();
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
    async getStudentCurrentSubmission(studentId) {
        const submission = await this.prisma.submission.findFirst({
            where: {
                studentId,
                status: {
                    in: [
                        client_1.SubmissionStatus.DRAFT,
                        client_1.SubmissionStatus.PENDING_ADMIN_REVIEW,
                        client_1.SubmissionStatus.PENDING_VALIDATOR_REVIEW,
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
        const latestAssignment = submission.assignments?.[submission.assignments.length - 1];
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
    async getStudentSubmissionById(studentId, submissionId) {
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
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
        }
        if (submission.studentId !== studentId) {
            throw new common_1.ForbiddenException('Access denied: You do not own this submission');
        }
        return this.formatSubmissionDetail(submission);
    }
    async getAdminSubmissions(query) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 20;
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (query?.status) {
            whereClause.status = query.status.toUpperCase();
        }
        const sortField = query?.sortBy === 'status' ? 'status' : 'submittedAt';
        const sortOrder = query?.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
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
                titleCount: sub.titles.length,
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
    async getAdminSubmissionById(submissionId) {
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
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
        }
        return this.formatSubmissionDetail(submission);
    }
    async assignValidator(submissionId, validatorId) {
        if (!validatorId) {
            throw new common_1.BadRequestException('Validator ID is required');
        }
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                assignments: true,
            },
        });
        if (!submission) {
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
        }
        if (submission.status !== client_1.SubmissionStatus.PENDING_ADMIN_REVIEW) {
            throw new common_1.ConflictException('Submission is not in PENDING_ADMIN_REVIEW status');
        }
        const validator = await this.prisma.user.findUnique({
            where: { id: validatorId },
        });
        if (!validator || validator.role !== client_1.UserRole.VALIDATOR) {
            throw new common_1.NotFoundException(`Validator with ID ${validatorId} not found`);
        }
        if (!validator.isActive) {
            throw new common_1.BadRequestException('Specified validator is inactive');
        }
        const now = new Date();
        const updated = await this.prisma.$transaction(async (tx) => {
            const sub = await tx.submission.update({
                where: { id: submissionId },
                data: {
                    status: client_1.SubmissionStatus.PENDING_VALIDATOR_REVIEW,
                },
            });
            await tx.assignment.create({
                data: {
                    submissionId,
                    validatorId,
                    status: client_1.AssignmentStatus.PENDING,
                    assignedAt: now,
                },
            });
            await tx.notification.create({
                data: {
                    userId: validatorId,
                    type: client_1.NotificationType.ASSIGNED_TO_VALIDATOR,
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
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
        }
        const latestAssignment = updated.assignments[updated.assignments.length - 1];
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
    async getAdminValidators(query) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 50;
        const skip = (page - 1) * limit;
        const whereClause = { role: client_1.UserRole.VALIDATOR };
        if (query?.status === 'active') {
            whereClause.isActive = true;
        }
        else if (query?.status === 'inactive') {
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
                        where: { status: client_1.AssignmentStatus.PENDING },
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
    async getValidatorSubmissions(validatorId, query) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 20;
        const skip = (page - 1) * limit;
        const whereClause = { validatorId };
        if (query?.status) {
            whereClause.submission = {
                status: query.status.toUpperCase(),
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
    async getValidatorSubmissionById(validatorId, submissionId) {
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
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
        }
        const isAssigned = submission.assignments.some((a) => a.validatorId === validatorId);
        if (!isAssigned) {
            throw new common_1.ForbiddenException('Submission is not assigned to you');
        }
        return this.formatSubmissionDetail(submission);
    }
    async approveSubmission(validatorId, submissionId, approvedTitleId) {
        if (!approvedTitleId) {
            throw new common_1.BadRequestException('Approved title ID is required');
        }
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                titles: true,
                assignments: {
                    where: { validatorId, status: client_1.AssignmentStatus.PENDING },
                    orderBy: { assignedAt: 'desc' },
                },
                student: true,
            },
        });
        if (!submission) {
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
        }
        const activeAssignment = submission.assignments?.[0];
        if (!activeAssignment) {
            throw new common_1.ForbiddenException('Submission is not assigned to you or assignment is completed');
        }
        if (submission.status !== client_1.SubmissionStatus.PENDING_VALIDATOR_REVIEW) {
            throw new common_1.ConflictException('Submission is not in PENDING_VALIDATOR_REVIEW status');
        }
        const selectedTitle = submission.titles.find((t) => t.id === approvedTitleId);
        if (!selectedTitle) {
            throw new common_1.BadRequestException('Approved title ID does not belong to this submission');
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
            }
            catch (err) {
            }
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            await tx.submission.update({
                where: { id: submissionId },
                data: {
                    status: client_1.SubmissionStatus.APPROVED,
                    approvedTitleId,
                },
            });
            await tx.assignment.update({
                where: { id: activeAssignment.id },
                data: {
                    status: client_1.AssignmentStatus.COMPLETED,
                    completedAt: now,
                },
            });
            await tx.validatorFeedback.create({
                data: {
                    assignmentId: activeAssignment.id,
                    submissionId,
                    decision: client_1.FeedbackDecision.APPROVED,
                    approvedTitleId,
                },
            });
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
            await tx.notification.create({
                data: {
                    userId: submission.studentId,
                    type: client_1.NotificationType.FINAL_DECISION,
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
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
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
    async rejectSubmission(validatorId, submissionId, rejectionReason) {
        if (!rejectionReason ||
            typeof rejectionReason !== 'string' ||
            rejectionReason.trim().length < 10) {
            throw new common_1.BadRequestException('Rejection reason must be at least 10 characters long');
        }
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                titles: true,
                assignments: {
                    where: { validatorId, status: client_1.AssignmentStatus.PENDING },
                    orderBy: { assignedAt: 'desc' },
                },
                student: true,
            },
        });
        if (!submission) {
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
        }
        const activeAssignment = submission.assignments?.[0];
        if (!activeAssignment) {
            throw new common_1.ForbiddenException('Submission is not assigned to you or assignment is completed');
        }
        if (submission.status !== client_1.SubmissionStatus.PENDING_VALIDATOR_REVIEW) {
            throw new common_1.ConflictException('Submission is not in PENDING_VALIDATOR_REVIEW status');
        }
        const now = new Date();
        const updated = await this.prisma.$transaction(async (tx) => {
            await tx.submission.update({
                where: { id: submissionId },
                data: {
                    status: client_1.SubmissionStatus.REJECTED,
                },
            });
            await tx.assignment.update({
                where: { id: activeAssignment.id },
                data: {
                    status: client_1.AssignmentStatus.COMPLETED,
                    completedAt: now,
                },
            });
            await tx.validatorFeedback.create({
                data: {
                    assignmentId: activeAssignment.id,
                    submissionId,
                    decision: client_1.FeedbackDecision.REJECTED,
                    feedbackText: rejectionReason.trim(),
                },
            });
            await tx.notification.create({
                data: {
                    userId: submission.studentId,
                    type: client_1.NotificationType.FINAL_DECISION,
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
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
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
    buildStatusHistory(submission) {
        const history = [
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
                    if (assignment.feedback.decision === client_1.FeedbackDecision.APPROVED) {
                        history.push({
                            status: 'approved',
                            timestamp: assignment.feedback.createdAt,
                            actor: assignment.validatorId,
                            approvedTitle: submission.approvalLetter?.approvedTitle || '',
                        });
                    }
                    else if (assignment.feedback.decision === client_1.FeedbackDecision.REJECTED) {
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
    formatSubmissionSummary(sub) {
        const approvedTitleObj = sub.titles?.find((t) => t.id === sub.approvedTitleId);
        const result = {
            submissionId: sub.id,
            status: sub.status.toLowerCase(),
            titles: sub.titles?.map((t) => ({
                titleId: t.id,
                title: t.title,
                description: t.description,
                isApproved: t.id === sub.approvedTitleId,
            })),
            submittedAt: sub.submittedAt,
            statusHistory: this.buildStatusHistory(sub),
        };
        if (sub.status === client_1.SubmissionStatus.APPROVED) {
            const latestFeedback = sub.assignments
                ?.map((a) => a.feedback)
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
    formatSubmissionDetail(submission) {
        const approvedTitleObj = submission.titles?.find((t) => t.id === submission.approvedTitleId);
        const latestAssignment = submission.assignments?.[submission.assignments.length - 1];
        const latestFeedback = latestAssignment?.feedback;
        const result = {
            submissionId: submission.id,
            studentId: submission.studentId,
            studentName: submission.student?.fullName,
            studentEmail: submission.student?.email,
            status: submission.status.toLowerCase(),
            titles: submission.titles?.map((t) => ({
                titleId: t.id,
                title: t.title,
                description: t.description,
            })),
            submittedAt: submission.submittedAt,
            statusHistory: this.buildStatusHistory(submission),
        };
        if (submission.status === client_1.SubmissionStatus.APPROVED) {
            result.approvedAt =
                submission.approvalLetter?.generatedAt || latestFeedback?.createdAt;
            result.approvedTitle =
                submission.approvalLetter?.approvedTitle || approvedTitleObj?.title;
            result.approvedBy =
                latestAssignment?.validator?.fullName || latestAssignment?.validatorId;
            result.letterUrl = submission.approvalLetter?.pdfUrl;
        }
        else if (submission.status === client_1.SubmissionStatus.REJECTED &&
            latestFeedback) {
            result.rejectedAt = latestFeedback.createdAt;
            result.rejectionReason = latestFeedback.feedbackText;
            result.rejectedBy =
                latestAssignment?.validator?.fullName || latestAssignment?.validatorId;
        }
        return result;
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService,
        notification_service_1.NotificationService])
], SubmissionsService);
//# sourceMappingURL=submissions.service.js.map