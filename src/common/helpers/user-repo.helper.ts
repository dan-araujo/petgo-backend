import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Customer } from '../../customer/entities/customer.entity';
import { Delivery } from '../../delivery/entities/delivery.entity';
import { Store } from '../../store/entities/store.entity';
import { Veterinary } from '../../veterinary/entities/veterinary.entity';

import { UserRepositories, UserType, UserTypeToRepoMap } from '../enums/user-type.enum';
import { User } from '../../databases/entities/user.entity';

@Injectable()
export class UserRepoHelper {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Veterinary)
    private readonly veterinaryRepository: Repository<Veterinary>,
  ) { }

  static getRepo(type: UserType, repos: UserRepositories): Repository<any> {
    const repoKey = UserTypeToRepoMap[type];
    const repo = repos[repoKey];
    if (!repo) {
      throw new Error(`Repositório não fornecido para tipo: ${type}`);
    }
    return repo;
  }

  async findUserByEmail(email: string): Promise<{ user: any; repository: Repository<any> }> {
    const userMapping = await this.userRepository.findOne({
      where: { email }
    });

    if (!userMapping) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const repositories = {
      customer: this.customerRepository,
      delivery: this.deliveryRepository,
      store: this.storeRepository,
      veterinary: this.veterinaryRepository,
    };

    const repository = repositories[userMapping.user_type];

    if (!repository) {
      throw new NotFoundException(`Tipo de usuário inválido: ${userMapping.user_type}`);
    }

    const user = await repository.findOne({ where: { id: userMapping.user_id } });

    if (!user) throw new NotFoundException('Usuário específico não encontrado');

    return { user, repository };
  }
}