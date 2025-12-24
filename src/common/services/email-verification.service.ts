import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MailgunEmailService } from './mailgun-email.service';

@Injectable()
export class EmailVerificationService {
  private readonly CODE_EXPIRATIONS_MINUTES = 15;

  constructor(private readonly mailgunService: MailgunEmailService) { }

  async sendVerificationCode(repo: Repository<any>, user: any): Promise<void> {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRATIONS_MINUTES * 60 * 1000);

    try {
      const html = this.getEmailTemplate(code, user.name);

      await this.mailgunService.sendEmail(
        user.email,
        'Código de Verificação - PetGo',
        html,
      );

      await repo.update(user.id, {
        verification_code: code,
        code_expires_at: expiresAt,
        last_code_send_at: new Date(),
      });
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw error;
    }
  }

  async handleOnLogin(repo: Repository<any>, user: any): Promise<any> {
    const isVerified = user.status === 'active';

    if (!isVerified) {
      await this.sendVerificationCode(repo, user);

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

  async verifyCode(repo: Repository<any>, email: string, code: string): Promise<boolean> {
    const user = await repo.findOne({ where: { email } });

    if (!user || user.verification_code !== code) {
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

  async resendCode(repo: Repository<any>, email: string): Promise<void> {
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verifica rate limit (1 código a cada 5 minutos)
    const lastSend = user.last_code_send_at;
    if (lastSend && Date.now() - new Date(lastSend).getTime() < 5 * 60 * 1000) {
      throw new Error('Aguarde 5 minutos antes de solicitar um novo código');
    }

    await this.sendVerificationCode(repo, user);
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getEmailTemplate(code: string, userName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #85AB6D;">Bem-vindo ao PetGo! 🐾</h1>
        <p>Olá <strong>${userName}</strong>,</p>
        <p>Para verificar sua conta, use o código abaixo:</p>
        
        <div style="
          background-color: #f0f0f0;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
        ">
          <h2 style="color: #85AB6D; letter-spacing: 5px; margin: 0;">${code}</h2>
        </div>
        
        <p><small>⏱️ Este código expira em ${this.CODE_EXPIRATIONS_MINUTES} minutos.</small></p>
        <p>Se você não solicitou este código, ignore este email.</p>
        
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #ccc;">
        <p style="color: #666; font-size: 12px;">
          © 2025 PetGo. Todos os direitos reservados.
        </p>
      </div>
    `;
  }
}
