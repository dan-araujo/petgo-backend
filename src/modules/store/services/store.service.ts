import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateStoreDTO } from '../dto/create-store.dto';
import { UpdateStoreDTO } from '../dto/update-store.dto';
import { Store } from '../entities/store.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BaseService } from '../../../common/base/base.service';
import { ValidationMessages } from '../../../common/constants/validation-messages.constants';
import { UserType } from '../../../common/enums/user-type.enum';
import { EmailVerificationServiceV2 } from '../../auth/email-verification/email-verification.v2.service';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { AccountStatus } from '../../../common/enums/account-status.enum';
import { SelectStoreTypeDTO } from '../dto/select-store-type.dto';
import { StoreType } from '../../../common/enums/store-type.enum';
import { ManageBusinessHoursDTO } from '../dto/business-hours.dto';
import { StoreBusinessHours } from '../entities/store-business-hour.entity';
import { CreateSpecialHourDTO } from '../dto/special-hours.dto';
import { StoreSpecialHours } from '../entities/store-special-hour.entity';

@Injectable()
export class StoreService extends BaseService<Store> {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    private readonly emailVerificationService: EmailVerificationServiceV2,
  ) {
    super(storeRepo);
  }

  async create(data: CreateStoreDTO): Promise<ApiResponse> {
    let savedStore: Store | null = null;
    try {
      await this.checkUnique(
        data,
        ['email', 'cnpj', 'phone'],
        undefined,
        {
          email: ValidationMessages.EMAIL_ALREADY_EXISTS,
          cnpj: ValidationMessages.CNPJ_ALREADY_EXISTS,
          phone: ValidationMessages.PHONE_ALREADY_EXISTS,
        },
      );

      const password_hash = await this.hashPassword(data.password);

      const store = this.storeRepo.create({
        name: data.name,
        email: data.email,
        password_hash,
        phone: data.phone,
        cnpj: data.cnpj,
        status: AccountStatus.PENDING,
      });

      savedStore = await this.storeRepo.save(store);

      await this.emailVerificationService.sendVerificationCode(
        savedStore.email,
        UserType.STORE,
      );

      return {
        status: 'pending_code',
        message: 'Cadastro realizado! Código de verificação enviado para seu e-mail.',
        email: savedStore.email,
        data: { userId: savedStore.id },
      };
    } catch (error) {
      console.error('Erro ao criar loja: ', error);
      if (savedStore) {
        console.warn(`Deletando loja ${savedStore.id} por falha no e-mail`);
        await this.storeRepo.delete(savedStore.id);
      }

      if (error instanceof ConflictException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Erro interno ao cadastrar loja.');
    }
  }

  async selectStoreType(storeId: string, dto: SelectStoreTypeDTO): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });

    if (!store) throw new NotFoundException('Loja não encontrada');

    store.store_type = dto.store_type;
    store.profile_completed = true;

    return await this.storeRepo.save(store);
  }

  async update(id: string, data: UpdateStoreDTO): Promise<Store> {
    try {
      const store = await this.storeRepo.findOne({ where: { id } });
      if (!store) throw new NotFoundException('Loja não encontrada.');

      await this.checkUnique(data, ['email', 'cnpj', 'phone'], id, {
        email: ValidationMessages.EMAIL_ALREADY_EXISTS,
        cnpj: ValidationMessages.CNPJ_ALREADY_EXISTS,
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

      Object.assign(store, data);
      return this.storeRepo.save(store);
    } catch (error) {
      console.error('Erro ao atualizar loja: ', error);
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Erro interno ao atualizar loja');
    }
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepo.find({ where: { deleted_at: IsNull() } });
  }

  async findOne(id: string) {
    const store = await this.storeRepo.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['business_hours', 'special_hours'],
    });
    if (!store) {
      throw new NotFoundException('Loja não encontrada');
    }

    return store;
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.storeRepo.softDelete(id);
      if (result.affected === 0) throw new NotFoundException('Loja não encontrada.');
    } catch (error) {
      console.error('Erro ao remover loja: ', error);
      throw new InternalServerErrorException('Erro interno ao remover loja');
    }
  }

  async updateBusinessHours(storeId: string, dto: ManageBusinessHoursDTO) {
    const store = await this.findOne(storeId);

    for (const hourDTO of dto.hours) {
      if(!hourDTO.is_closed && hourDTO.opens_at >= hourDTO.closes_at) {
        throw new BadRequestException(
          `No dia ${hourDTO.day_of_week}, o horário de abertura (${hourDTO.opens_at}) deve ser menor que o horário de fechamento (${hourDTO.closes_at}).`,
        );
      }

      const existingHour = await this.storeRepo.manager.findOne(StoreBusinessHours, {
        where: {
          store_id: store.id, day_of_week: hourDTO.day_of_week },
      });

      if (existingHour) {
        Object.assign(existingHour, hourDTO);
        await this.storeRepo.manager.save(existingHour);
      } else {
        const newHour = this.storeRepo.manager.create(StoreBusinessHours, {
          ...hourDTO,
          store: store,
        });
        await this.storeRepo.manager.save(newHour);
      }
    }

    return { message: 'Horários de funcionamento atualizados com sucesso!' };
  }

  async findBusinessHours(storeId: string): Promise<StoreBusinessHours[]> {
    return await this.storeRepo.manager.find(StoreBusinessHours, {
      where: { store_id: storeId },
      order: { day_of_week: 'ASC' },
    });
  }

  async resetBusinessHours(storeId: string) {
    await this.storeRepo.manager.delete(StoreBusinessHours, { store_id: storeId });
    return { message: 'Horários de funcionamento reiniciados com sucesso!' };
  }

  async updateSpecialHours(storeId: string, dto: CreateSpecialHourDTO) {
    const store = await this.findOne(storeId);

    if(!dto.is_closed && dto.opens_at >= dto.closes_at) {
        throw new BadRequestException(
          `O horário de abertura deve ser menor que o de fechamento`);
      }

    let specialHour = await this.storeRepo.manager.findOne(StoreSpecialHours, {
      where: { store_id: store.id, specific_date: dto.specific_date }
    });

    if (specialHour) {
      Object.assign(specialHour, dto);
    } else {
      specialHour = this.storeRepo.manager.create(StoreSpecialHours, {
        ...dto,
        store: store,
      });
    }

    return await this.storeRepo.manager.save(specialHour);
  }

  async findAllSpecialHours(storeId: string): Promise<StoreSpecialHours[]> {
    return await this.storeRepo.manager.find(StoreSpecialHours, {
      where: { store_id: storeId },
      order: { specific_date: 'ASC' },
    });
  }

  async removeSpecialHour(storeId: string, specialHourId: string) {
    const specialHour = await this.storeRepo.manager.findOne(StoreSpecialHours, {
      where: { id: specialHourId, store_id: storeId }
    });

    if (!specialHour) throw new NotFoundException('Horário especial não encontrado.');

    await this.storeRepo.manager.remove(specialHour);

    return { message: 'Horário especial removido com sucesso!' };
  }
}