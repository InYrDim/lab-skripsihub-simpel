import { Controller, Get } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';

@Controller('submissions-scaffold')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get('ping')
  ping() {
    return { status: 'ok' };
  }
}
