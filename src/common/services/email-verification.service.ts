import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../modules/store/entities/store.entity';
import { Customer } from '../../modules/customer/entities/customer.entity';
import { Delivery } from '../../modules/delivery/entities/delivery.entity';
import { Veterinary } from '../../modules/veterinary/entities/veterinary.entity';
import { VerificationService } from './verification.service';
import { UserType } from '../enums/user-type.enum';

@Injectable()
export class EmailVerificationService {
  // ✅ CONSTANTE PARA CONTROLAR RESEND
  private readonly RESEND_CODE_COOLDOWN_SECONDS = 60; 

  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
    @InjectRepository(Veterinary)
    private readonly veterinaryRepo: Repository<Veterinary>,
    private readonly verificationService: VerificationService,
  ) {}

  async verifyEmail(
    userType: string,
    email: string,
    code: string,
  ): Promise<boolean> {
    const repo = this._getRepository(userType);
    return this.verificationService.verifyEmail(repo, email, code);
  }

  // ✅ Chamado pelo auth.controller (sem repo)
  async resendVerificationCode(
    userType: string,
    email: string,
  ): Promise<void> {
    const repo = this._getRepository(userType);
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // ✅ VALIDAÇÃO DE RATE LIMIT
    if (user.last_code_send_at) {
      const lastSendTime = new Date(user.last_code_send_at).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = (currentTime - lastSendTime) / 1000;

      if (elapsedSeconds < this.RESEND_CODE_COOLDOWN_SECONDS) {
        const remainingSeconds = Math.ceil(
          this.RESEND_CODE_COOLDOWN_SECONDS - elapsedSeconds,
        );
        throw new BadRequestException(
          `Por favor ${remainingSeconds} segundos antes de enviar um novo código`,
        );
      }
    }

    const newCode = this.verificationService.generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    console.log(`📧 Resending verification code to: ${email}`);

    await this.verificationService.sendVerificationEmail(
      email,
      user.name,
      newCode,
    );

    await repo.update(user.id, {
      verification_code: newCode,
      code_expires_at: expiresAt,
      last_code_send_at: new Date(),
    });

    console.log(`✅ Código enviado com sucesso para: ${email}`);
  }

  // ✅ Chamado pelo auth.service no login (com repo)
  async handleOnLogin(
    repo: Repository<any>,
    user: any,
  ): Promise<{
    shouldContinueLogin: boolean;
    response: any;
  }> {
    return this.verificationService.handleOnLogin(repo, user);
  }

  // ✅ Chamado no cadastro (com repo e user)
  async sendVerificationCode(
    repo: Repository<any>,
    user: any,
  ): Promise<void> {
    const code = this.verificationService.generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.verificationService.sendVerificationEmail(
      user.email,
      user.name,
      code,
    );

    await repo.update(user.id, {
      verification_code: code,
      code_expires_at: expiresAt,
      last_code_send_at: new Date(),
    });
  }

  private _getRepository(type: string): Repository<any> {
    const repositories = {
      [UserType.STORE]: this.storeRepo,
      [UserType.CUSTOMER]: this.customerRepo,
      [UserType.DELIVERY]: this.deliveryRepo,
      [UserType.VETERINARY]: this.veterinaryRepo,
    };

    const repo = repositories[type];
    if (!repo) {
      throw new Error(`Tipo de usuário inválido: ${type}`);
    }

    return repo;
  }
}
