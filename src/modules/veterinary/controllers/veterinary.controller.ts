import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, ParseUUIDPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateVeterinaryDTO } from '../dto/create-veterinary.dto';
import { UpdateVeterinaryDTO } from '../dto/update-veterinary.dto';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { Veterinary } from '../entities/veterinary.entity';
import { VeterinaryService } from '../services/veterinary.service';

@Controller('veterinaries')
export class VeterinaryController {
  constructor(private readonly veterinaryService: VeterinaryService) { }

  @Post('register')
  async create(@Body() dto: CreateVeterinaryDTO): Promise<ApiResponse> {
    return await this.veterinaryService.create(dto);
  }

  @Get()
  async findAll(): Promise<ApiResponse<Veterinary[]>> {
    const veterinaries = await this.veterinaryService.findAll();
    return {
      status: 'success',
      message: 'Veterinários recuperados com sucesso!',
      data: veterinaries,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponse<Partial<Veterinary>>> {
    const veterinary = await this.veterinaryService.findOne(id);
    if (!veterinary) {
      throw new NotFoundException('Veterinário não encontrado.');
    }

    const { passwordHash: passwordHash, ...safeVeterinary } = veterinary;
    return {
      status: 'success',
      message: 'Veterinário recuperado com sucesso!',
      data: safeVeterinary,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateVeterinaryDTO>,
  ): Promise<ApiResponse<Partial<Veterinary>>> {
    const updatedVeterinary = await this.veterinaryService.update(id, dto);
    const { passwordHash: passwordHash, ...safeVeterinary } = updatedVeterinary;
    return {
      status: 'success',
      message: 'Veterinário atualizado com sucesso!',
      data: safeVeterinary,
    };
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<ApiResponse<null>> {
    await this.veterinaryService.remove(id);
    return {
      status: 'success',
      message: 'Veterinário excluído com sucesso!',
    };
  }

  // TODO: Adicionar PATCH :id/profile
}
