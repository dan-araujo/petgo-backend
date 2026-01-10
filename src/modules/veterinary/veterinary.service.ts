import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateVeterinaryDTO } from './dto/create-veterinary.dto';
import { UpdateVeterinaryDTO } from './dto/update-veterinary.dto';
import { BaseService } from '../../common/base/base.service';
import { Veterinary } from './entities/veterinary.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ValidationMessages } from '../../common/constants/validation-messages.constants';
import { UserType } from '../../common/enums/user-type.enum';
import { EmailVerificationServiceV2 } from '../auth/email-verification/email-verification.v2.service';
import { ApiResponse } from '../../common/interfaces/api-response.interface';

@Injectable()
export class VeterinaryService extends BaseService<Veterinary> {
  constructor(
    @InjectRepository(Veterinary)
    private readonly veterinaryRepo: Repository<Veterinary>,
    private readonly emailVerificationService: EmailVerificationServiceV2,
  ) {
    super(veterinaryRepo);
  }

  async create(data: CreateVeterinaryDTO): Promise<ApiResponse> {
    let savedVeterinary: Veterinary | null = null;
    try {
      await this.checkUnique(
        data,
        ['email', 'phone'],
        undefined,
        {
          email: ValidationMessages.EMAIL_ALREADY_EXISTS,
          phone: ValidationMessages.PHONE_ALREADY_EXISTS,
        },
      );

      const password_hash = await bcrypt.hash(data.password, 10);

      const veterinary = this.veterinaryRepo.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        category: data.category,
        password_hash,
        status: 'pending',
      });

      savedVeterinary = await this.veterinaryRepo.save(veterinary);

      await this.emailVerificationService.sendVerificationCode(
        savedVeterinary.email,
        UserType.VETERINARY,
      );

      return {
        status: 'pending_code',
        message: 'Cadastro realizado! Código de verificação enviado para seu e-mail.',
        email: savedVeterinary.email,
        data: { userId: savedVeterinary.id },
      };
    } catch (error) {
      console.error('Erro ao criar veterinário: ', error);
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      if (error instanceof BadRequestException) throw error;
      if (savedVeterinary) {
        console.warn(`Deletando veterinário ${savedVeterinary.id} por falha no e-mail`);
        await this.veterinaryRepo.delete(savedVeterinary.id);
      }

      throw new InternalServerErrorException('Erro interno ao cadastrar veterinário');
    }
  }

  async update(id: string, data: Partial<UpdateVeterinaryDTO>): Promise<Veterinary> {
    try {
      const veterinary = await this.veterinaryRepo.findOne({ where: { id } });
      if (!veterinary) throw new NotFoundException('Veterinário não encontrado');

      await this.checkUnique(
        data,
        ['email', 'phone'],
        id,
        {
          email: ValidationMessages.EMAIL_ALREADY_EXISTS,
          phone: ValidationMessages.PHONE_ALREADY_EXISTS,
        },
      );

      if ('password' in data) {
        throw new BadRequestException(
          'A senha não pode ser alterada por este endpoint. Use o fluxo de recuperação de senha.',
        );
      }

      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) delete data[key];
      });

      Object.assign(veterinary, data);
      return await this.veterinaryRepo.save(veterinary);
    } catch (error) {
      console.error('Erro ao atualizar veterinário: ', error);
      if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Erro ao atualizar veterinário');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.veterinaryRepo.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException('Veterinário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao remover clinete: ', error);
      throw new InternalServerErrorException('Erro interno ao remover cliente');
    }
  }

  async findAll(): Promise<Veterinary[]> {
    return this.veterinaryRepo.find({ where: { deleted_at: IsNull() } });
  }

  async findOne(id: string) {
    const veterinary = await this.veterinaryRepo.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!veterinary) {
      throw new NotFoundException('Veterinário não encontrado');
    }

    return veterinary;
  }
}