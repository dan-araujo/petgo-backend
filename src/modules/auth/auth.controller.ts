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
  async login(@Param('type') type: UserType, @Body() dto: LoginDTO): Promise<any> {
    return this.authService.login(type, dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; code: string }): Promise<any> {
    return this.emailVerificationService.verifyEmail(body.email, body.code);
  }

  @Post('resend-verification-code')
  async resendVerificationCode(@Body() dto: ResendVerificationCodeDTO): Promise<AuthResponse> {
    return await this.emailVerificationService.resendVerificationCode(dto.email);
  }

}
