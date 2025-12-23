import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from "@nestjs/config";

export const mailerConfig = (configService: ConfigService): MailerOptions => {
    const mailSecure = configService.get<string>('MAIL_SECURE', 'true') === 'true';

    return {
        transport: {
            host: configService.get<string>('MAIL_HOST'),
            port: parseInt(configService.get<string>('MAIL_PORT', '465')), 
            secure: mailSecure, 
            auth: {
                user: configService.get<string>('MAIL_USER'),
                pass: configService.get<string>('MAIL_PASSWORD'),
            },
        },
        defaults: {
            from: `"${configService.get<string>('MAIL_FROM_NAME')}" <${configService.get<string>('MAIL_FROM')}>`,
        },
    };
};