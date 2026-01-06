import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetRequest } from './entities/password-reset-request.entity';
import { CommonModule } from '../../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetRequest]),
    CommonModule,
  ],
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
