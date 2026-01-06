import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthResponse, AuthService } from './auth.service';
import { LoginDTO } from './login/dto/login.dto';
import { UserType } from '../../common/enums/user-type.enum';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('login/:type')
  async login(@Param('type') type: UserType, @Body() dto: LoginDTO): Promise<AuthResponse> {
    return this.authService.login(type, dto);
  }
}
