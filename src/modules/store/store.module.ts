import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { Store } from './entities/store.entity';
import { EmailVerificationModule } from '../auth/email-verification/email-verification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Store]), EmailVerificationModule],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule { }

