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

    async sendForgotPasswordCodeEmail(
        email: string,
        code: string,
        expiresMinutes: number,
    ): Promise<void> {
        const html = this.mailgun.getForgotPasswordTemplate(code, expiresMinutes);
        await this.mailgun.sendEmail(email, 'Recuperação de Senha - PetGo!', html);
    }

    async sendChangePasswordCodeEmail(
        email: string,
        userName: string,
        code: string,
        expiresMinutes: number,
    ): Promise<void> {
        const html = this.mailgun.getPasswordChangeCodeTemplate(code, userName, expiresMinutes);
        await this.mailgun.sendEmail(email, 'Confirme sua nova Senha - PetGo!', html);
    }

    async sendChangeEmailCode(
        email: string,
        userName: string,
        code: string,
        expiresMinutes: number,
    ): Promise<void> {
        const html = this.mailgun.getEmailChangeTemplate(code, userName, expiresMinutes);
        await this.mailgun.sendEmail(email, 'Solicitação de Troca de E-mail - PetGo!', html);
    }
}