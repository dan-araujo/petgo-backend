import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Store } from '../store/entities/store.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Delivery } from '../delivery/entities/delivery.entity';
import { Veterinary } from '../veterinary/entities/veterinary.entity';
import { PassportModule } from '@nestjs/passport';
import { VerificationService } from '../common/services/verification.service';
import { EmailVerificationService } from '../common/services/email-verification.service';
import { UserRepoHelper } from '../common/helpers/user-repo.helper';
import { User } from '../databases/entities/user.entity';
import { UserModule } from '../modules/user/user.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, VerificationService, EmailVerificationService],
  exports: [AuthService],
})
export class AuthModule { }
