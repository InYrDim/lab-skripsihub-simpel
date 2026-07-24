import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { PdfModule } from './pdf/pdf.module';
import { NotificationModule } from './notification/notification.module';
import { AdminSettingsModule } from './admin-settings/admin-settings.module';
import { TopicsModule } from './topics/topics.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    SubmissionsModule,
    PdfModule,
    NotificationModule,
    AdminSettingsModule,
    TopicsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
