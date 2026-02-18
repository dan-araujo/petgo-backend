import { Body, Controller, Logger, Post } from "@nestjs/common";
import { ApiResponse, ResponseStatus } from "../../../common/interfaces/api-response.interface";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
import { ForgotPasswordService } from "./forgot-password.service";
import { ForgotPasswordCodeDTO } from "./dto/forgot-password-code.dto";
import { RequestPasswordResetDTO } from "./dto/request-password-reset.dto";

interface ResetTokenData {
  reset_token: string;
}

interface PasswordResetData {
  message: string;
  email: string;
}

@Controller('auth')
export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  private readonly logger = new Logger(ForgotPasswordController.name);

  @Post('reset-password')
  async resetPassword(
    @Body() dto: ForgotPasswordDTO,
  ): Promise<ApiResponse<PasswordResetData>> {
    try {
      const result = await this.forgotPasswordService.resetPassword(
        dto.resetToken,
        dto.newPassword,
        dto.confirmPassword,
        dto.userType,
      );

      return {
        status: ResponseStatus.SUCCESS,
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
      await this.forgotPasswordService.requestPasswordReset(dto.email, dto.userType);

      return {
        status: ResponseStatus.SUCCESS,
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
    @Body() dto: ForgotPasswordCodeDTO,
  ): Promise<ApiResponse<ResetTokenData>> {
    try {
      const result = await this.forgotPasswordService.verifyResetCode(
        dto.email,
        dto.userType,
        dto.code,
      );

      return {
        status: ResponseStatus.SUCCESS,
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