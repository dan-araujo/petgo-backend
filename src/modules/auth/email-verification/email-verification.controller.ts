import { Body, Controller, Post } from '@nestjs/common';
import { UserType } from '../../../common/enums/user-type.enum';
import { EmailVerificationService } from './email-verification.service';
import { ApiResponse, VerifyCodeResponse, SendCodeResponse } from '../../../common/interfaces/api-response.interface';

@Controller('auth')
export class EmailVerificationController {
    constructor(private readonly emailVerificationService: EmailVerificationService) { }

    @Post('verify-email')
    async verifyEmail(
        @Body() body: { email: string; code: string; userType: UserType },
    ): Promise<ApiResponse<VerifyCodeResponse>> {
        const response = await this.emailVerificationService.verifyCode(
            body.email,
            body.userType,
            body.code,
        );

        return response;
    }

    @Post('resend-verification-code')
    async resendVerificationCode(
        @Body() dto: { email: string; userType: UserType },
    ): Promise<ApiResponse<SendCodeResponse>> {
        const response = await this.emailVerificationService.sendVerificationCode(
            dto.email,
            dto.userType,
        );

        return response;
    }
}
