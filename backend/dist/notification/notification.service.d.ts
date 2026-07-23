import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createNotification(userId: string, type: NotificationType, message: string, relatedSubmissionId?: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        isRead: boolean;
        userId: string;
        relatedSubmissionId: string | null;
    }>;
    getNotificationsForUser(userId: string, query?: {
        page?: number;
        limit?: number;
        read?: boolean | string;
    }): Promise<{
        data: {
            notificationId: string;
            type: import(".prisma/client").$Enums.NotificationType;
            message: string;
            relatedSubmissionId: string | null;
            read: boolean;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markAsRead(notificationId: string, userId?: string): Promise<{
        notificationId: string;
        read: boolean;
        readAt: Date;
    }>;
    markAllAsRead(userId: string): Promise<{
        markedCount: number;
    }>;
}
