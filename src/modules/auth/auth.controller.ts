import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './login/dto/login.dto';
import { UserType } from '../../common/enums/user-type.enum';
import { ApiResponse, LoginSuccessData, VerificationData } from '../../common/interfaces/api-response.interface';
import { ParseUserTypePipe } from '../../common/pipes/parse-user-type.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/:type')
  async login(
    @Param('type', ParseUserTypePipe) type: UserType, 
    @Body() dto: LoginDTO
  ): Promise<ApiResponse<LoginSuccessData | VerificationData>> {
    return this.authService.login(type, dto);
  }
}
