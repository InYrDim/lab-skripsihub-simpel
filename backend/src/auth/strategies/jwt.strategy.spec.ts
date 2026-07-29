import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../user/user.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const userService = { findById: jest.fn() };
  let strategy: JwtStrategy;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-only-secret';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy, { provide: UserService, useValue: userService }],
    }).compile();
    strategy = module.get(JwtStrategy);
    jest.clearAllMocks();
  });

  it('rejects refresh tokens used for bearer authentication', async () => {
    await expect(
      strategy.validate({ sub: 'usr-1', tokenType: 'refresh' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userService.findById).not.toHaveBeenCalled();
  });

  it('accepts active users with an access token', async () => {
    const user = { id: 'usr-1', status: 'AKTIF' };
    userService.findById.mockResolvedValue(user);

    await expect(
      strategy.validate({ sub: 'usr-1', tokenType: 'access' }),
    ).resolves.toEqual(user);
  });
});
