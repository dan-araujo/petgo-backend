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
import { ApiResponse, ResponseStatus, SendCodeResponse, VerifyCodeResponse } from '../../../common/interfaces/api-response.interface';
import { use } from 'passport';

@Injectable()
export class EmailVerificationService {
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

  private async _generateAndSaveRequest(
    email: string,
    userType: UserType,
    providedUserName?: string
  ): Promise<{ code: string; userName: string }> {
    const userRepo = this.userRepoResolver.resolve(userType);

    let userName: string;

    if (providedUserName) {
      userName = providedUserName;
    } else {
      const userRepository = this.userRepoResolver.resolve(userType);
      const user = await userRepo.findOne({ where: { email }, select: ['name'] });
      userName = user?.name || 'Usuário';
    }

    const lastRequest = await this.repository.findOne({
      where: { email, userType },
      order: { createdAt: 'DESC' },
    });

    if (lastRequest && lastRequest.lastSentAt) {
      const now = new Date();
      const diffSeconds = (now.getTime() - lastRequest.lastSentAt.getTime()) / 1000;
      if (diffSeconds < this.RESEND_CODE_COOLDOWN_SECONDS) {
        throw new BadRequestException(`Aguarde ${Math.ceil(this.RESEND_CODE_COOLDOWN_SECONDS - diffSeconds)}s para reenviar um novo código.`);
      }
    }

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_TTL_MINUTES);

    const request = this.repository.create({
      email,
      userType,
      codeHash,
      expiresAt,
      lastSentAt: new Date(),
      attempts: 0,
    });

    await this.repository.save(request);

    return { code, userName };
  }

  async sendVerificationCode(
    email: string,
    userType: UserType,
  ): Promise<ApiResponse<SendCodeResponse>> {
    const { code, userName } = await this._generateAndSaveRequest(email, userType);

    await this.emailService.sendVerificationCodeEmail(
      email,
      userName,
      code,
      this.CODE_TTL_MINUTES,
    );

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Código de verificação enviado',
      data: {
        email: email,
        expiresIn: this.CODE_TTL_MINUTES * 60,
      },
    };
  }

  async createPasswordChangeRequest(email: string, userType: UserType): Promise<ApiResponse<SendCodeResponse>> {
    const { code, userName } = await this._generateAndSaveRequest(email, userType);

    await this.emailService.sendChangePasswordCodeEmail(
      email,
      userName,
      code,
      this.CODE_TTL_MINUTES
    );

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Código de verificação enviado',
      data: {
        email,
        expiresIn: this.CODE_TTL_MINUTES * 60,
      },
    };
  }

  async createEmailChangeRequest(email: string, userType: UserType, providedName?: string): Promise<ApiResponse<SendCodeResponse>> {
    const { code, userName } = await this._generateAndSaveRequest(email, userType, providedName);

    await this.emailService.sendChangeEmailCode(
      email,
      userName,
      code,
      this.CODE_TTL_MINUTES
    );

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Código de verificação enviado para o novo e-mail',
      data: {
        email,
        expiresIn: this.CODE_TTL_MINUTES * 60,
      },
    };
  }

  async verifyCode(
    email: string,
    userType: UserType,
    code: string
  ): Promise<ApiResponse<VerifyCodeResponse>> {
    const request = await this.repository.findOne({
      where: {
        email,
        userType: userType,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' }
    });

    if (!request) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    if (request.lockedUntil && request.lockedUntil > new Date()) {
      throw new BadRequestException(
        'Muitas tentativas. Tente novamente mais tarde.'
      );
    }

    const valid = await bcrypt.compare(code, request.codeHash);

    if (!valid) {
      request.attempts += 1;

      if (request.attempts >= this.MAX_ATTEMPTS) {
        request.lockedUntil = new Date(
          Date.now() + this.LOCK_MINUTES * 60 * 1000
        );
      }

      await this.repository.save(request);
      throw new BadRequestException('Código inválido ou expirado');
    }

    request.usedAt = new Date();
    request.attempts = 0;
    request.lockedUntil = null;
    await this.repository.save(request);

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Código verificado com sucesso!',
      data: {
        verified: true,
      },
    };
  }
}
