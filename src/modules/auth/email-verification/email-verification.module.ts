import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationController } from './email-verification.controller';
import { CommonModule } from '../../../common/common.module';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationRequest } from './entities/email-verification-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerificationRequest]),
    CommonModule,
  ],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule { }