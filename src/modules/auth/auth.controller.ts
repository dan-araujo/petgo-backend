import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthResponse, AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { UserType } from '../../common/enums/user-type.enum';
import { EmailVerificationService } from '../../common/services/email-verification.service';
import { ResendVerificationCodeDTO } from './dto/send-verification-code.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
  ) { }

  @Post('login/:type')
  async login(@Param('type') type: UserType, @Body() dto: LoginDTO): Promise<AuthResponse> {
    return this.authService.login(type, dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; code: string }): Promise<AuthResponse> {
    const isValid = await this.emailVerificationService.verifyEmail(body.email, body.code);

    if (!isValid) {
      return {
        status: 'error',
        message: 'Código de verificação inválido ou expirado',
      };
    }

    return {
      status: 'success',
      message: 'Email verificado com sucesso!',
    };
  }

  @Post('resend-verification-code')
  async resendVerificationCode(@Body() dto: ResendVerificationCodeDTO): Promise<AuthResponse> {
    try {
      await this.emailVerificationService.resendVerificationCode(dto.email);

      return {
        status: 'new_sent_code',
        message: 'Novo código de verificação enviado para seu e-mail',
        email: dto.email,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Erro ao reenviar código de verificação',
      };
    }
  }
}
