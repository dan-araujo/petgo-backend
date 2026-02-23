import { Body, Controller, HttpCode, HttpStatus, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SecurityService } from './security.service';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { ConfirmChangePasswordDTO, ValidateChangePasswordCodeDTO } from './dto/change-password.dto';
import { ConfirmEmailChangeDTO, RequestEmailChangeDTO } from './dto/change-email.dto';
import { User } from '../../../common/decorators/user.decorator';
import { UserType } from '../../../common/enums';

@ApiTags('Account Security')
@Controller('auth/security')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SecurityController {
    constructor(private readonly securityService: SecurityService) { }

    @Post('change-password/request')
    @ApiOperation({ summary: 'Etapa 1: Solicita o código de verificação para o e-mail atual' })
    async requestPasswordChange(@User('id') userId: string, @User('userType') userType: UserType): Promise<ApiResponse> {
        return this.securityService.requestPasswordChange(userId, userType);
    }

    @Post('change-password/validate-code')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Etapa 2: Valida o código e retorna um Token Temporário' })
    async validateCode(@User('id') userId: string, @User('userType') userType: UserType, @Body() dto: ValidateChangePasswordCodeDTO) {
        return this.securityService.validateChangePasswordCode(userId, userType, dto);
    }

    @Patch('change-password/confirm')
    @ApiOperation({ summary: 'Etapa 3: Troca a senha usando o Token Temporário' })
    async confirmPasswordChange(@User('id') userId: string, @User('userType') userType: UserType, @Body() dto: ConfirmChangePasswordDTO): Promise<ApiResponse> {
        return this.securityService.confirmPasswordChange(userId, userType, dto);
    }

    @Post('change-email/request')
    async requestEmailChange(@User('id') userId: string, @User('userType') userType: UserType, @Body() dto: RequestEmailChangeDTO): Promise<ApiResponse> {
        return this.securityService.requestEmailChange(userId, userType, dto);
    }

    @Patch('change-email/confirm')
    async confirmEmailChange(@User('id') userId: string, @User('userType') userType: UserType, @Body() dto: ConfirmEmailChangeDTO): Promise<ApiResponse> {
        return this.securityService.confirmEmailChange(userId, userType, dto);
    }
}
