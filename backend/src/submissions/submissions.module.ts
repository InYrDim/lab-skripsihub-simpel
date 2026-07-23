import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { StudentSubmissionsController } from './student-submissions.controller';
import { AdminSubmissionsController } from './admin-submissions.controller';
import { ValidatorSubmissionsController } from './validator-submissions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../pdf/pdf.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, PdfModule, NotificationModule],
  controllers: [
    StudentSubmissionsController,
    AdminSubmissionsController,
    ValidatorSubmissionsController,
  ],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
