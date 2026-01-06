import { Body, Controller, Post } from "@nestjs/common";
import { AuthResponse } from "../auth.service";
import { UserType } from "../../../common/enums/user-type.enum";
import { EmailVerificationServiceV2 } from "./email-verification.v2.service";

@Controller('auth')
export class EmailVerificationController {
    constructor(private readonly emailVerificationService: EmailVerificationServiceV2) { }

    @Post('verify-email')
    async verifyEmail(@Body() body: { email: string; code: string; userType: UserType },
    ): Promise<AuthResponse> {
        await this.emailVerificationService.verifyCode(body.email, body.userType, body.code);

        return {
            status: 'success',
            success: true,
            message: 'Email verificado com sucesso!',
            email: body.email,
        };
    }

    @Post('resend-verification-code')
    async resendVerificationCode(
        @Body() dto: { email: string; userType: UserType },
    ): Promise<AuthResponse> {
        await this.emailVerificationService.sendVerificationCode(
            dto.email,
            dto.userType,
        );

        return {
            status: 'new_sent_code',
            success: true,
            message: 'Novo código de verificação enviado para seu e-mail',
            email: dto.email,
        };
    }
}