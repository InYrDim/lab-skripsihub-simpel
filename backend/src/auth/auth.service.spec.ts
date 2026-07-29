import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 'usr-1',
    email: 'student@university.edu',
    passwordHash: '$2b$10$hashedpassword',
    fullName: 'Student User',
    role: UserRole.STUDENT,
    universityId: 'STD001',
    department: 'Teknik Informatika dan Komputer',
    prodi: 'PTIK',
    dosenPA: null,
    dosenPANip: null,
    status: UserStatus.AKTIF,
    photoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-only-secret';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns an access token and an internal refresh token', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('mockAccessToken')
        .mockReturnValueOnce('mockRefreshToken');

      const result = await service.login({
        email: 'student@university.edu',
        password: 'password123',
      });

      expect(result.refreshToken).toBe('mockRefreshToken');
      expect(result.response.data.accessToken).toBe('mockAccessToken');
      expect(result.response.data).not.toHaveProperty('refreshToken');
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ tokenType: 'access' }),
        expect.any(Object),
      );
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ tokenType: 'refresh' }),
        expect.any(Object),
      );
    });

    it('rejects an unknown user', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@university.edu', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an invalid password', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'student@university.edu',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an inactive user', async () => {
      mockUserService.findByEmail.mockResolvedValue({
        ...mockUser,
        status: UserStatus.NONAKTIF,
      });

      await expect(
        service.login({
          email: 'student@university.edu',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('forces the student role and pending status', async () => {
      mockUserService.create.mockResolvedValue({
        ...mockUser,
        status: UserStatus.MENUNGGU_APPROVE,
      });

      await service.register({
        email: mockUser.email,
        password: 'password123',
        fullName: mockUser.fullName,
        universityId: mockUser.universityId,
      });

      expect(mockUserService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.STUDENT,
          status: UserStatus.MENUNGGU_APPROVE,
        }),
      );
    });
  });

  describe('refresh', () => {
    it('returns a new access token for a refresh token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'usr-1',
        tokenType: 'refresh',
      });
      mockUserService.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('newAccessToken');

      const result = await service.refresh('validRefreshToken');

      expect(result.data.accessToken).toBe('newAccessToken');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ tokenType: 'access' }),
        expect.any(Object),
      );
    });

    it('rejects an access token used as a refresh token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: 'usr-1',
        tokenType: 'access',
      });

      await expect(service.refresh('accessToken')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserService.findById).not.toHaveBeenCalled();
    });

    it('rejects an invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refresh('invalidToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
