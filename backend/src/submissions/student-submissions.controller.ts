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
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface RequestUser {
  id: string;
}

interface SubmissionQuery {
  page?: number;
  limit?: number;
  status?: string;
}

@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentSubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @Roles('STUDENT')
  async create(
    @CurrentUser() user: RequestUser,
    @Body() createSubmissionDto: CreateSubmissionDto,
  ) {
    const result = await this.submissionsService.createSubmission(
      user.id,
      createSubmissionDto,
    );
    return {
      success: true,
      data: result,
      message: 'Submission created successfully',
    };
  }

  @Get('me')
  @Roles('STUDENT')
  async getMySubmissions(
    @CurrentUser() user: RequestUser,
    @Query() query: SubmissionQuery,
  ) {
    const result = await this.submissionsService.getStudentSubmissions(
      user.id,
      query,
    );
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Submissions retrieved successfully',
    };
  }

  @Get('me/current')
  @Roles('STUDENT')
  async getCurrentSubmission(@CurrentUser() user: RequestUser) {
    const current = await this.submissionsService.getStudentCurrentSubmission(
      user.id,
    );
    return {
      success: true,
      data: current,
      message: current
        ? 'Current submission retrieved successfully'
        : 'No active submission found',
    };
  }

  @Get('me/:submissionId')
  @Roles('STUDENT')
  async getSubmissionDetail(
    @CurrentUser() user: RequestUser,
    @Param('submissionId') submissionId: string,
  ) {
    const result = await this.submissionsService.getStudentSubmissionById(
      user.id,
      submissionId,
    );
    return {
      success: true,
      data: result,
      message: 'Submission details retrieved successfully',
    };
  }
}
