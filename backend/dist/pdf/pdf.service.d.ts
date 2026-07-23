export interface GenerateApprovalLetterInput {
    studentName: string;
    universityId: string;
    approvedTitle: string;
    validatorName: string;
    approvalDate: Date | string;
    submissionId: string;
}
export interface PdfGenerationResult {
    pdfUrl: string;
    pdfS3Key: string;
    filePath: string;
    buffer: Buffer;
}
export declare class PdfService {
    private readonly logger;
    generateApprovalLetterPdf(studentNameOrInput: string | GenerateApprovalLetterInput, universityId?: string, approvedTitle?: string, validatorName?: string, approvalDate?: Date | string, submissionId?: string): Promise<PdfGenerationResult>;
    private renderHtmlTemplate;
    private generateFallbackPdfBuffer;
}
