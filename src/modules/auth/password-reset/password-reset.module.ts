import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetRequest } from './entities/password-reset-request.entity';
import { EmailService } from '../../../common/services/email.service';
import { MailgunEmailService } from '../../../common/services/mailgun-email.service';
import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetRequest]),
    CommonModule,
  ],
  controllers: [PasswordResetController],
  providers: [PasswordResetService, EmailService, MailgunEmailService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
