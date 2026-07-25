import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TopicsService } from './topics.service';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  async findAll() {
    return {
      success: true,
      data: await this.topicsService.findAll(),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() body: { name?: string; description?: string }) {
    return {
      success: true,
      data: await this.topicsService.create(body),
      message: 'Topic created successfully',
    };
  }

  @Post(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async toggle(@Param('id') id: string) {
    return {
      success: true,
      data: await this.topicsService.toggle(id),
      message: 'Topic status updated',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return {
      success: true,
      data: await this.topicsService.update(id, body),
      message: 'Topic updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return {
      success: true,
      data: await this.topicsService.remove(id),
      message: 'Topic deleted successfully',
    };
  }
}
