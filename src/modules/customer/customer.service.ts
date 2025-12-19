import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateCustomerDTO } from './dto/create-customer.dto';
import * as bcrypt from 'bcrypt';
import { UpdateCustomerDTO } from './dto/update-customer.dto';
import { BaseService } from '../../common/base/base.service';
import { ValidationMessages } from '../../common/constants/validation-messages';
import { AuthResponse, AuthService } from '../auth/auth.service';
import { UserType } from '../../common/enums/user-type.enum';

@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly authService: AuthService,
  ) {
    super(customerRepo);
  }

  async create(data: CreateCustomerDTO): Promise<AuthResponse> {
        let savedCustomer: Customer | null = null;

        try {
            await this.checkUnique(
                data,
                ['email', 'cpf', 'phone'],
                undefined,
                {
                    email: ValidationMessages.EMAIL_ALREADY_EXISTS,
                    cpf: ValidationMessages.CPF_ALREADY_EXISTS,
                    phone: ValidationMessages.PHONE_ALREADY_EXISTS,
                },
            );

            const password_hash = await bcrypt.hash(data.password, 10);
            const cpf = data.cpf?.trim() === '' ? null : data.cpf;

            const customer = this.customerRepo.create({
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf: cpf as any,
                password_hash,
                status: 'pending',
            });

            savedCustomer = await this.customerRepo.save(customer);

            const result = await this.authService.completeUserRegistration(
                UserType.CUSTOMER,
                savedCustomer.id,
                savedCustomer.email,
                savedCustomer.name,
            );

            return result;
        } catch (error) {
            console.error('Erro ao criar o cliente: ', error);

            if (savedCustomer) {
                console.warn(`Deletando cliente ${savedCustomer.id} por falha no e-mail`);
                await this.customerRepo.delete(savedCustomer.id);
            }

            if (error instanceof ConflictException) throw error;
            if (error instanceof BadRequestException) throw error;
            throw new InternalServerErrorException('Erro interno ao cadastrar cliente');
        }
    }

  async update(
    id: string,
    data: Partial<UpdateCustomerDTO>,
  ): Promise<Customer> {
    try {
      const customer = await this.customerRepo.findOne({ where: { id } });
      if (!customer) throw new NotFoundException('Cliente não encontrado');

      await this.checkUnique(
        data,
        ['email', 'cpf', 'phone'],
        id,
        {
          email: ValidationMessages.EMAIL_ALREADY_EXISTS,
          cpf: ValidationMessages.CPF_ALREADY_EXISTS,
          phone: ValidationMessages.PHONE_ALREADY_EXISTS,
        },
      );

      if ('password' in data) {
        throw new BadRequestException(
          'A senha não pode ser alterada por este endopoint. Use o fluxo de recuperação de senha.',
        );
      }

      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) delete data[key];
      });

      Object.assign(customer, data);
      return await this.customerRepo.save(customer);
    } catch (error) {
      console.error('Erro ao atualizar cliente: ', error);
      if (error instanceof NotFoundException || error instanceof ConflictException)
        throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Erro interno ao atualizar cliente');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.customerRepo.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Cliente não encontrado');
      }
    } catch (error) {
      console.error('Erro ao remover cliente: ', error);
      throw new InternalServerErrorException('Erro interno ao remover cliente');
    }
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepo.find({ where: { deleted_at: IsNull() } });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return customer;
  }
}
