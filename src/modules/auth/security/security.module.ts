import { Module } from '@nestjs/common';
import { CommonModule } from '../../../common/common.module';
import { EmailVerificationModule } from '../../auth/email-verification/email-verification.module';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        CommonModule,
        EmailVerificationModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '10m' },
            }),
        }),
    ],
    controllers: [SecurityController],
    providers: [SecurityService],
    exports: [SecurityService],
})
export class SecurityModule { }
