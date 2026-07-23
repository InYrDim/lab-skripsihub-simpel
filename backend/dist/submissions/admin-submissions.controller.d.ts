import { SubmissionsService } from './submissions.service';
import { AssignSubmissionDto } from './dto/assign-submission.dto';
interface AdminSubmissionsQuery {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
}
interface ValidatorQuery {
    page?: number;
    limit?: number;
    status?: string;
}
export declare class AdminSubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    getAllSubmissions(query: AdminSubmissionsQuery): Promise<{
        success: boolean;
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
        message: string;
    }>;
    getSubmissionDetail(submissionId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    assignValidator(submissionId: string, assignDto: AssignSubmissionDto): Promise<{
        success: boolean;
        data: {
            submissionId: string;
            status: string;
            assignedValidator: {
                validatorId: string;
                name: string;
                email: string;
            };
            assignedAt: Date;
            statusHistory: any[];
        };
        message: string;
    }>;
    getValidators(query: ValidatorQuery): Promise<{
        success: boolean;
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
        message: string;
    }>;
}
export {};
