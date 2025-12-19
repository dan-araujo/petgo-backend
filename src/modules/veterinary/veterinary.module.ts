import { Module } from '@nestjs/common';
import { VeterinaryService } from './veterinary.service';
import { VeterinaryController } from './veterinary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Veterinary } from './entities/veterinary.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Veterinary]), 
  AuthModule,
],
  providers: [VeterinaryService],
  controllers: [VeterinaryController],
  exports: [VeterinaryService]
})
export class VeterinaryModule {}
