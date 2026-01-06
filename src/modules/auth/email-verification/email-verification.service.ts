import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VerificationService } from './verification.service';
import { UserType } from '../../../common/enums/user-type.enum';
import { UserReposityResolver } from '../../../common/services/user-repository.resolver';

@Injectable()
export class EmailVerificationService {
  private readonly RESEND_CODE_COOLDOWN_SECONDS = 60;

  constructor(
    private readonly verificationService: VerificationService,
    private readonly userRepoResolver: UserReposityResolver,
  ) { }

  async verifyEmail(
    userType: UserType,
    email: string,
    code: string,
  ): Promise<boolean> {
    const repository = this.userRepoResolver.resolve(userType);
    return this.verificationService.verifyEmail(repository, email, code);
  }

  async resendVerificationCode(userType: UserType, email: string): Promise<void> {
    const repo = this.userRepoResolver.resolve(userType);
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.last_code_send_at) {
      const lastSendTime = new Date(user.last_code_send_at).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = (currentTime - lastSendTime) / 1000;

      if (elapsedSeconds < this.RESEND_CODE_COOLDOWN_SECONDS) {
        const remainingSeconds = Math.ceil(
          this.RESEND_CODE_COOLDOWN_SECONDS - elapsedSeconds,
        );
        throw new BadRequestException(
          `Por favor aguarde ${remainingSeconds} segundos antes de enviar um novo código`,
        );
      }
    }

    const newCode = this.verificationService.generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    console.log(`📧 Resending verification code to: ${email}`);

    await this.verificationService.sendVerificationEmail(
      email,
      user.name,
      newCode,
    );

    await repo.update(user.id, {
      verification_code: newCode,
      code_expires_at: expiresAt,
      last_code_send_at: new Date(),
    });

    console.log(`✅ Código enviado com sucesso para: ${email}`);
  }

  async handleOnLogin(repo: Repository<any>, user: any): Promise<{
    shouldContinueLogin: boolean;
    response: any;
  }> {
    return this.verificationService.handleOnLogin(repo, user);
  }

  async sendVerificationCode(repo: Repository<any>, user: any): Promise<void> {
    const code = this.verificationService.generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.verificationService.sendVerificationEmail(
      user.email,
      user.name,
      code,
    );

    await repo.update(user.id, {
      verification_code: code,
      code_expires_at: expiresAt,
      last_code_send_at: new Date(),
    });
  }
}
