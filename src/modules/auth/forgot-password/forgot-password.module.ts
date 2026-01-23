import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForgotPasswordController } from './forgot-password.controller';
import { CommonModule } from '../../../common/common.module';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordRequest } from './entities/forgot-password-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ForgotPasswordRequest]),
    CommonModule,
  ],
  controllers: [ForgotPasswordController],
  providers: [ForgotPasswordService],
  exports: [ForgotPasswordService],
})
export class ForgotPasswordModule {}
