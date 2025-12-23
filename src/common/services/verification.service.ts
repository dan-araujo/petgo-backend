import { Injectable } from '@nestjs/common';
import { ResendEmailService } from './resend-email.service';

@Injectable()
export class VerificationService {
  constructor(private readonly resendEmailService: ResendEmailService) { }

  generateCode(): string {
    return this.resendEmailService.generateCode();
  }

  getExpirationTime(): Date {
    return this.resendEmailService.getExpirationTime();
  }

  isCodeExpired(expiresAt: Date): boolean {
    return this.resendEmailService.isCodeExpired(expiresAt);
  }

  async sendVerificationEmail(
    email: string,
    code: string,
    userName: string,
  ): Promise<void> {
    return this.resendEmailService.sendVerificationEmail(email, code, userName);
  }
}
