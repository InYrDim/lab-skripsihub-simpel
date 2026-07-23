"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfController = void 0;
const common_1 = require("@nestjs/common");
const pdf_service_1 = require("./pdf.service");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let PdfController = class PdfController {
    pdfService;
    prisma;
    constructor(pdfService, prisma) {
        this.pdfService = pdfService;
        this.prisma = prisma;
    }
    async getApprovalLetterPdf(submissionId, user, res) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                student: true,
                approvalLetter: true,
                assignments: {
                    include: {
                        validator: true,
                    },
                },
                titles: true,
            },
        });
        if (!submission) {
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
        }
        if (user.role === client_1.UserRole.STUDENT && submission.studentId !== user.id) {
            throw new common_1.ForbiddenException('Access denied: You do not own this submission');
        }
        if (submission.status !== client_1.SubmissionStatus.APPROVED) {
            throw new common_1.GoneException('Submission is not in approved status');
        }
        let filePath;
        const fileName = `approval_letter_${submissionId}.pdf`;
        if (submission.approvalLetter?.pdfUrl) {
            const relativePath = submission.approvalLetter.pdfUrl.replace(/^\//, '');
            filePath = path.join(process.cwd(), relativePath);
        }
        else {
            filePath = path.join(process.cwd(), 'uploads', 'letters', fileName);
        }
        if (!fs.existsSync(filePath)) {
            const approvedTitleObj = submission.titles.find((t) => t.id === submission.approvedTitleId);
            const latestAssignment = submission.assignments[submission.assignments.length - 1];
            const result = await this.pdfService.generateApprovalLetterPdf({
                studentName: submission.student.fullName,
                universityId: submission.student.universityId,
                approvedTitle: approvedTitleObj?.title || 'Judul Skripsi',
                validatorName: latestAssignment?.validator?.fullName || 'Validator',
                approvalDate: submission.approvalLetter?.generatedAt || new Date(),
                submissionId: submission.id,
            });
            filePath = result.filePath;
        }
        const pdfBuffer = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.status(common_1.HttpStatus.OK).send(pdfBuffer);
    }
    async getLetterPreview(submissionId, user) {
        const submission = await this.prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                student: true,
                approvalLetter: true,
                assignments: {
                    include: {
                        validator: true,
                    },
                },
                titles: true,
            },
        });
        if (!submission) {
            throw new common_1.NotFoundException(`Submission with ID ${submissionId} not found`);
        }
        if (user.role === client_1.UserRole.STUDENT && submission.studentId !== user.id) {
            throw new common_1.ForbiddenException('Access denied: You do not own this submission');
        }
        if (submission.status !== client_1.SubmissionStatus.APPROVED) {
            throw new common_1.GoneException('Submission is not in approved status');
        }
        const approvedTitleObj = submission.titles.find((t) => t.id === submission.approvedTitleId);
        const latestAssignment = submission.assignments[submission.assignments.length - 1];
        return {
            success: true,
            data: {
                submissionId: submission.id,
                studentName: submission.student.fullName,
                studentId: submission.student.universityId,
                approvedTitle: approvedTitleObj?.title || '',
                approvedAt: submission.approvalLetter?.generatedAt || submission.updatedAt,
                approvedBy: latestAssignment?.validator?.fullName || 'Validator',
                letterUrl: submission.approvalLetter?.pdfUrl ||
                    `/uploads/letters/approval_letter_${submission.id}.pdf`,
                letterGeneratedAt: submission.approvalLetter?.generatedAt || submission.updatedAt,
                institutionName: 'SkripsiHub Academic System',
                letterNumber: `SKR/${submission.id}`,
            },
            message: 'Letter preview retrieved successfully',
        };
    }
};
exports.PdfController = PdfController;
__decorate([
    (0, common_1.Get)([
        'submissions/me/:submissionId/letter',
        'pdf/letter/:submissionId',
        'documents/letter/:submissionId',
    ]),
    (0, roles_decorator_1.Roles)('STUDENT', 'ADMIN', 'VALIDATOR'),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "getApprovalLetterPdf", null);
__decorate([
    (0, common_1.Get)('documents/letter/:submissionId/preview'),
    (0, roles_decorator_1.Roles)('STUDENT', 'ADMIN', 'VALIDATOR'),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "getLetterPreview", null);
exports.PdfController = PdfController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [pdf_service_1.PdfService,
        prisma_service_1.PrismaService])
], PdfController);
//# sourceMappingURL=pdf.controller.js.map