import { Injectable, InternalServerErrorException } from '@nestjs/common';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

@Injectable()
export class MailgunEmailService {
    private mailgunClient: any;
    private mailgunDomain: string;
    private fromEmail: string;

    constructor() {
        const apiKey = process.env.MAILGUN_API_KEY;
        const domain = process.env.MAILGUN_DOMAIN;

        if (!apiKey || !domain) {
            throw new Error('MAILGUN_API_KEY ou MAILGUN_DOMAIN não configurados');
        }

        const mailgun = new Mailgun(FormData);
        this.mailgunClient = mailgun.client({ username: 'api', key: apiKey });
        this.mailgunDomain = domain;
        this.fromEmail = `PetGo! <noreply@${domain}>`;
    }

    async sendEmail(to: string, subject: string, html: string): Promise<any> {
        try {
            console.log('=== INICIANDO ENVIO DE EMAIL VIA MAILGUN ===');
            console.log(`Para: ${to}`);
            console.log(`De: ${this.fromEmail}`);
            console.log(`Assunto: ${subject}`);

            const response = await this.mailgunClient.messages.create(this.mailgunDomain, {
                from: this.fromEmail,
                to: to,
                subject: subject,
                html: html,
            });

            console.log('✅ Email enviado com sucesso via Mailgun!');
            console.log(`ID do email: ${response.id}`);
            console.log('=== FIM DO ENVIO ===');

            return response;
        } catch (error) {
            console.error('❌ Erro do Mailgun:', error);
            throw new InternalServerErrorException('Erro ao enviar email via Mailgun');
        }
    }
}
