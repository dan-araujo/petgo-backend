import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from "@nestjs/config";

export const mailerConfig = (configService: ConfigService): MailerOptions => {
    const mailSecure = configService.get<string>('MAIL_SECURE', 'true') === 'true';
    const mailPort = parseInt(configService.get<string>('MAIL_PORT', '465'));

    return {
        transport: {
            host: configService.get<string>('MAIL_HOST'),
            port: mailPort,
            secure: mailSecure, 
            connectionTimeout: 10000, 
            greetingTimeout: 10000,   
            socketTimeout: 10000,    
            auth: {
                user: configService.get<string>('MAIL_USER'),
                pass: configService.get<string>('MAIL_PASSWORD'),
            },
            tls: {
                rejectUnauthorized: false,
            },
        },
        defaults: {
            from: `"${configService.get<string>('MAIL_FROM_NAME')}" <${configService.get<string>('MAIL_FROM')}>`,
        },
    };
};
