import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const loginDto = {
        email: 'student@university.edu',
        password: 'password123',
      };
      const expectedResult = {
        success: true,
        data: {
          accessToken: 'token',
          refreshToken: 'refToken',
          user: {} as any,
        },
        message: 'Login successful',
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh', async () => {
      const refreshDto = { refreshToken: 'refToken' };
      const expectedResult = {
        success: true,
        data: { accessToken: 'newToken' },
        message: 'Token refreshed successfully',
      };
      mockAuthService.refresh.mockResolvedValue(expectedResult);

      const result = await controller.refresh(refreshDto);
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(refreshDto);
    });
  });

  describe('logout', () => {
    it('should call authService.logout', async () => {
      const expectedResult = { success: true, message: 'Logout successful' };
      mockAuthService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout();
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });
});
