import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class VerificationService {
  private readonly CODE_EXPIRATIONS_MINUTES = 10;
  constructor(private readonly mailerService: MailerService, private readonly configService: ConfigService) { }

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

  async sendVerificationEmail(email: string, code: string, userName: string):
    Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Código de Verificação - PetGo!',
        html: this._buildEmailHtml(code, userName),
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; color: #16a34a; }
            .code-box { 
              background-color: #f0f0f0; 
              padding: 20px; 
              text-align: center; 
              border-radius: 8px; 
              margin: 20px 0;
            }
            .code { 
              font-size: 32px; 
              font-weight: bold; 
              color: #16a34a; 
              letter-spacing: 5px;
            }
            .expiration { color: #666; font-size: 14px; margin-top: 20px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🐾 Bem-vindo ao PetGo!</h2>
            </div>
            
            <p>Olá <strong>${userName}</strong>,</p>
            
            <p>Para ativar sua conta, use o código de verificação abaixo:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p class="expiration">
              ⏱️ Este código expira em <strong>${this.CODE_EXPIRATIONS_MINUTES} minutos!</strong>
            </p>
            
            <p>Se você não solicitou este código, ignore este email.</p>
            
            <div class="footer">
              <p>© 2025 PetGo. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}