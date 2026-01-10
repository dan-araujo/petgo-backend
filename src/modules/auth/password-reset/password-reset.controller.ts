import { Body, Controller, Logger, Post } from "@nestjs/common";
import { PasswordResetService } from "./password-reset.service";
import { ResetPasswordDTO } from "./dto/reset-password.dto";
import { RequestPasswordResetDTO } from "./dto/request-password-reset.dto";
import { PasswordResetCodeDTO } from "./dto/password-reset-code.dto";
import { ApiResponse } from "../../../common/interfaces/api-response.interface";

interface ResetTokenData {
  reset_token: string;
}

interface PasswordResetData {
  message: string;
  email: string;
}

@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  private readonly logger = new Logger(PasswordResetController.name);

  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDTO,
  ): Promise<ApiResponse<PasswordResetData>> {
    try {
      const result = await this.passwordResetService.resetPassword(
        dto.resetToken,
        dto.newPassword,
        dto.confirmPassword,
        dto.userType,
      );

      return {
        status: 'success',
        message: result.message,
        data: {
          message: result.message,
          email: result.email,
        },
      };
    } catch (error) {
      this.logger.error(
        'Erro ao redefinir senha',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: RequestPasswordResetDTO,
  ): Promise<ApiResponse<{ email: string }>> {
    try {
      await this.passwordResetService.requestPasswordReset(dto.email, dto.userType);

      return {
        status: 'success',
        message: 'Se o e-mail existir, você receberá um código de recuperação de senha',
        data: {
          email: dto.email,
        },
      };
    } catch (error) {
      this.logger.error(
        'Erro ao solicitar recuperação de senha',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @Post('verify-reset-code')
  async verifyResetCode(
    @Body() dto: PasswordResetCodeDTO,
  ): Promise<ApiResponse<ResetTokenData>> {
    try {
      const result = await this.passwordResetService.verifyResetCode(
        dto.email,
        dto.userType,
        dto.code,
      );

      return {
        status: 'success',
        message: 'Código validado com sucesso',
        data: {
          reset_token: result.reset_token,
        },
      };
    } catch (error) {
      this.logger.error(
        'Erro ao validar código de reset',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}