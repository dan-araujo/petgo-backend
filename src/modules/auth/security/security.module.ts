import { Module } from '@nestjs/common';
import { CommonModule } from '../../../common/common.module';
import { EmailVerificationModule } from '../../auth/email-verification/email-verification.module';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';

@Module({
    imports: [
        CommonModule,
        EmailVerificationModule,
    ],
    controllers: [SecurityController],
    providers: [SecurityService],
    exports: [SecurityService],
})
export class SecurityModule { }
