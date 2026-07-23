import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { PdfService } from '../pdf/pdf.service';
import { NotificationService } from '../notification/notification.service';
export declare class SubmissionsService {
    private readonly prisma;
    private readonly pdfService?;
    private readonly notificationService?;
    constructor(prisma: PrismaService, pdfService?: PdfService | undefined, notificationService?: NotificationService | undefined);
    createSubmission(studentId: string, createSubmissionDto: CreateSubmissionDto): Promise<{
        submissionId: string;
        studentId: string;
        status: string;
        titles: {
            titleId: string;
            title: string;
            description: string | null;
        }[];
        submittedAt: Date | null;
        statusHistory: any[];
    }>;
    getStudentSubmissions(studentId: string, query?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStudentCurrentSubmission(studentId: string): Promise<{
        submissionId: string;
        status: string;
        titles: {
            titleId: string;
            title: string;
            description: string | null;
        }[];
        submittedAt: Date | null;
        assignedValidator: {
            validatorId: string;
            name: string;
            email: string;
        } | null;
        assignedAt: Date | null;
        statusHistory: any[];
    } | null>;
    getStudentSubmissionById(studentId: string, submissionId: string): Promise<any>;
    getAdminSubmissions(query?: {
        page?: number;
        limit?: number;
        status?: string;
        sortBy?: string;
        sortOrder?: string;
    }): Promise<{
        data: {
            submissionId: string;
            studentId: string;
            studentName: string;
            studentEmail: string;
            status: string;
            titleCount: number;
            submittedAt: Date | null;
            assignedValidator: {
                validatorId: string;
                name: string;
            } | null;
            assignedAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAdminSubmissionById(submissionId: string): Promise<any>;
    assignValidator(submissionId: string, validatorId: string): Promise<{
        submissionId: string;
        status: string;
        assignedValidator: {
            validatorId: string;
            name: string;
            email: string;
        };
        assignedAt: Date;
        statusHistory: any[];
    }>;
    getAdminValidators(query?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        data: {
            validatorId: string;
            name: string;
            email: string;
            universityId: string;
            status: string;
            assignedSubmissions: number;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getValidatorSubmissions(validatorId: string, query?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        data: {
            submissionId: string;
            studentId: string;
            studentName: string;
            studentEmail: string;
            status: string;
            titleCount: number;
            submittedAt: Date | null;
            assignedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getValidatorSubmissionById(validatorId: string, submissionId: string): Promise<any>;
    approveSubmission(validatorId: string, submissionId: string, approvedTitleId: string): Promise<{
        submissionId: string;
        status: string;
        approvedTitle: string;
        approvedTitleId: string;
        approvedAt: Date;
        approvedBy: string;
        approvedByName: string;
        letterUrl: string;
        letterGeneratedAt: Date;
        statusHistory: any[];
    }>;
    rejectSubmission(validatorId: string, submissionId: string, rejectionReason: string): Promise<{
        submissionId: string;
        status: string;
        rejectedAt: Date;
        rejectedBy: string;
        rejectedByName: string;
        rejectionReason: string;
        statusHistory: any[];
    }>;
    private buildStatusHistory;
    private formatSubmissionSummary;
    private formatSubmissionDetail;
}
