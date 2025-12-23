import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class VerificationService {
  private readonly CODE_EXPIRATIONS_MINUTES = 10;

  constructor(
    private readonly mailerService: MailerService,
  ) {
    console.log('MAIL_HOST:', process.env.MAIL_HOST);
    console.log('MAIL_PORT:', process.env.MAIL_PORT);
    console.log('MAIL_SECURE:', process.env.MAIL_SECURE);
  }

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getExpirationTime(): Date {
    const now = new Date();
    return new Date(now.getTime() + this.CODE_EXPIRATIONS_MINUTES * 60 * 1000);
  }


  isCodeExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }


  async sendVerificationEmail(
    email: string,
    code: string,
    userName: string,
  ): Promise<void> {
    try {
      const htmlContent = this._buildEmailHtml(code, userName);

      await this.mailerService.sendMail({
        to: email,
        subject: 'Código de Verificação - PetGo!',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Erro ao enviar email de verificação: ', {
        email,
        error: error.message,
        code: error.code,
        stack: error.stack,
      });

      throw new InternalServerErrorException(
        'Não conseguimos enviar o código de verificação. Por favor tente novamente.',
      );
    }
  }


  private _buildEmailHtml(code: string, userName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-top: 0;">🐾 Bem-vindo ao PetGo!</h2>
          
          <p style="color: #666; font-size: 16px;">
            Olá <strong>${userName}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Para ativar sua conta, use o código de verificação abaixo:
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0;">
            <p style="font-size: 32px; font-weight: bold; color: #2ecc71; margin: 0; letter-spacing: 5px;">
              ${code}
            </p>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            ⏱️ Este código expira em ${this.CODE_EXPIRATIONS_MINUTES} minutos!
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Se você não solicitou este código, ignore este email.
          </p>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
            © 2025 PetGo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `;
  }
}
