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
exports.ValidatorSubmissionsController = void 0;
const common_1 = require("@nestjs/common");
const submissions_service_1 = require("./submissions.service");
const approve_submission_dto_1 = require("./dto/approve-submission.dto");
const reject_submission_dto_1 = require("./dto/reject-submission.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ValidatorSubmissionsController = class ValidatorSubmissionsController {
    submissionsService;
    constructor(submissionsService) {
        this.submissionsService = submissionsService;
    }
    async getAssignedSubmissions(user, query) {
        const result = await this.submissionsService.getValidatorSubmissions(user.id, query);
        return {
            success: true,
            data: result.data,
            pagination: result.pagination,
            message: 'Assigned submissions retrieved successfully',
        };
    }
    async getSubmissionDetail(user, submissionId) {
        const result = await this.submissionsService.getValidatorSubmissionById(user.id, submissionId);
        return {
            success: true,
            data: result,
            message: 'Submission details retrieved successfully',
        };
    }
    async approveSubmission(user, submissionId, approveDto) {
        const result = await this.submissionsService.approveSubmission(user.id, submissionId, approveDto.approvedTitleId);
        return {
            success: true,
            data: result,
            message: 'Submission approved successfully. Approval letter generated and sent to student.',
        };
    }
    async rejectSubmission(user, submissionId, rejectDto) {
        const result = await this.submissionsService.rejectSubmission(user.id, submissionId, rejectDto.rejectionReason);
        return {
            success: true,
            data: result,
            message: 'Submission rejected successfully. Student has been notified and may submit a new proposal.',
        };
    }
};
exports.ValidatorSubmissionsController = ValidatorSubmissionsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('VALIDATOR'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ValidatorSubmissionsController.prototype, "getAssignedSubmissions", null);
__decorate([
    (0, common_1.Get)(':submissionId'),
    (0, roles_decorator_1.Roles)('VALIDATOR'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('submissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ValidatorSubmissionsController.prototype, "getSubmissionDetail", null);
__decorate([
    (0, common_1.Post)(':submissionId/approve'),
    (0, roles_decorator_1.Roles)('VALIDATOR'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('submissionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, approve_submission_dto_1.ApproveSubmissionDto]),
    __metadata("design:returntype", Promise)
], ValidatorSubmissionsController.prototype, "approveSubmission", null);
__decorate([
    (0, common_1.Post)(':submissionId/reject'),
    (0, roles_decorator_1.Roles)('VALIDATOR'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('submissionId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reject_submission_dto_1.RejectSubmissionDto]),
    __metadata("design:returntype", Promise)
], ValidatorSubmissionsController.prototype, "rejectSubmission", null);
exports.ValidatorSubmissionsController = ValidatorSubmissionsController = __decorate([
    (0, common_1.Controller)('validator/submissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [submissions_service_1.SubmissionsService])
], ValidatorSubmissionsController);
//# sourceMappingURL=validator-submissions.controller.js.map