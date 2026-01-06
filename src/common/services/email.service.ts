import { Injectable } from "@nestjs/common";
import { MailgunEmailService } from "./mailgun-email.service";

@Injectable()
export class EmailService {
    constructor(private readonly mailgun: MailgunEmailService) { }

    async sendVerificationCodeEmail(email: string,
        userName: string,
        code: string,
        expiresMinutes: number,
    ): Promise<void> {
        const html = this.mailgun.getEmailTemplate(code, userName, expiresMinutes);
        await this.mailgun.sendEmail(email, 'Código de verificação - PetGo!', html);
    }

    async sendPasswordResetCodeEmail(
        email: string,
        code: string,
        expiresMinutes: number,
    ): Promise<void> {
        const html = this.mailgun.getPasswordResetTemplate(code, expiresMinutes);
        await this.mailgun.sendEmail(email, 'Recuperação de Senha - PetGo!', html);
    }
}