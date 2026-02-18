import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserReposityResolver } from '../../../common/services/user-repository.resolver';
import { UserType } from '../../../common/enums/user-type.enum';
import { ConfirmChangePasswordDTO, ValidateChangePasswordCodeDTO } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { ConfirmEmailChangeDTO, RequestEmailChangeDTO } from './dto/change-email.dto';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SecurityService {
    constructor(
        private readonly userRepoResolver: UserReposityResolver,
        private readonly emailVerificationService: EmailVerificationService,
        private readonly jwtService: JwtService,
    ) { }

    async requestPasswordChange(userId: string, userType: UserType): Promise<ApiResponse> {
        const user = await this.getUser(userId, userType);
        await this.emailVerificationService.createPasswordChangeRequest(user.email, userType);

        return {
            status: 'success',
            message: `Código de verificação enviado para ${user.email}`,
        } as ApiResponse;
    }

    async validateChangePasswordCode(userId: string, userType: UserType, dto: ValidateChangePasswordCodeDTO): Promise<ApiResponse> {
        const user = await this.getUser(userId, userType);
        await this.emailVerificationService.verifyCode(user.email, userType, dto.code);

        const payload = {
            sub: userId,
            type: userType,
            scope: 'change_password_flow'
        };

        const tempToken = this.jwtService.sign(payload);

        return {
            status: 'success',
            message: 'Código de verificação válido.',
            data: {
                token: tempToken,
            },
        };
    }

    async confirmPasswordChange(userId: string, userType: UserType, dto: ConfirmChangePasswordDTO): Promise<ApiResponse> {
        try {
            const payload = this.jwtService.verify(dto.token);
            if (payload.sub !== userId || payload.scope !== 'change_password_flow') {
                throw new UnauthorizedException('Token inválido.');
            }
        } catch (error) {
            throw new UnauthorizedException('Sessão de alteração expirada. Solicite o código novamente.')
        }

        const repository = this.userRepoResolver.resolve(userType);
        const user = await await repository.createQueryBuilder('user')
            .addSelect('user.passwordHash')
            .addSelect('user.email')
            .where('user.id = :id', { id: userId })
            .getOne();

        if (!user) throw new UnauthorizedException('Usuário não encontrado.');

        const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isMatch) throw new UnauthorizedException('A senha atual está incorreta.');

        if (dto.currentPassword === dto.newPassword) {
            throw new BadRequestException('A nova senha deve ser diferente da atual.');
        }

        const newHash = await bcrypt.hash(dto.newPassword, 10);
        await repository.update(userId, { passwordHash: newHash });

        return {
            status: 'success',
            message: 'Senha alterada com sucesso!',
        } as ApiResponse;
    }

    async requestEmailChange(userId: string, userType: UserType, dto: RequestEmailChangeDTO): Promise<ApiResponse> {
        await this.ensureEmailIsAvailable(dto.newEmail, userType);
        const repository = this.userRepoResolver.resolve(userType);
        const user = await repository.findOne({ where: { id: userId }, select: ['name'] });

        await this.emailVerificationService.createEmailChangeRequest(dto.newEmail, userType, user?.name);

        return {
            status: 'success',
            message: `Código de verificação enviado para ${dto.newEmail}`,
        } as ApiResponse;
    }

    async confirmEmailChange(userId: string, userType: UserType, dto: ConfirmEmailChangeDTO) {
        await this.emailVerificationService.verifyCode(dto.newEmail, userType, dto.code);

        const repository = this.userRepoResolver.resolve(userType);
        await repository.update(userId, { email: dto.newEmail });

        return {
            status: 'success',
            message: 'E-mail alterado com sucesso.'
        } as ApiResponse;
    }

    private async ensureEmailIsAvailable(email: string, userType: UserType) {
        const repository = this.userRepoResolver.resolve(userType);
        const count = await repository.count({ where: { email } });

        if (count > 0) {
            throw new ConflictException('E-mail já está em uso.');
        }
    }

    private async getUser(userId: string, userType: UserType) {
        const repository = this.userRepoResolver.resolve(userType);
        const user = await repository.findOne({ where: { id: userId }, select: ['email'] });
        if (!user) throw new UnauthorizedException('Usuário não encontrado');
        return user;
    }
}
