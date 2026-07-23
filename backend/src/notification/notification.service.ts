import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a notification record for a user
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    relatedSubmissionId?: string,
  ) {
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

  /**
   * Retrieve in-app notifications for a user with pagination and optional read filter
   */
  async getNotificationsForUser(
    userId: string,
    query?: { page?: number; limit?: number; read?: boolean | string },
  ) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = { userId };
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

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId?: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`,
      );
    }

    if (userId && notification.userId !== userId) {
      throw new ForbiddenException(
        'Access denied: You cannot modify this notification',
      );
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

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(userId: string) {
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
}
