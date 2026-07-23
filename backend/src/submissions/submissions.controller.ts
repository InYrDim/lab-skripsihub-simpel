import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@Controller('submissions-scaffold')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get('ping')
  ping() {
    return { status: 'ok' };
  }
}
