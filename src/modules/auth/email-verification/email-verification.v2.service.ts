import { Injectable, BadRequestException } from '@nestjs/common';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { UserType } from '../../../common/enums/user-type.enum';
import { UserReposityResolver } from '../../../common/services/user-repository.resolver';
import { CODE_SECURITY } from '../../../common/constants/code-security.constants';
import { EmailService } from '../../../common/services/email.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { EmailVerificationRequest } from './entities/email-verification-request.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EmailVerificationServiceV2 {
  private readonly RESEND_CODE_COOLDOWN_SECONDS = CODE_SECURITY.RESEND_COOLDOWN_SECONDS;
  private readonly CODE_TTL_MINUTES = CODE_SECURITY.CODE_TTL_MINUTES;
  private readonly MAX_ATTEMPTS = CODE_SECURITY.MAX_ATTEMPTS;
  private readonly LOCK_MINUTES = CODE_SECURITY.LOCK_MINUTES;

  constructor(
    @InjectRepository(EmailVerificationRequest)
    private readonly repository: Repository<EmailVerificationRequest>,
    private readonly emailService: EmailService,
    private readonly userRepoResolver: UserReposityResolver,
  ) { }

  private generateCode(): string {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
  }

  /**
   * Send verification code
   * @param email User email
   * @param userType Type of user
   * @param skipRateLimit If true (login flow), don't throw rate limit error. Default false (resend flow).
   */
  async sendVerificationCode(email: string, userType: UserType, skipRateLimit = false): Promise<void> {
    const userRepository = this.userRepoResolver.resolve(userType);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    const active = await this.repository.findOne({
      where: {
        email,
        user_type: userType,
        used_at: IsNull(),
        expires_at: MoreThan(new Date()),
      },
    });

    // Check rate limit only if not skipping (resend flow, not login flow)
    if (!skipRateLimit && active?.last_sent_at) {
      const elapsed = (Date.now() - new Date(active.last_sent_at).getTime()) / 1000;

      if (elapsed < this.RESEND_CODE_COOLDOWN_SECONDS) {
        throw new BadRequestException(
          `Aguarde ${Math.ceil(this.RESEND_CODE_COOLDOWN_SECONDS - elapsed)}s para reenviar`
        );
      }
    }

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + this.CODE_TTL_MINUTES * 60 * 1000);
    const entity = active ? this.repository.merge(active, {
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
      locked_until: null,
      last_sent_at: new Date(),
    }) : this.repository.create({
      email,
      user_type: userType,
      code_hash: codeHash,
      expires_at: expiresAt,
      last_sent_at: new Date(),
    });

    await this.repository.save(entity);
    await this.emailService.sendVerificationCodeEmail(email, user.name, code, this.CODE_TTL_MINUTES);
  }

  async verifyCode(email: string, userType: UserType, code: string): Promise<boolean> {
    const request = await this.repository.findOne({
      where: {
        email,
        user_type: userType,
        used_at: IsNull(),
        expires_at: MoreThan(new Date()),
      }
    });

    if (!request) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    if (request.locked_until && request.locked_until > new Date()) {
      throw new BadRequestException('Muitas tentativas. Tente novamente mais tarde.');
    }

    const valid = await bcrypt.compare(code, request.code_hash);

    if (!valid) {
      request.attempts += 1;

      if (request.attempts >= this.MAX_ATTEMPTS) {
        request.locked_until = new Date(Date.now() + this.LOCK_MINUTES * 60 * 1000);
      }

      await this.repository.save(request);
      throw new BadRequestException('Código inválido ou expirado');
    }

    request.used_at = new Date();
    request.attempts = 0;
    request.locked_until = null;

    await this.repository.save(request);

    const userRepository = this.userRepoResolver.resolve(userType);
    await userRepository.update({ email }, { status: 'active' });

    return true;
  }
}
