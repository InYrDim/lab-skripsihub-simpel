import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';

interface SharedSubmissionsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

@Controller('submissions')
export class SharedSubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get('all')
  async getAllSubmissions(@Query() query: SharedSubmissionsQuery) {
    const result = await this.submissionsService.getAllSubmissions({
      ...query,
      status: 'APPROVED',
    });
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Approved submissions retrieved successfully',
    };
  }
}
