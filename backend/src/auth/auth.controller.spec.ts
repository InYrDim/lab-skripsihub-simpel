import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AuthController, REFRESH_COOKIE_NAME } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };
  const response = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('sets the refresh token as an HttpOnly cookie on login', async () => {
    const loginDto = {
      email: 'student@university.edu',
      password: 'password123',
    };
    const expectedResponse = {
      success: true,
      data: { accessToken: 'token', user: {} },
      message: 'Login successful',
    };
    mockAuthService.login.mockResolvedValue({
      refreshToken: 'refresh-token',
      response: expectedResponse,
    });

    const result = await controller.login(loginDto, response);

    expect(result).toEqual(expectedResponse);
    expect(response.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      'refresh-token',
      expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
    );
  });

  it('prefers the refresh cookie over the legacy request body', async () => {
    const request = {
      cookies: { [REFRESH_COOKIE_NAME]: 'cookie-token' },
    } as unknown as Request;
    const expectedResult = {
      success: true,
      data: { accessToken: 'newToken' },
      message: 'Token refreshed successfully',
    };
    mockAuthService.refresh.mockResolvedValue(expectedResult);

    const result = await controller.refresh(
      { refreshToken: 'body-token' },
      request,
    );

    expect(result).toEqual(expectedResult);
    expect(mockAuthService.refresh).toHaveBeenCalledWith('cookie-token');
  });

  it('keeps body refresh tokens as a compatibility fallback', async () => {
    const request = { cookies: {} } as unknown as Request;
    mockAuthService.refresh.mockResolvedValue({ success: true });

    await controller.refresh({ refreshToken: 'body-token' }, request);

    expect(mockAuthService.refresh).toHaveBeenCalledWith('body-token');
  });

  it('clears the refresh cookie on logout', () => {
    const expectedResult = { success: true, message: 'Logout successful' };
    mockAuthService.logout.mockReturnValue(expectedResult);

    const result = controller.logout(response);

    expect(result).toEqual(expectedResult);
    expect(response.clearCookie).toHaveBeenCalledWith(
      REFRESH_COOKIE_NAME,
      expect.objectContaining({ httpOnly: true, path: '/api/auth' }),
    );
  });
});
