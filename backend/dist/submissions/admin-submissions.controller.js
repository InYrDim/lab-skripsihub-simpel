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
exports.AdminSubmissionsController = void 0;
const common_1 = require("@nestjs/common");
const submissions_service_1 = require("./submissions.service");
const assign_submission_dto_1 = require("./dto/assign-submission.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let AdminSubmissionsController = class AdminSubmissionsController {
    submissionsService;
    constructor(submissionsService) {
        this.submissionsService = submissionsService;
    }
    async getAllSubmissions(query) {
        const result = await this.submissionsService.getAdminSubmissions(query);
        return {
            success: true,
            data: result.data,
            pagination: result.pagination,
            message: 'Submissions retrieved successfully',
        };
    }
    async getSubmissionDetail(submissionId) {
        const result = await this.submissionsService.getAdminSubmissionById(submissionId);
        return {
            success: true,
            data: result,
            message: 'Submission details retrieved successfully',
        };
    }
    async assignValidator(submissionId, assignDto) {
        const result = await this.submissionsService.assignValidator(submissionId, assignDto.validatorId);
        return {
            success: true,
            data: result,
            message: 'Submission assigned to validator successfully',
        };
    }
    async getValidators(query) {
        const result = await this.submissionsService.getAdminValidators(query);
        return {
            success: true,
            data: result.data,
            pagination: result.pagination,
            message: 'Validators retrieved successfully',
        };
    }
};
exports.AdminSubmissionsController = AdminSubmissionsController;
__decorate([
    (0, common_1.Get)('submissions'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSubmissionsController.prototype, "getAllSubmissions", null);
__decorate([
    (0, common_1.Get)('submissions/:submissionId'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('submissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSubmissionsController.prototype, "getSubmissionDetail", null);
__decorate([
    (0, common_1.Post)('submissions/:submissionId/assign'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_submission_dto_1.AssignSubmissionDto]),
    __metadata("design:returntype", Promise)
], AdminSubmissionsController.prototype, "assignValidator", null);
__decorate([
    (0, common_1.Get)('validators'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminSubmissionsController.prototype, "getValidators", null);
exports.AdminSubmissionsController = AdminSubmissionsController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [submissions_service_1.SubmissionsService])
], AdminSubmissionsController);
//# sourceMappingURL=admin-submissions.controller.js.map