import { Injectable, InternalServerErrorException } from '@nestjs/common';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

@Injectable()
export class MailgunEmailService {
  private mailgunClient: any;
  private mailgunDomain: string;
  private readonly CODE_EXPIRATIONS_MINUTES = 15;

  constructor() {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (!apiKey || !domain) {
      throw new Error('MAILGUN_API_KEY ou MAILGUN_DOMAIN não configurados');
    }

    const mailgun = new Mailgun(FormData);
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: apiKey,
    });
    this.mailgunDomain = domain;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      console.log('📧 Enviando email via Mailgun...');
      console.log(`Para: ${to}`);

      const fromEmail = `PetGo <noreply@${this.mailgunDomain}>`;

      const response = await this.mailgunClient.messages.create(this.mailgunDomain, {
        from: fromEmail,
        to: to,
        subject: subject,
        html: html,
      });

      console.log('✅ Email enviado com sucesso!');
      console.log(`ID: ${response.id}`);
    } catch (error) {
      console.error('❌ Erro do Mailgun:', error);
      throw new InternalServerErrorException('Erro ao enviar email');
    }
  }

  getEmailTemplate(code: string, userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; color: #85AB6D; }
          .code-box { background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #85AB6D; margin: 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Bem-vindo ao PetGo! 🐾</h1></div>
          <p>Olá <strong>${userName}</strong>,</p>
          <p>Para verificar sua conta, use o código abaixo:</p>
          <div class="code-box"><p class="code">${code}</p></div>
          <p><small>⏱️ Este código expira em ${this.CODE_EXPIRATIONS_MINUTES} minutos!</small></p>
          <p>Se você não solicitou este código, ignore este email.</p>
          <div class="footer"><p>© 2025 PetGo. Todos os direitos reservados.</p></div>
        </div>
      </body>
      </html>
    `;
  }
}
