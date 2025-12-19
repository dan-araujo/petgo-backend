import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType } from '../enums/user-type.enum';
import { Customer } from '../../modules/customer/entities/customer.entity';
import { Delivery } from '../../modules/delivery/entities/delivery.entity';
import { Store } from '../../modules/store/entities/store.entity';
import { Veterinary } from '../../modules/veterinary/entities/veterinary.entity';

@Injectable()
export class UserRepoHelper {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Veterinary)
    private readonly veterinaryRepository: Repository<Veterinary>,
  ) {}

  /**
   * Retorna o repositório correto baseado no tipo de usuário
   */
  getRepositoryByType(userType: UserType): Repository<any> {
    const repositories: Record<UserType, Repository<any>> = {
      [UserType.CUSTOMER]: this.customerRepository,
      [UserType.DELIVERY]: this.deliveryRepository,
      [UserType.STORE]: this.storeRepository,
      [UserType.VETERINARY]: this.veterinaryRepository,
    };

    const repository = repositories[userType];
    if (!repository) {
      throw new Error(`Repositório não fornecido para tipo: ${userType}`);
    }

    return repository;
  }

  /**
   * Busca um usuário por email em todos os repositórios
   */
  async findUserByEmail(email: string): Promise<{
    user: any;
    userType: UserType;
    repository: Repository<any>;
  }> {
    const repositories: Record<UserType, Repository<any>> = {
      [UserType.CUSTOMER]: this.customerRepository,
      [UserType.DELIVERY]: this.deliveryRepository,
      [UserType.STORE]: this.storeRepository,
      [UserType.VETERINARY]: this.veterinaryRepository,
    };

    for (const [userType, repo] of Object.entries(repositories)) {
      const user = await repo.findOne({ where: { email } });
      if (user) {
        return {
          user,
          userType: userType as UserType,
          repository: repo,
        };
      }
    }

    throw new NotFoundException('Usuário não encontrado');
  }

  /**
   * Busca um usuário por ID e tipo
   */
  async findUserById(id: string, userType: UserType): Promise<{
    user: any;
    repository: Repository<any>;
  }> {
    const repository = this.getRepositoryByType(userType);
    const user = await repository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return { user, repository };
  }
}
