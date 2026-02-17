import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SecurityService } from './security.service';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { ConfirmChangePasswordDTO } from './dto/change-password.dto';
import { ConfirmEmailChangeDTO, RequestEmailChangeDTO } from './dto/change-email.dto';

@ApiTags('Account Security')
@Controller('auth/security')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SecurityController {
    constructor(private readonly securityService: SecurityService) { }

    @Post('change-password/request')
    async requestPasswordChange(@Req() req): Promise<ApiResponse> {
        return this.securityService.requestPasswordChange(req.user.id, req.user.userType);
    }

    @Patch('change-password/confirm')
    async confirmPasswordChange(@Req() req, @Body() dto: ConfirmChangePasswordDTO): Promise<ApiResponse> {
        return this.securityService.confirmPasswordChange(req.user.id, req.user.userType, dto);
    }

    @Post('change-email/request')
    async requestEmailChange(@Req() req, @Body() dto: RequestEmailChangeDTO): Promise<ApiResponse> {
        return this.securityService.requestEmailChange(req.user.id, req.user.userType, dto);
    }

    @Patch('change-email/confirm')
    async confirmEmailChange(@Req() req, @Body() dto: ConfirmEmailChangeDTO): Promise<ApiResponse> {
        return this.securityService.confirmEmailChange(req.user.id, req.user.userType, dto);
    }
}
