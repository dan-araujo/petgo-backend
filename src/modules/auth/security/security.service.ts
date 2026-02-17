import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserReposityResolver } from '../../../common/services/user-repository.resolver';
import { UserType } from '../../../common/enums/user-type.enum';
import { ConfirmChangePasswordDTO } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { ConfirmEmailChangeDTO, RequestEmailChangeDTO } from './dto/change-email.dto';
import { EmailVerificationService } from '../email-verification/email-verification.service';

@Injectable()
export class SecurityService {
    constructor(
        private readonly userRepoResolver: UserReposityResolver,
        private readonly emailVerificationService: EmailVerificationService,
    ) { }

    async requestPasswordChange(userId: string, userType: UserType): Promise<ApiResponse> {
        const repository = this.userRepoResolver.resolve(userType);
        const user = await repository.findOne({ where: { id: userId }, select: ['email'] });

        if (!user) throw new UnauthorizedException('Usuário não encontrado');

        const response = await this.emailVerificationService.createPasswordChangeRequest(user.email, userType);

        return {
            status: 'success',
            message: `Código de verificação enviado para ${user.email}`,
            data: response.data,
        };
    }

    async confirmPasswordChange(userId: string, userType: UserType, dto: ConfirmChangePasswordDTO): Promise<ApiResponse> {
        const repository = this.userRepoResolver.resolve(userType);
        const user = await await repository.createQueryBuilder('user')
            .addSelect('user.passwordHash')
            .addSelect('user.email')
            .where('user.id = :id', { id: userId })
            .getOne();

        if (!user) throw new UnauthorizedException('Usuário não encontrado.');

        await this.emailVerificationService.verifyCode(user.email, userType, dto.code);

        const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isMatch) throw new UnauthorizedException('A senha atual está incorreta.');
        const newHash = await bcrypt.hash(dto.newPassword, 10);
        await repository.update(userId, { passwordHash: newHash });

        return {
            status: 'success',
            message: 'Senha alterada com sucesso!',
        };
    }

    async requestEmailChange(userId: string, userType: UserType, dto: RequestEmailChangeDTO): Promise<ApiResponse> {
        await this.ensureEmailIsAvailable(dto.newEmail, userType);

        const repository = this.userRepoResolver.resolve(userType);
        const user = await repository.findOne({ where: { id: userId }, select: ['name'] });

        const response = await this.emailVerificationService.createEmailChangeRequest(dto.newEmail, userType, user?.name);

        return {
            status: 'success',
            message: `Código de verificação enviado para ${dto.newEmail}`,
            data: response.data,
        };
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
}
