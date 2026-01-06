import { Body, Controller, Logger, Post } from "@nestjs/common";
import { PasswordResetService } from "./password-reset.service";
import { ResetPasswordDTO } from "./dto/reset-password.dto";
import { RequestPasswordResetDTO } from "./dto/request-password-reset.dto";
import { PasswordResetCodeDTO } from "./dto/password-reset-code.dto";

@Controller('auth')
export class PasswordResetController {
    constructor(private readonly passwordResetService: PasswordResetService) { }

    private readonly logger = new Logger(PasswordResetService.name);

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDTO) {
        return this.passwordResetService.resetPassword(
            dto.resetToken,
            dto.newPassword,
            dto.confirmPassword,
            dto.userType,
        );
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: RequestPasswordResetDTO): Promise<{ status: string; message: string; }> {
        try {
            await this.passwordResetService.requestPasswordReset(dto.email, dto.userType);
        } catch (error) {
            this.logger.error('Erro ao solicitar recuperação de senha', error instanceof Error ? error.stack : undefined);
        }

        return {
            status: 'pending_code',
            message:
                'Se o e-mail existir, você receberá um código de recuperação de senha'
        };
    }

    @Post('verify-reset-code')
    async verifyResetCode(@Body() dto: PasswordResetCodeDTO): Promise<{ status: string; reset_token: string; message: string }> {
        const result = await this.passwordResetService.verifyResetCode(dto.email, dto.userType, dto.code);

        return {
            status: 'success',
            reset_token: result.reset_token,
            message: 'Código validado com sucesso. Use o reset token para redefinir sua senha'
        };
    }
}