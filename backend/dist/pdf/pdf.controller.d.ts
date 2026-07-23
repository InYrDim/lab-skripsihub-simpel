import type { Response } from 'express';
import { PdfService } from './pdf.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PdfController {
    private readonly pdfService;
    private readonly prisma;
    constructor(pdfService: PdfService, prisma: PrismaService);
    getApprovalLetterPdf(submissionId: string, user: any, res: Response): Promise<void>;
    getLetterPreview(submissionId: string, user: any): Promise<{
        success: boolean;
        data: {
            submissionId: string;
            studentName: string;
            studentId: string;
            approvedTitle: string;
            approvedAt: Date;
            approvedBy: string;
            letterUrl: string;
            letterGeneratedAt: Date;
            institutionName: string;
            letterNumber: string;
        };
        message: string;
    }>;
}
