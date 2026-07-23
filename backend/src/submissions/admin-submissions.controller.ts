import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { AssignSubmissionDto } from './dto/assign-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

interface AdminSubmissionsQuery {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface ValidatorQuery {
  page?: number;
  limit?: number;
  status?: string;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminSubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get('submissions')
  @Roles('ADMIN')
  async getAllSubmissions(@Query() query: AdminSubmissionsQuery) {
    const result = await this.submissionsService.getAdminSubmissions(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Submissions retrieved successfully',
    };
  }

  @Get('submissions/:submissionId')
  @Roles('ADMIN')
  async getSubmissionDetail(@Param('submissionId') submissionId: string) {
    const result =
      await this.submissionsService.getAdminSubmissionById(submissionId);
    return {
      success: true,
      data: result,
      message: 'Submission details retrieved successfully',
    };
  }

  @Post('submissions/:submissionId/assign')
  @Roles('ADMIN')
  async assignValidator(
    @Param('submissionId') submissionId: string,
    @Body() assignDto: AssignSubmissionDto,
  ) {
    const result = await this.submissionsService.assignValidator(
      submissionId,
      assignDto.validatorId,
    );
    return {
      success: true,
      data: result,
      message: 'Submission assigned to validator successfully',
    };
  }

  @Get('validators')
  @Roles('ADMIN')
  async getValidators(@Query() query: ValidatorQuery) {
    const result = await this.submissionsService.getAdminValidators(query);
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Validators retrieved successfully',
    };
  }
}
