import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationController } from './email-verification.controller';
import { CommonModule } from '../../../common/common.module';
import { EmailVerificationServiceV2 } from './email-verification.v2.service';
import { EmailVerificationRequest } from './entities/email-verification-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerificationRequest]),
    CommonModule,
  ],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationServiceV2],
  exports: [EmailVerificationServiceV2],
})
export class EmailVerificationModule { }