import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { VerificationService } from '../../common/services/verification.service';
import { EmailVerificationService } from '../../common/services/email-verification.service';
import { UserRepoHelper } from '../../common/helpers/user-repo.helper';
import { Customer } from '../customer/entities/customer.entity';
import { Delivery } from '../delivery/entities/delivery.entity';
import { Store } from '../store/entities/store.entity';
import { Veterinary } from '../veterinary/entities/veterinary.entity';
import { mailerConfig } from '../../config/mailer.config';
import { MailgunEmailService } from '../../common/services/mailgun-email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Delivery, Store, Veterinary]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mailerConfig,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    VerificationService,
    EmailVerificationService,
    UserRepoHelper,
    MailgunEmailService, 
  ],
  exports: [AuthService, VerificationService, EmailVerificationService, MailgunEmailService],
})
export class AuthModule {}
