import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDeliveryDTO } from '../dto/create-delivery.dto';
import { UpdateDeliveryDTO } from '../dto/update-delivery.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from '../entities/delivery.entity';
import { IsNull, Repository } from 'typeorm';
import { BaseService } from '../../../common/base/base.service';
import { ValidationMessages } from '../../../common/constants/validation-messages.constants';
import { UserType } from '../../../common/enums/user-type.enum';
import { EmailVerificationService } from '../../auth/email-verification/email-verification.service';
import { ApiResponse, ResponseStatus } from '../../../common/interfaces/api-response.interface';
import { AccountStatus } from '../../../common/enums/account-status.enum';

@Injectable()
export class DeliveryService extends BaseService<Delivery> {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
    private readonly emailVerificationService: EmailVerificationService,
  ) {
    super(deliveryRepo);
  }

  async create(data: CreateDeliveryDTO): Promise<ApiResponse> {
    let savedDelivery: Delivery | null = null;
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

      const passwordHash = await this.hashPassword(data.password);
      const cpf = data.cpf?.trim() === '' ? null : data.cpf;

      const delivery = this.deliveryRepo.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: cpf as any,
        passwordHash: passwordHash,
        status: AccountStatus.PENDING,
      });

      savedDelivery = await this.deliveryRepo.save(delivery);

      await this.emailVerificationService.sendVerificationCode(
        savedDelivery.email,
        UserType.DELIVERY,
      );

      return {
        status: ResponseStatus.PENDING_CODE,
        message: 'Cadastro realizado! Código de verificação enviado para seu e-mail.',
        email: savedDelivery.email,
        data: { userId: savedDelivery.id },
      };
    } catch (error) {
      console.error('Erro ao criar entregador: ', error);
      if (savedDelivery) {
        console.warn(`Deletando entregador ${savedDelivery.id} por falha no e-mail`);
        await this.deliveryRepo.delete(savedDelivery.id);
      }

      if (error instanceof ConflictException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Erro interno ao cadastrar entregador.');
    }
  }

  async update(id: string, data: Partial<UpdateDeliveryDTO>): Promise<Delivery> {
    try {
      const delivery = await this.deliveryRepo.findOne({ where: { id } });
      if (!delivery) throw new NotFoundException('Entregador não encontrado.');

      await this.checkUnique(data, ['email', 'cpf', 'phone'], id, {
        email: ValidationMessages.EMAIL_ALREADY_EXISTS,
        cpf: ValidationMessages.CPF_ALREADY_EXISTS,
        phone: ValidationMessages.PHONE_ALREADY_EXISTS,
      });

      if ('password' in data) {
        throw new BadRequestException(
          'A senha não pode ser alterada por este endpoint. Use o fluxo de recuperação de senha.',
        );
      }

      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) delete data[key];
      });

      Object.assign(delivery, data);
      return this.deliveryRepo.save(delivery);
    } catch (error) {
      console.error('Erro ao atualizar entregador: ', error);
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Erro interno ao atualizar entregador');
    }
  }

  async findAll(): Promise<Delivery[]> {
    return this.deliveryRepo.find({ where: { deletedAt: IsNull() } });
  }

  async findOne(id: string): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!delivery) throw new NotFoundException('Entregador não encontrado');
    return delivery;
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.deliveryRepo.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Entregador não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao remover entregador: ', error);
      throw new InternalServerErrorException('Erro interno ao remover entregador');
    }
  }
}
