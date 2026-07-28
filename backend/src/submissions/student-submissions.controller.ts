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
import { memoryStorage } from 'multer';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createClient } from '@supabase/supabase-js';

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
      storage: memoryStorage(),
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

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';
    const bucketName = process.env.SUPABASE_BUCKET_PROPOSALS || 'proposals';

    if (!supabaseUrl || !supabaseKey) {
      throw new BadRequestException('Supabase credentials not configured in environment');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const fileName = `${randomUUID()}${extname(document.originalname).toLowerCase()}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, document.buffer, {
        contentType: document.mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(`Failed to upload document to Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const result = await this.submissionsService.createSubmission(user.id, {
      titles,
      documentUrl: publicUrlData.publicUrl,
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
