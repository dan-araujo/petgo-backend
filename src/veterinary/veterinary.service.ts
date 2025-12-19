import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateVeterinaryDTO } from './dto/create-veterinary.dto';
import { UpdateVeterinaryDTO } from './dto/update-veterinary.dto';
import { BaseService } from '../common/base/base.service';
import { Veterinary } from './entities/veterinary.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ValidationMessages } from '../common/constants/validation-messages';
import { AuthResponse, AuthService } from '../auth/auth.service';
import { UserType } from '../common/enums/user-type.enum';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class VeterinaryService extends BaseService<Veterinary> {
  constructor(
    @InjectRepository(Veterinary)
    private readonly veterinaryRepo: Repository<Veterinary>,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super(veterinaryRepo);
  }

  async create(data: CreateVeterinaryDTO): Promise<AuthResponse> {
    let savedVeterinary: Veterinary | null = null;

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

      const password_hash = await bcrypt.hash(data.password, 10);
      const cpf = data.cpf?.trim() === '' ? null : data.cpf;

      const veterinary = this.veterinaryRepo.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: cpf as any,
        password_hash,
        status: 'pending',
      });

      savedVeterinary = await this.veterinaryRepo.save(veterinary);

      const result = await this.authService.completeUserRegistration(
        UserType.VETERINARY,
        savedVeterinary.id,
        savedVeterinary.email,
        savedVeterinary.name,
      );

      return result;
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
        ['email', 'cpf', 'phone'],
        id,
        {
          email: ValidationMessages.EMAIL_ALREADY_EXISTS,
          phone: ValidationMessages.PHONE_ALREADY_EXISTS,
          cpf: ValidationMessages.CPF_ALREADY_EXISTS,
        });

      if ('password' in data) {
        throw new BadRequestException(
          'A senha não pode ser alterada por este endpoint. Use o fluxo de recuperação de senha.',
        );
      }

      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) delete data[key];
      });

      if (data.email && data.email !== veterinary.email) {
        await this.userService.updateUserEmail(
          veterinary.id,
          veterinary.email,
          data.email,
          UserType.VETERINARY,
        );
      }

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
