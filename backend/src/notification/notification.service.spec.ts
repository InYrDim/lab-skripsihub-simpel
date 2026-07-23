import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

describe('NotificationService', () => {
  let service: NotificationService;

  const mockNotification = {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.SUBMISSION_RECEIVED,
    message: 'Your submission has been received.',
    relatedSubmissionId: 'sub-1',
    isRead: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification(
        'user-1',
        NotificationType.SUBMISSION_RECEIVED,
        'Your submission has been received.',
        'sub-1',
      );

      expect(result).toEqual(mockNotification);
      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: NotificationType.SUBMISSION_RECEIVED,
          message: 'Your submission has been received.',
          relatedSubmissionId: 'sub-1',
          isRead: false,
        },
      });
    });
  });

  describe('getNotificationsForUser', () => {
    it('should return paginated notifications for user', async () => {
      mockPrismaService.notification.count.mockResolvedValue(1);
      mockPrismaService.notification.findMany.mockResolvedValue([
        mockNotification,
      ]);

      const result = await service.getNotificationsForUser('user-1');

      expect(result.data.length).toBe(1);
      expect(result.data[0].notificationId).toBe('notif-1');
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by read status if provided', async () => {
      mockPrismaService.notification.count.mockResolvedValue(0);
      mockPrismaService.notification.findMany.mockResolvedValue([]);

      await service.getNotificationsForUser('user-1', { read: 'true' });

      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: true },
      });
    });
  });

  describe('markAsRead', () => {
    it('should throw NotFoundException if notification does not exist', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('notif-999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if notification belongs to another user', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(
        mockNotification,
      );

      await expect(service.markAsRead('notif-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should mark notification as read successfully', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(
        mockNotification,
      );
      mockPrismaService.notification.update.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(result.notificationId).toBe('notif-1');
      expect(result.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications for user', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-1');

      expect(result.markedCount).toBe(3);
      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true },
      });
    });
  });
});
