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
exports.StudentSubmissionsController = void 0;
const common_1 = require("@nestjs/common");
const submissions_service_1 = require("./submissions.service");
const create_submission_dto_1 = require("./dto/create-submission.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let StudentSubmissionsController = class StudentSubmissionsController {
    submissionsService;
    constructor(submissionsService) {
        this.submissionsService = submissionsService;
    }
    async create(user, createSubmissionDto) {
        const result = await this.submissionsService.createSubmission(user.id, createSubmissionDto);
        return {
            success: true,
            data: result,
            message: 'Submission created successfully',
        };
    }
    async getMySubmissions(user, query) {
        const result = await this.submissionsService.getStudentSubmissions(user.id, query);
        return {
            success: true,
            data: result.data,
            pagination: result.pagination,
            message: 'Submissions retrieved successfully',
        };
    }
    async getCurrentSubmission(user, res) {
        const current = await this.submissionsService.getStudentCurrentSubmission(user.id);
        if (!current) {
            res.status(common_1.HttpStatus.NO_CONTENT);
            return;
        }
        return {
            success: true,
            data: current,
            message: 'Current submission retrieved successfully',
        };
    }
    async getSubmissionDetail(user, submissionId) {
        const result = await this.submissionsService.getStudentSubmissionById(user.id, submissionId);
        return {
            success: true,
            data: result,
            message: 'Submission details retrieved successfully',
        };
    }
};
exports.StudentSubmissionsController = StudentSubmissionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_submission_dto_1.CreateSubmissionDto]),
    __metadata("design:returntype", Promise)
], StudentSubmissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudentSubmissionsController.prototype, "getMySubmissions", null);
__decorate([
    (0, common_1.Get)('me/current'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudentSubmissionsController.prototype, "getCurrentSubmission", null);
__decorate([
    (0, common_1.Get)('me/:submissionId'),
    (0, roles_decorator_1.Roles)('STUDENT'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('submissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentSubmissionsController.prototype, "getSubmissionDetail", null);
exports.StudentSubmissionsController = StudentSubmissionsController = __decorate([
    (0, common_1.Controller)('submissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [submissions_service_1.SubmissionsService])
], StudentSubmissionsController);
//# sourceMappingURL=student-submissions.controller.js.map