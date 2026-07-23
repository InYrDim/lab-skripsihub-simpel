import type { Response } from 'express';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
interface RequestUser {
    id: string;
}
interface SubmissionQuery {
    page?: number;
    limit?: number;
    status?: string;
}
export declare class StudentSubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    create(user: RequestUser, createSubmissionDto: CreateSubmissionDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    getMySubmissions(user: RequestUser, query: SubmissionQuery): Promise<{
        success: boolean;
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        message: string;
    }>;
    getCurrentSubmission(user: RequestUser, res: Response): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    } | undefined>;
    getSubmissionDetail(user: RequestUser, submissionId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
}
export {};
