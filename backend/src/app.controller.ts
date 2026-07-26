import { Controller, Get, Param, UseGuards, ForbiddenException, NotFoundException, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('uploads/profiles/:filename')
  @UseGuards(JwtAuthGuard)
  async getProfileImage(
    @Param('filename') filename: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const owner = await this.prisma.user.findFirst({
      where: { photoUrl: { contains: filename } },
    });

    if (!owner) {
      throw new NotFoundException('Photo not found');
    }

    if (owner.id !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    return res.sendFile(filename, { root: './uploads/profiles' });
  }
}
