import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendEmailService {
  private resend: Resend;
  private readonly CODE_EXPIRATIONS_MINUTES = 10;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY não configurada!');
      throw new Error('RESEND_API_KEY é obrigatória');
    }

    this.resend = new Resend(apiKey);
    console.log('✅ Resend inicializado com sucesso');
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
    console.log('=== INICIANDO ENVIO DE EMAIL VIA RESEND ===');
    console.log('Para:', email);
    console.log('Nome:', userName);
    console.log('Código:', code);

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'PetGo! <onboarding@resend.dev>', 
        to: [email],
        subject: 'Código de Verificação - PetGo!',
        html: this._buildEmailHtml(code, userName),
      });

      if (error) {
        console.error('❌ Erro do Resend:', error);
        throw new Error(JSON.stringify(error));
      }

      console.log('✅ Email enviado com sucesso via Resend!');
      console.log('ID do email:', data?.id);
      console.log('=== FIM DO ENVIO ===');
    } catch (error) {
      console.error('=== ERRO AO ENVIAR EMAIL VIA RESEND ===');
      console.error('Erro:', {
        message: error.message,
        stack: error.stack,
      });
      console.error('=== FIM DO LOG DE ERRO ===');

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
