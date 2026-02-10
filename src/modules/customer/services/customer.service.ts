import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from '../entities/customer.entity';
import { BaseService } from '../../../common/base/base.service';
import { EmailVerificationServiceV2 } from '../../auth/email-verification/email-verification.v2.service';
import { CreateCustomerDTO } from '../dto/create-customer.dto';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { ValidationMessages } from '../../../common/constants/validation-messages.constants';
import { UserType } from '../../../common/enums/user-type.enum';
import { UpdateCustomerDTO } from '../dto/update-customer.dto';
import { AccountStatus } from '../../../common/enums/account-status.enum';


@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly emailVerificationService: EmailVerificationServiceV2,
  ) {
    super(customerRepo);
  }

  async create(data: CreateCustomerDTO): Promise<ApiResponse> {
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

      const passwordHash = await bcrypt.hash(data.password, 10);
      const cpf = data.cpf?.trim() === '' ? null : data.cpf;

      const customer = this.customerRepo.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: cpf as any,
        passwordHash,
        status: AccountStatus.PENDING,
      });

      savedCustomer = await this.customerRepo.save(customer);

      await this.emailVerificationService.sendVerificationCode(
        savedCustomer.email,
        UserType.CUSTOMER,
      );

      return {
        status: 'pending_code',
        message: 'Cadastro realizado! Código de verificação enviado para seu e-mail.',
        email: savedCustomer.email,
        data: { userId: savedCustomer.id },
      };
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

  async update(id: string, data: Partial<UpdateCustomerDTO>): Promise<Customer> {
    try {
      const customer = await this.customerRepo.findOne({ where: { id } });
      if (!customer) throw new NotFoundException('Cliente não encontrado');

      await this.checkUnique(data, ['email', 'cpf', 'phone'], id, {
        email: ValidationMessages.EMAIL_ALREADY_EXISTS,
        cpf: ValidationMessages.CPF_ALREADY_EXISTS,
        phone: ValidationMessages.PHONE_ALREADY_EXISTS,
      });

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
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
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