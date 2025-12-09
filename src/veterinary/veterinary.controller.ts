import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, ParseUUIDPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { VeterinaryService } from './veterinary.service';
import { CreateVeterinaryDTO } from './dto/create-veterinary.dto';
import { UpdateVeterinaryDTO } from './dto/update-veterinary.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { Veterinary } from './entities/veterinary.entity';

@Controller('veterinaries')
export class VeterinaryController {
  constructor(private readonly veterinaryService: VeterinaryService) { }

  @Post('register')
  async create(@Body() dto: CreateVeterinaryDTO): Promise<ApiResponse<Partial<Veterinary>>> {
    const newVeterinary = await this.veterinaryService.create(dto);
    const { password_hash, verification_code, ...safeVeterinary } = newVeterinary;
    return {
      message: 'Veterinário cadastrado com sucesso!',
      data: safeVeterinary,
    };
  }

  @Get()
  async findAll(): Promise<Veterinary[]> {
    return this.veterinaryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const veterinary = await this.veterinaryService.findOne(id);
    if (!veterinary) {
      throw new NotFoundException('Veterinário não encontrado.');
    }
    const { password_hash, verification_code, ...safeVeterinary } = veterinary;
    return { data: safeVeterinary }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  async update(@Param('id') id: string, @Body() dto: Partial<UpdateVeterinaryDTO>):
    Promise<ApiResponse<Partial<Veterinary>>> {
    const updatedVeterinary = await this.veterinaryService.update(id, dto);
    const { password_hash, verification_code, ...safeVeterinary } = updatedVeterinary;
    return {
      message: 'Veterinário atualizado com sucesso!',
      data: safeVeterinary
    };
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe) id: string): Promise<ApiResponse<void>> {
    await this.veterinaryService.remove(id);
    return {
      message: 'Veterinário excluído com sucesso!',
    };
  }
}
