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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationService = class NotificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(userId, type, message, relatedSubmissionId) {
        return this.prisma.notification.create({
            data: {
                userId,
                type,
                message,
                relatedSubmissionId: relatedSubmissionId || null,
                isRead: false,
            },
        });
    }
    async getNotificationsForUser(userId, query) {
        const page = Number(query?.page) || 1;
        const limit = Number(query?.limit) || 20;
        const skip = (page - 1) * limit;
        const whereClause = { userId };
        if (query?.read !== undefined && query?.read !== '') {
            whereClause.isRead = query.read === 'true' || query.read === true;
        }
        const [total, notifications] = await Promise.all([
            this.prisma.notification.count({ where: whereClause }),
            this.prisma.notification.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        const data = notifications.map((n) => ({
            notificationId: n.id,
            type: n.type,
            message: n.message,
            relatedSubmissionId: n.relatedSubmissionId,
            read: n.isRead,
            createdAt: n.createdAt,
        }));
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new common_1.NotFoundException(`Notification with ID ${notificationId} not found`);
        }
        if (userId && notification.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied: You cannot modify this notification');
        }
        const updated = await this.prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
            },
        });
        return {
            notificationId: updated.id,
            read: updated.isRead,
            readAt: updated.createdAt,
        };
    }
    async markAllAsRead(userId) {
        const result = await this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
        return {
            markedCount: result.count,
        };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map