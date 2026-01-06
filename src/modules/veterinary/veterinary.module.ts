import { Module } from '@nestjs/common';
import { VeterinaryService } from './veterinary.service';
import { VeterinaryController } from './veterinary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Veterinary } from './entities/veterinary.entity';
import { EmailVerificationModule } from '../auth/email-verification/email-verification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Veterinary]), EmailVerificationModule],
  providers: [VeterinaryService],
  controllers: [VeterinaryController],
  exports: [VeterinaryService]
})
export class VeterinaryModule {}
