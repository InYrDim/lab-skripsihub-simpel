import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminSettingsService } from './admin-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminSettingsController {
  constructor(private readonly settingsService: AdminSettingsService) {}

  @Get()
  async getAllSettings() {
    const settings = await this.settingsService.getAllSettings();
    return {
      success: true,
      data: settings,
    };
  }

  @Get('default-department')
  async getDefaultDepartment() {
    const department = await this.settingsService.getDefaultDepartment();
    return {
      success: true,
      data: { defaultDepartment: department },
    };
  }

  @Patch('default-department')
  async setDefaultDepartment(@Body() body: { department: string }) {
    await this.settingsService.setDefaultDepartment(body.department);
    return {
      success: true,
      data: { defaultDepartment: body.department },
      message: 'Default department updated successfully',
    };
  }
}
