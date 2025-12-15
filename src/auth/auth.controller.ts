import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { UserType } from '../common/helpers/user-repo.helper';
import { LoginDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login/:type')
    login(@Param('type') type: UserType, @Body() dto: LoginDTO) {
        return this.authService.loginUser(type, dto);
    }
}
