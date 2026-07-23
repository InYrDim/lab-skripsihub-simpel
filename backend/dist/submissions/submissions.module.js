"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionsModule = void 0;
const common_1 = require("@nestjs/common");
const submissions_service_1 = require("./submissions.service");
const student_submissions_controller_1 = require("./student-submissions.controller");
const admin_submissions_controller_1 = require("./admin-submissions.controller");
const validator_submissions_controller_1 = require("./validator-submissions.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const pdf_module_1 = require("../pdf/pdf.module");
const notification_module_1 = require("../notification/notification.module");
let SubmissionsModule = class SubmissionsModule {
};
exports.SubmissionsModule = SubmissionsModule;
exports.SubmissionsModule = SubmissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, pdf_module_1.PdfModule, notification_module_1.NotificationModule],
        controllers: [
            student_submissions_controller_1.StudentSubmissionsController,
            admin_submissions_controller_1.AdminSubmissionsController,
            validator_submissions_controller_1.ValidatorSubmissionsController,
        ],
        providers: [submissions_service_1.SubmissionsService],
        exports: [submissions_service_1.SubmissionsService],
    })
], SubmissionsModule);
//# sourceMappingURL=submissions.module.js.map