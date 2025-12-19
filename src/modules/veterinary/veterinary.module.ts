import { Module } from '@nestjs/common';
import { VeterinaryService } from './veterinary.service';
import { VeterinaryController } from './veterinary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Veterinary } from './entities/veterinary.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../../modules/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Veterinary]), 
  AuthModule,
  UserModule,
],
  providers: [VeterinaryService],
  controllers: [VeterinaryController],
  exports: [VeterinaryService]
})
export class VeterinaryModule {}
