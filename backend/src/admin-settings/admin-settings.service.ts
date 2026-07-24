import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getDefaultDepartment(): Promise<string> {
    const value = await this.getSetting('default_department');
    return value || 'Teknik Informatika dan Komputer';
  }

  async setDefaultDepartment(department: string): Promise<void> {
    await this.setSetting('default_department', department);
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const settings = await this.prisma.systemSetting.findMany();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  }
}
