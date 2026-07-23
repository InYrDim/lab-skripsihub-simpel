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
import { ApproveSubmissionDto } from './dto/approve-submission.dto';
import { RejectSubmissionDto } from './dto/reject-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface RequestUser {
  id: string;
}

interface ValidatorSubmissionQuery {
  page?: number;
  limit?: number;
  status?: string;
}

@Controller('validator/submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ValidatorSubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  @Roles('VALIDATOR')
  async getAssignedSubmissions(
    @CurrentUser() user: RequestUser,
    @Query() query: ValidatorSubmissionQuery,
  ) {
    const result = await this.submissionsService.getValidatorSubmissions(
      user.id,
      query,
    );
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      message: 'Assigned submissions retrieved successfully',
    };
  }

  @Get(':submissionId')
  @Roles('VALIDATOR')
  async getSubmissionDetail(
    @CurrentUser() user: RequestUser,
    @Param('submissionId') submissionId: string,
  ) {
    const result = await this.submissionsService.getValidatorSubmissionById(
      user.id,
      submissionId,
    );
    return {
      success: true,
      data: result,
      message: 'Submission details retrieved successfully',
    };
  }

  @Post(':submissionId/approve')
  @Roles('VALIDATOR')
  async approveSubmission(
    @CurrentUser() user: RequestUser,
    @Param('submissionId') submissionId: string,
    @Body() approveDto: ApproveSubmissionDto,
  ) {
    const result = await this.submissionsService.approveSubmission(
      user.id,
      submissionId,
      approveDto.approvedTitleId,
    );
    return {
      success: true,
      data: result,
      message:
        'Submission approved successfully. Approval letter generated and sent to student.',
    };
  }

  @Post(':submissionId/reject')
  @Roles('VALIDATOR')
  async rejectSubmission(
    @CurrentUser() user: RequestUser,
    @Param('submissionId') submissionId: string,
    @Body() rejectDto: RejectSubmissionDto,
  ) {
    const result = await this.submissionsService.rejectSubmission(
      user.id,
      submissionId,
      rejectDto.rejectionReason,
    );
    return {
      success: true,
      data: result,
      message:
        'Submission rejected successfully. Student has been notified and may submit a new proposal.',
    };
  }
}
