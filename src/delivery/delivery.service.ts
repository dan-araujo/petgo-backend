import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDeliveryDTO } from './dto/create-delivery.dto';
import { UpdateDeliveryDTO } from './dto/update-delivery.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { IsNull, Repository } from 'typeorm';
import { BaseService } from '../common/base/base.service';
import { ValidationMessages } from '../common/constants/validation-messages';
import { AuthResponse, AuthService } from '../auth/auth.service';
import { UserType } from '../common/enums/user-type.enum';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class DeliveryService extends BaseService<Delivery> {

  constructor(
    @InjectRepository(Delivery) 
    private readonly deliveryRepo: Repository<Delivery>, 
    private authService: AuthService,
    private userService: UserService,
  ) {
    super(deliveryRepo);
  }

  async create(data: CreateDeliveryDTO): Promise<AuthResponse> {
    let savedDelivery: Delivery | null = null;

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
        status: 'pending',
      });

      savedDelivery = await this.deliveryRepo.save(delivery);

      const result = await this.authService.completeUserRegistration(
        UserType.DELIVERY,
        savedDelivery.id,
        savedDelivery.email,
        savedDelivery.name,
      );

      return result;
    } catch (error) {
      console.error('Erro ao criar entregador: ', error);

      if(savedDelivery) {
        console.warn(`Deletando entregador ${savedDelivery.id} por falha no e-mail`);
        await this.deliveryRepo.delete(savedDelivery.id);
      }
      if (error instanceof ConflictException) throw error;
      if(error instanceof BadRequestException) throw error;
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

      if (data.email && data.email !== delivery.email) {
                await this.userService.updateUserEmail(
                    delivery.id,
                    delivery.email,
                    data.email,
                    UserType.DELIVERY,
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
