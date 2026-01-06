import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EmailService } from '../../../common/services/email.service';

@Injectable()
export class VerificationService {
  private readonly CODE_EXPIRATIONS_MINUTES = 10;

  constructor(private readonly emailService: EmailService) { }

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyEmail(repo: Repository<any>, email: string, code: string): Promise<boolean> {
    console.log(`🔍 Tentando verificar email: ${email} com código: ${code}`);

    const user = await repo.findOne({ where: { email } });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return false;
    }

    const codigoIguais = String(user.verification_code) === String(code);
    if (!codigoIguais) {
      console.log('❌ Código incorreto');
      return false;
    }

    if (!user.code_expires_at || new Date() > new Date(user.code_expires_at)) {
      console.log('❌ Código expirou');
      return false;
    }

    console.log('✅ Código válido! Marcando usuário como ativo...');
    await repo.update(user.id, {
      status: 'active',
      verification_code: null,
      code_expires_at: null,
    });

    console.log('✅ Usuário verificado com sucesso!');
    return true;
  }

  async sendVerificationEmail(
    email: string,
    userName: string,
    code: string,
  ): Promise<void> {
    await this.emailService.sendVerificationCodeEmail(
      email,
      userName,
      code,
      this.CODE_EXPIRATIONS_MINUTES,
    );
  }

  async handleOnLogin(
    repo: Repository<any>,
    user: any,
  ): Promise<{
    shouldContinueLogin: boolean;
    response: any;
  }> {
    const isVerified = user.status === 'active';

    if (!isVerified) {
      const code = this.generateCode();
      const expiresAt = new Date(
        Date.now() + this.CODE_EXPIRATIONS_MINUTES * 60 * 1000,
      );

      await this.sendVerificationEmail(user.email, user.name, code);

      await repo.update(user.id, {
        verification_code: code,
        code_expires_at: expiresAt,
        last_code_send_at: new Date(),
      });

      return {
        shouldContinueLogin: false,
        response: {
          status: 'pending_code',
          message: 'Seu email precisa ser verificado. Código enviado!',
          email: user.email,
        },
      };
    }

    return {
      shouldContinueLogin: true,
      response: { status: 'success' },
    };
  }
}
