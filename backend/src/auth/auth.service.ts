import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

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

    if (user.status !== 'AKTIF') {
      const message = user.status === 'MENUNGGU_APPROVE' 
        ? 'Akun Anda sedang menunggu persetujuan Admin' 
        : user.status === 'DITOLAK'
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

    const payload = { sub: user.id, email: user.email, role: user.role };
    const secret = process.env.JWT_SECRET || 'skripsihub_jwt_secret_key_2026';

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '1d',
    });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, tokenType: 'refresh' },
      { secret, expiresIn: '7d' },
    );

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
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
    };
  }

  async register(registerDto: any) {
    const user = await this.userService.create({
      ...registerDto,
      status: 'MENUNGGU_APPROVE',
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

  async refresh(refreshDto: RefreshDto) {
    try {
      const secret = process.env.JWT_SECRET || 'skripsihub_jwt_secret_key_2026';
      const payload = this.jwtService.verify(refreshDto.refreshToken, {
        secret,
      });

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.userService.findById(payload.sub);
      if (!user || user.status !== 'AKTIF') {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        { secret, expiresIn: '1d' },
      );

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
        },
        message: 'Token refreshed successfully',
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout() {
    return {
      success: true,
      message: 'Logout successful',
    };
  }
}
