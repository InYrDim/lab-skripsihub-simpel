import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
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
  @UseInterceptors(
    FileInterceptor('document', {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          const directory = join(process.cwd(), 'uploads', 'proposals');
          mkdirSync(directory, { recursive: true });
          callback(null, directory);
        },
        filename: (_request, file, callback) => {
          callback(
            null,
            `${randomUUID()}${extname(file.originalname).toLowerCase()}`,
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          callback(
            new BadRequestException('Berkas harus berformat PDF'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @CurrentUser() user: RequestUser,
    @Body() body: { titles: string },
    @UploadedFile() document?: Express.Multer.File,
  ) {
    if (!document) {
      throw new BadRequestException('Berkas pengajuan PDF wajib diunggah');
    }

    let titles: CreateSubmissionDto['titles'];
    try {
      titles = JSON.parse(body.titles) as CreateSubmissionDto['titles'];
    } catch {
      throw new BadRequestException('Data judul pengajuan tidak valid');
    }

    const result = await this.submissionsService.createSubmission(user.id, {
      titles,
      documentUrl: `/uploads/proposals/${document.filename}`,
      documentName: document.originalname,
    });
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
