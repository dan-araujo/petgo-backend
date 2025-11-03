import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDeliveryDTO } from './dto/create-delivery.dto';
import { UpdateDeliveryDTO } from './dto/update-delivery.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { IsNull, Repository } from 'typeorm';
import { BaseService } from '../common/base/base.service';
import { ValidationMessages } from '../common/constants/validation-messages';

@Injectable()
export class DeliveryService extends BaseService<Delivery> {

  constructor(@InjectRepository(Delivery) private readonly deliveryRepo: Repository<Delivery>) {
    super(deliveryRepo);
  }

  async create(data: CreateDeliveryDTO): Promise<Delivery> {
    try {
      await this.checkUnique(
        data,
        ['email', 'cpf', 'phone'],
        undefined,
        {
          email: ValidationMessages.EMAIL_ALREADY_EXISTS,
          cpf: ValidationMessages.CPF_ALREADY_EXISTS,
          phone: ValidationMessages.PHONE_ALREADY_EXISTS
        });

      const password_hash = await this.hashPassword(data.password);
      const cpf = data.cpf?.trim() === '' ? null : data.cpf;
      const delivery = this.deliveryRepo.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: cpf as any,
        password_hash,
        role: 'delivery',
        status: 'pending',
      });

      return await this.deliveryRepo.save(delivery);
    } catch (error) {
      console.error('Erro ao criar entregador: ', error);
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Erro interno ao cadastrar entregador.');
    }
  }

  async update(id: string, data: UpdateDeliveryDTO): Promise<Delivery> {
    try {
      const delivery = await this.deliveryRepo.findOne({ where: { id } });

      if (!delivery) throw new NotFoundException('Entregador não encontrado.');

      await this.checkUnique(
        data,
        ['email', 'cpf', 'phone'],
        id,
        {
          email: ValidationMessages.EMAIL_ALREADY_EXISTS,
          cpf: ValidationMessages.CPF_ALREADY_EXISTS,
          phone: ValidationMessages.PHONE_ALREADY_EXISTS
        });

      if ('password' in data) {
        throw new BadRequestException(
          'A senha não pode ser alterada por este endpoint. Use o fluxo de recuperação de senha.',
        );
      }

      Object.assign(delivery, data);

      return this.deliveryRepo.save(delivery);
    } catch (error) {
      console.error('Erro ao atualizar entregador: ', error);
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Erro interno ao atualizar entregador');
    }
  }

  async findAll(): Promise<Delivery[]> {
    return this.deliveryRepo.find({ where: { deleted_at: IsNull() } });
  }

  async findOne(id: string) {
    const delivery = await this.deliveryRepo.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!delivery) throw new NotFoundException('Entregador não encontrado');

    return delivery;
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.deliveryRepo.softDelete(id);

      if (result.affected === 0) throw new NotFoundException('Entregador não encontrado.');
    } catch (error) {
      console.error('Erro ao remover entregador: ', error);
      throw new InternalServerErrorException('Erro interno ao remover entregador');
    }
  }
}
