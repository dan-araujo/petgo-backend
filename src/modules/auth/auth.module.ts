import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Customer } from '../customer/entities/customer.entity';
import { Delivery } from '../delivery/entities/delivery.entity';
import { Store } from '../store/entities/store.entity';
import { Veterinary } from '../veterinary/entities/veterinary.entity';
import { mailerConfig } from '../../config/mailer.config';
import { CommonModule } from '../../common/common.module';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';
import { EmailVerificationModule } from './email-verification/email-verification.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    EmailVerificationModule,
    ForgotPasswordModule,
    CommonModule,
    SecurityModule,
    TypeOrmModule.forFeature([
      Customer,
      Delivery,
      Store,
      Veterinary,
    ]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mailerConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule { }
