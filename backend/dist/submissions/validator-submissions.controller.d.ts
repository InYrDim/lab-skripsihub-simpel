import { SubmissionsService } from './submissions.service';
import { ApproveSubmissionDto } from './dto/approve-submission.dto';
import { RejectSubmissionDto } from './dto/reject-submission.dto';
interface RequestUser {
    id: string;
}
interface ValidatorSubmissionQuery {
    page?: number;
    limit?: number;
    status?: string;
}
export declare class ValidatorSubmissionsController {
    private readonly submissionsService;
    constructor(submissionsService: SubmissionsService);
    getAssignedSubmissions(user: RequestUser, query: ValidatorSubmissionQuery): Promise<{
        success: boolean;
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
        message: string;
    }>;
    getSubmissionDetail(user: RequestUser, submissionId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    approveSubmission(user: RequestUser, submissionId: string, approveDto: ApproveSubmissionDto): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
    rejectSubmission(user: RequestUser, submissionId: string, rejectDto: RejectSubmissionDto): Promise<{
        success: boolean;
        data: {
            submissionId: string;
            status: string;
            rejectedAt: Date;
            rejectedBy: string;
            rejectedByName: string;
            rejectionReason: string;
            statusHistory: any[];
        };
        message: string;
    }>;
}
export {};
