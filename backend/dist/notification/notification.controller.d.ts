import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getMyNotifications(user: any, query: any): Promise<{
        success: boolean;
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
        message: string;
    }>;
    markAllAsRead(user: any): Promise<{
        success: boolean;
        data: {
            markedCount: number;
        };
        message: string;
    }>;
    patchMarkAsRead(id: string, user: any): Promise<{
        success: boolean;
        data: {
            notificationId: string;
            read: boolean;
            readAt: Date;
        };
        message: string;
    }>;
    putMarkAsRead(id: string, user: any): Promise<{
        success: boolean;
        data: {
            notificationId: string;
            read: boolean;
            readAt: Date;
        };
        message: string;
    }>;
}
