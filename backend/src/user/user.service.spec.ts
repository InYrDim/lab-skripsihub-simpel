import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'usr-1',
    email: 'student@university.edu',
    passwordHash: '$2b$10$hashed',
    fullName: 'Student User',
    role: UserRole.STUDENT,
    universityId: 'STD001',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return user if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const user = await service.findByEmail('student@university.edu');
      expect(user).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'student@university.edu' },
      });
    });
  });

  describe('findById', () => {
    it('should return user if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const user = await service.findById('usr-1');
      expect(user).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
      });
    });
  });

  describe('update', () => {
    it('only sends writable user fields to Prisma', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.update('usr-1', {
        email: 'updated@university.edu',
        fullName: 'Updated Student',
        role: UserRole.STUDENT,
        universityId: 'STD002',
        department: 'Teknik Informatika dan Komputer',
        name: 'UI-only name',
        id: 'usr-1',
        createdAt: '2026-07-24T10:01:54.709Z',
      } as any);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: {
          email: 'updated@university.edu',
          fullName: 'Updated Student',
          role: UserRole.STUDENT,
          universityId: 'STD002',
          department: 'Teknik Informatika dan Komputer',
        },
      });
    });
  });
});
