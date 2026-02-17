import { Injectable, InternalServerErrorException } from '@nestjs/common';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

@Injectable()
export class MailgunEmailService {
  private mailgunClient: any;
  private mailgunDomain: string;

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
      const fromEmail = `PetGo <postmaster@${this.mailgunDomain}>`;
      const response = await this.mailgunClient.messages.create(this.mailgunDomain, {
        from: fromEmail,
        to: [to],
        subject: subject,
        html: html,
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao enviar email');
    }
  }

  getEmailTemplate(code: string, userName: string, expiresMinutes: number): string {
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
          <p><small>⏱️ Este código expira em ${expiresMinutes} minutos!</small></p>
          <p>Se você não solicitou este código, ignore este email.</p>
          <div class="footer"><p>© 2025 PetGo. Todos os direitos reservados.</p></div>
          <p><small>© ${new Date().getFullYear()} PetGo! Todos os direitos reservados.</small></p>
        </div>
      </body>
      </html>
    `;
  }

  getForgotPasswordTemplate(code: string, expiresMinutes: number): string {
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
          <p>Olá</strong>,</p>
          <p>Use o código abaixo para redefinir sua senha:</p>
          <div class="code-box"><p class="code">${code}</p></div>
          <p><small>⏱️ Este código expira em ${expiresMinutes} minutos!</small></p>
          <p>Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
          <div class="footer"><p><small>© ${new Date().getFullYear()} PetGo! Todos os direitos reservados.</small></p></div>
        </div>
      </body>
      </html>
     `;
  }

  getEmailChangeTemplate(code: string, userName: string, expiresMinutes: number): string {
    return `
    <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
          .header { text-align: center; color: #85AB6D; } /* Cor da Loja */
          .code-box { background-color: #ffffff; border: 2px dashed #85AB6D; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #85AB6D; margin: 0; }
          .warning { font-size: 12px; color: #666; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Troca de E-mail 📧</h1></div>
          <p>Olá <strong>${userName}</strong>,</p>
          <p>Recebemos um pedido para alterar o e-mail da sua conta PetGo!</p>
          <p>Para confirmar que este novo endereço pertence a você, use o código abaixo:</p>
          
          <div class="code-box">
            <p class="code">${code}</p>
          </div>

          <p>Este código expira em ${expiresMinutes} minutos.</p>
          <p class="warning">Se não foi você que solicitou, ignore este e-mail. Nenhuma alteração foi feita.</p>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordChangeCodeTemplate(code: string, userName: string, expiresMinutes: number): string {
    return `
    <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; padding: 30px; background-color: #ffffff; border-radius: 12px; }
          .header h1 { color: #85AB6D; text-align: center; }
          .code-box { background-color: #FFF0F0; border: 2px dashed #85AB6D; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #85AB6D; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Solicitação de Troca de Senha 🔐</h1></div>
          <p>Olá, <strong>${userName}</strong>!</p>
          <p>Para concluir a alteração da sua senha, insira o código abaixo no aplicativo:</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>

          <p>Este código expira em <strong>${expiresMinutes} minutos</strong>.</p>
          <p><strong>Não foi você?</strong> Não compartilhe este código com ninguém. Sua senha atual continua segura.</p>
        </div>
      </body>
      </html>
    `;
  }
}
