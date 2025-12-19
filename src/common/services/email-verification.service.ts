import { BadRequestException, Injectable } from "@nestjs/common";
import { VerificationService } from "./verification.service";
import { UserStatus } from "../enums/user-status.enum";
import { Repository } from "typeorm";
import { AuthResponse } from "../../auth/auth.service";
import { UserRepoHelper } from "../helpers/user-repo.helper";

export type EmailVerificationResult = | { shouldContinueLogin: true; response: null } |
{
    shouldContinueLogin: false;
    response: {
        status: 'pending_code' | 'new_sent_code';
        message: string;
        email: string;
    };
};

@Injectable()
export class EmailVerificationService {
    constructor(private readonly verificationService: VerificationService, private readonly userRepoHelper: UserRepoHelper) { }

    async verifyEmail(email: string, code: string): Promise<AuthResponse> {
        const { user, repository: repo } = await this.userRepoHelper.findUserByEmail(email);
        await this.validateEmailVerificationCode(user, code);
        await this.markEmailAsVerified(repo, user);

        return {
            status: 'success',
            message: 'Email verificado com sucesso! Agora você pode fazer login.',
            email: user.email,
        };
    }

    async validateEmailVerificationCode(user: any, code: string): Promise<void> {
        if (user.status === UserStatus.ACTIVE) {
            throw new BadRequestException('Este email já foi verificado.');
        }

        if (user.verification_code !== code) {
            throw new BadRequestException('Código inválido');
        }

        if (this.verificationService.isCodeExpired(user.code_expires_at)) {
            throw new BadRequestException(
                'Código expirado. Faça login novamente para receber um novo código.',
            );
        }
    }

    async markEmailAsVerified(repo: Repository<any>, user: any): Promise<void> {
        await repo.update({ id: user.id }, {
            status: UserStatus.ACTIVE,
            verification_code: null,
            code_expires_at: null,
        });
    }

    async handleOnLogin(repo: Repository<any>, user: any): Promise<EmailVerificationResult> {
        if (user.status === UserStatus.ACTIVE) {
            return { shouldContinueLogin: true, response: null };
        }

        if (this._hasValidVerificationCode(user)) {
            return {
                shouldContinueLogin: false,
                response: {
                    status: 'pending_code',
                    message: 'Email ainda não verificado. Use o código enviado para seu email.',
                    email: user.email,
                },
            };
        }

        await this.sendVerificationCode(repo, user);
        return {
            shouldContinueLogin: false,
            response: {
                status: 'new_sent_code',
                message: 'Novo código de verificação enviado para seu e-mail',
                email: user.email
            },
        };
    }

    private _hasValidVerificationCode(user: any): boolean {
        return user.verification_code && !this.verificationService.isCodeExpired(user.code_expires_at);
    }

    async sendVerificationCode(repo: Repository<any>, user: any): Promise<void> {
        const verificationCode = this.verificationService.generateCode();
        const expiresAt = this.verificationService.getExpirationTime();

        await repo.update({ id: user.id }, {
            verification_code: verificationCode,
            code_expires_at: expiresAt,
            status: UserStatus.PENDING,
        });

        await this.verificationService.sendVerificationEmail(
            user.email,
            verificationCode,
            user.name
        );
    }

    async resendVerificationCode(email: string): Promise<AuthResponse> {
        try {
            const { user, repository } = await this.userRepoHelper.findUserByEmail(email);

            if (user.last_code_send_at) {
                const lastSent = new Date(user.last_code_send_at).getTime();
                const diff = Date.now() - lastSent;

                if (diff < 60_000) {
                    return {
                        status: 'error',
                        message: `Aguarde ${Math.ceil((60_000 - diff) / 1000)}s antes de reenviar`,
                    };
                }
            }

            await this.sendVerificationCode(repository, user);
            user.last_code_send_at = new Date();
            await repository.save(user);
            return {
                status: 'new_sent_code',
                message: 'Novo código de verificação enviado para seu email.',
                email,
            };
        } catch (error: any) {
            console.error('Erro ao reenviar código:', error);
            return {
                status: 'error',
                message: error.message || 'Erro ao processar solicitação',
            };
        }
    }
}