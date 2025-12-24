import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MailgunEmailService } from './mailgun-email.service';

@Injectable()
export class VerificationService {
  private readonly CODE_EXPIRATIONS_MINUTES = 15;

  constructor(private readonly mailgunEmailService: MailgunEmailService) {}

  async sendVerificationEmail(email: string, userName: string, code: string): Promise<void> {
    const html = this.mailgunEmailService.getEmailTemplate(code, userName);
    await this.mailgunEmailService.sendEmail(
      email,
      'Código de Verificação - PetGo',
      html,
    );
  }

  async verifyEmail(repo: Repository<any>, email: string, code: string): Promise<boolean> {
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      return false;
    }

    if (user.verification_code !== code) {
      return false;
    }

    if (new Date() > user.code_expires_at) {
      return false;
    }

    // Marca como verificado
    await repo.update(user.id, {
      status: 'active',
      verification_code: null,
      code_expires_at: null,
    });

    return true;
  }

  async resendVerificationCode(repo: Repository<any>, email: string): Promise<void> {
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Regenera o código
    const newCode = this.generateCode();
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRATIONS_MINUTES * 60 * 1000);

    // Envia o email
    await this.sendVerificationEmail(email, user.name, newCode);

    // Atualiza no banco
    await repo.update(user.id, {
      verification_code: newCode,
      code_expires_at: expiresAt,
      last_code_send_at: new Date(),
    });
  }

  async handleOnLogin(repo: Repository<any>, user: any): Promise<any> {
    const isVerified = user.status === 'active';

    if (!isVerified) {
      // Envia código automaticamente no login
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + this.CODE_EXPIRATIONS_MINUTES * 60 * 1000);

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

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
