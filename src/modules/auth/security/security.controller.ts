import { Body, Controller, HttpCode, HttpStatus, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SecurityService } from './security.service';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { ConfirmChangePasswordDTO, ValidateChangePasswordCodeDTO } from './dto/change-password.dto';
import { ConfirmEmailChangeDTO, RequestEmailChangeDTO } from './dto/change-email.dto';

@ApiTags('Account Security')
@Controller('auth/security')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SecurityController {
    constructor(private readonly securityService: SecurityService) { }

    @Post('change-password/request')
    @ApiOperation({ summary: 'Etapa 1: Solicita o código de verificação para o e-mail atual' })
    async requestPasswordChange(@Req() req): Promise<ApiResponse> {
        return this.securityService.requestPasswordChange(req.user.id, req.user.userType);
    }

    @Post('change-password/validate-code')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Etapa 2: Valida o código e retorna um Token Temporário' })
    async validateCode(@Req() req, @Body() dto: ValidateChangePasswordCodeDTO) {
        return this.securityService.validateChangePasswordCode(req.user.id, req.user.userType, dto);
    }

    @Patch('change-password/confirm')
    @ApiOperation({ summary: 'Etapa 3: Troca a senha usando o Token Temporário' })
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
