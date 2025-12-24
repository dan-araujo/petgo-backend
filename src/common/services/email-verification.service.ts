import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../../modules/store/entities/store.entity';
import { Customer } from '../../modules/customer/entities/customer.entity';
import { Delivery } from '../../modules/delivery/entities/delivery.entity';
import { Veterinary } from '../../modules/veterinary/entities/veterinary.entity';
import { VerificationService } from './verification.service';

@Injectable()
export class EmailVerificationService {
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
  ) { }

  async verifyEmail(userType: string, email: string, code: string): Promise<boolean> {
    const repo = this._getRepository(userType);
    return this.verificationService.verifyEmail(repo, email, code);
  }

  private _getRepository(type: string) {
    // Mesma lógica que está em auth.service.ts
    const repositories = {
      'store': this.storeRepo,
      'customer': this.customerRepo,
      'delivery': this.deliveryRepo,
      'veterinary': this.veterinaryRepo,
    };
    return repositories[type];
  }

  // ✅ Chamado pelo auth.controller (sem repo)
  async resendVerificationCode(email: string): Promise<void> {
    const repo = await this._findRepositoryByEmail(email);
    await this.verificationService.resendVerificationCode(repo, email);
  }

  // ✅ Chamado pelo auth.service no login (com repo)
  async handleOnLogin(repo: Repository<any>, user: any): Promise<any> {
    return this.verificationService.handleOnLogin(repo, user);
  }

  // ✅ Chamado no cadastro (com repo e user)
  async sendVerificationCode(repo: Repository<any>, user: any): Promise<void> {
    const code = this._generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await this.verificationService.sendVerificationEmail(user.email, user.name, code);

    await repo.update(user.id, {
      verification_code: code,
      code_expires_at: expiresAt,
      last_code_send_at: new Date(),
    });
  }

  // ✅ Método privado para encontrar o repositório certo
  private async _findRepositoryByEmail(email: string): Promise<Repository<any>> {
    const repositories = [
      { repo: this.storeRepo, name: 'Store' },
      { repo: this.customerRepo, name: 'Customer' },
      { repo: this.deliveryRepo, name: 'Delivery' },
      { repo: this.veterinaryRepo, name: 'Veterinary' },
    ];

    for (const { repo, name } of repositories) {
      const user = await repo.findOne({ where: { email } });
      if (user) {
        console.log(`✅ Usuário encontrado: ${name}`);
        return repo;
      }
    }

    throw new NotFoundException('Usuário não encontrado');
  }

  private _generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
