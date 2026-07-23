import {
  Controller,
  Get,
  Patch,
  Put,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(['me', ''])
  async getMyNotifications(@CurrentUser() user: any, @Query() query: any) {
    const result = await this.notificationService.getNotificationsForUser(
      user.id,
      query,
    );

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Notifications retrieved successfully',
    };
  }

  @Put('mark-all-read')
  async markAllAsRead(@CurrentUser() user: any) {
    const result = await this.notificationService.markAllAsRead(user.id);
    return {
      success: true,
      data: result,
      message: 'All notifications marked as read',
    };
  }

  @Patch(':id/read')
  async patchMarkAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.notificationService.markAsRead(id, user.id);
    return {
      success: true,
      data: result,
      message: 'Notification marked as read',
    };
  }

  @Put(':id/read')
  async putMarkAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.notificationService.markAsRead(id, user.id);
    return {
      success: true,
      data: result,
      message: 'Notification marked as read',
    };
  }
}
