import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, MoreThan, Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { randomInt } from "crypto";
import * as bcrypt from 'bcrypt';
import { UserType } from "../../../common/enums/user-type.enum";
import { EmailService } from "../../../common/services/email.service";
import { UserReposityResolver } from "../../../common/services/user-repository.resolver";
import { CODE_SECURITY } from "../../../common/constants/code-security.constants";
import { ForgotPasswordRequest } from "./entities/forgot-password-request.entity";
import { ResponseStatus } from "../../../common/interfaces/api-response.interface";

@Injectable()
export class ForgotPasswordService {
    private readonly CODE_TTL_MINUTES = CODE_SECURITY.CODE_TTL_MINUTES;
    private readonly RESEND_COOLDOWN_SECONDS = CODE_SECURITY.RESEND_COOLDOWN_SECONDS;
    private readonly MAX_ATTEMPTS = CODE_SECURITY.MAX_ATTEMPTS;
    private readonly LOCK_MINUTES = CODE_SECURITY.LOCK_MINUTES;
    private readonly RESET_TOKEN_TTL_MINUTES = CODE_SECURITY.RESET_TOKEN_TTL_MINUTES;

    constructor(
        @InjectRepository(ForgotPasswordRequest)
        private readonly prrRepo: Repository<ForgotPasswordRequest>,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly userRepoResolver: UserReposityResolver,
    ) { }

    private generateResetCode(): string {
        return String(randomInt(0, 1_000_000)).padStart(6, '0');
    }

    async requestPasswordReset(email: string, userType: UserType): Promise<void> {
        const active = await this.prrRepo.findOne({
            where: { email, user_type: userType, used_at: IsNull() },
        });

        if (active?.last_sent_at) {
            const elapsed = (Date.now() - new Date(active.last_sent_at).getTime()) / 1000;
            if (elapsed < this.RESEND_COOLDOWN_SECONDS) return;
        }

        const code = this.generateResetCode();
        const codeHash = await bcrypt.hash(code, 10);
        const expiresAt = new Date(Date.now() + this.CODE_TTL_MINUTES * 60 * 1000);

        const patch: Partial<ForgotPasswordRequest> = {
            code_hash: codeHash,
            expires_at: expiresAt,
            attempts: 0,
            locked_until: null,
            last_sent_at: new Date(),
            used_at: null,
        };

        const entity = active
            ? this.prrRepo.merge(active, patch)
            : this.prrRepo.create({ email, user_type: userType, ...patch });

        await this.prrRepo.save(entity);

        await this.emailService.sendForgotPasswordCodeEmail(email, code, this.CODE_TTL_MINUTES);
    }

    async verifyResetCode(email: string, userType: UserType, code: string):
        Promise<{ reset_token: string }> {
        const request = await this.prrRepo.findOne({
            where: {
                email,
                user_type: userType,
                used_at: IsNull(),
                expires_at: MoreThan(new Date()),
            },
        });

        if (!request) throw new BadRequestException('Código inválido ou expirado');

        if (request.locked_until && request.locked_until > new Date()) {
            throw new BadRequestException('Muitas tentativas. Tente novamente mais tarde.');
        }

        const ok = await bcrypt.compare(code, request.code_hash);
        if (!ok) {
            request.attempts += 1;

            if (request.attempts >= this.MAX_ATTEMPTS) {
                request.locked_until = new Date(Date.now() + this.LOCK_MINUTES * 60 * 1000);
            }

            await this.prrRepo.save(request);
            throw new BadRequestException('Código inválido ou expirado');
        }

        request.used_at = new Date();
        request.attempts = 0;
        request.locked_until = null;
        await this.prrRepo.save(request);

        const reset_token = await this.jwtService.signAsync(
            { purpose: 'password_reset', email, type: userType },
            { expiresIn: `${this.RESET_TOKEN_TTL_MINUTES}m` },
        );

        return { reset_token };
    }

    async resetPassword(
        resetToken: string,
        newPassword: string,
        confirmPassword: string,
        userType: UserType,
    ): Promise<{
        status: ResponseStatus.SUCCESS;
        message: string;
        email: string;
    }> {
        if (newPassword != confirmPassword) {
            throw new BadRequestException('As senhas não coincidem');
        }

        const payload = await this.jwtService.verifyAsync(resetToken);

        if (payload.purpose != 'password_reset') {
            throw new BadRequestException('Token inválido');
        }

        if (payload.type !== userType) {
            throw new BadRequestException('Tipo de usuário inválido');
        }

        const userRepository = this.userRepoResolver.resolve(userType);
        const user = await userRepository.findOne({
            where: { email: payload.email },
        });

        if (!user) {
            throw new BadRequestException('Usuário não encontrado');
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await userRepository.update(user.id, {
            passwordHash: passwordHash,
        });

        return {
            status: ResponseStatus.SUCCESS,
            message: 'Senha atualizada com sucesso!',
            email: payload.email,
        };
    }
}