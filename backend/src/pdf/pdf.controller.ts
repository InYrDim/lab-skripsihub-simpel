import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  GoneException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from './pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmissionStatus, UserRole } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly prisma: PrismaService,
  ) {}

  @Get([
    'submissions/me/:submissionId/letter',
    'pdf/letter/:submissionId',
    'documents/letter/:submissionId',
  ])
  @Roles('STUDENT', 'ADMIN', 'VALIDATOR')
  async getApprovalLetterPdf(
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: true,
        approvalLetter: true,
        assignments: {
          include: {
            validator: true,
          },
        },
        titles: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    if (user.role === UserRole.STUDENT && submission.studentId !== user.id) {
      throw new ForbiddenException(
        'Access denied: You do not own this submission',
      );
    }

    if (submission.status !== SubmissionStatus.APPROVED) {
      throw new GoneException('Submission is not in approved status');
    }

    let filePath: string;
    const fileName = `approval_letter_${submissionId}.pdf`;

    if (submission.approvalLetter?.pdfUrl) {
      const relativePath = submission.approvalLetter.pdfUrl.replace(/^\//, '');
      filePath = path.join(process.cwd(), relativePath);
    } else {
      filePath = path.join(process.cwd(), 'uploads', 'letters', fileName);
    }

    if (!fs.existsSync(filePath)) {
      const approvedTitleObj = submission.titles.find(
        (t) => t.id === submission.approvedTitleId,
      );
      const latestAssignment =
        submission.assignments[submission.assignments.length - 1];

      const result = await this.pdfService.generateApprovalLetterPdf({
        studentName: submission.student.fullName,
        universityId: submission.student.universityId,
        approvedTitle: approvedTitleObj?.title || 'Judul Skripsi',
        validatorName: latestAssignment?.validator?.fullName || 'Validator',
        approvalDate: submission.approvalLetter?.generatedAt || new Date(),
        submissionId: submission.id,
      });

      filePath = result.filePath;
    }

    const pdfBuffer = fs.readFileSync(filePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(HttpStatus.OK).send(pdfBuffer);
  }

  @Get('documents/letter/:submissionId/preview')
  @Roles('STUDENT', 'ADMIN', 'VALIDATOR')
  async getLetterPreview(
    @Param('submissionId') submissionId: string,
    @CurrentUser() user: any,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: true,
        approvalLetter: true,
        assignments: {
          include: {
            validator: true,
          },
        },
        titles: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    if (user.role === UserRole.STUDENT && submission.studentId !== user.id) {
      throw new ForbiddenException(
        'Access denied: You do not own this submission',
      );
    }

    if (submission.status !== SubmissionStatus.APPROVED) {
      throw new GoneException('Submission is not in approved status');
    }

    const approvedTitleObj = submission.titles.find(
      (t) => t.id === submission.approvedTitleId,
    );
    const latestAssignment =
      submission.assignments[submission.assignments.length - 1];

    return {
      success: true,
      data: {
        submissionId: submission.id,
        studentName: submission.student.fullName,
        studentId: submission.student.universityId,
        approvedTitle: approvedTitleObj?.title || '',
        approvedAt:
          submission.approvalLetter?.generatedAt || submission.updatedAt,
        approvedBy: latestAssignment?.validator?.fullName || 'Validator',
        letterUrl:
          submission.approvalLetter?.pdfUrl ||
          `/uploads/letters/approval_letter_${submission.id}.pdf`,
        letterGeneratedAt:
          submission.approvalLetter?.generatedAt || submission.updatedAt,
        institutionName: 'SkripsiHub Academic System',
        letterNumber: `SKR/${submission.id}`,
      },
      message: 'Letter preview retrieved successfully',
    };
  }
}
