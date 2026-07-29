import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { getJwtSecret, JwtPayload } from './config/jwt.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.AKTIF) {
      const message =
        user.status === UserStatus.MENUNGGU_APPROVE
          ? 'Akun Anda sedang menunggu persetujuan Admin'
          : user.status === UserStatus.DITOLAK
            ? 'Pengajuan akun Anda telah ditolak oleh Admin'
            : 'Akun Anda telah dinonaktifkan';
      throw new UnauthorizedException(message);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const secret = getJwtSecret();
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tokenType: 'access',
      } satisfies JwtPayload,
      { secret, expiresIn: '1d' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id, tokenType: 'refresh' } satisfies JwtPayload,
      { secret, expiresIn: '7d' },
    );

    return {
      refreshToken,
      response: {
        success: true,
        data: {
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            universityId: user.universityId,
            department: user.department,
            prodi: user.prodi,
            dosenPA: user.dosenPA,
            dosenPANip: user.dosenPANip,
            status: user.status,
            photoUrl: user.photoUrl,
            createdAt: user.createdAt,
          },
        },
        message: 'Login successful',
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create({
      ...registerDto,
      role: UserRole.STUDENT,
      status: UserStatus.MENUNGGU_APPROVE,
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      message: 'Registrasi berhasil. Silakan tunggu persetujuan Admin.',
    };
  }

  async refresh(refreshToken: string) {
    try {
      const secret = getJwtSecret();
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret,
      });

      if (!payload?.sub || payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.userService.findById(payload.sub);
      if (!user || user.status !== UserStatus.AKTIF) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          tokenType: 'access',
        } satisfies JwtPayload,
        { secret, expiresIn: '1d' },
      );

      return {
        success: true,
        data: { accessToken },
        message: 'Token refreshed successfully',
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  logout() {
    return {
      success: true,
      message: 'Logout successful',
    };
  }
}
