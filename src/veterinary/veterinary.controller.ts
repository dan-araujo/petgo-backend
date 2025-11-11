import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, ParseUUIDPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { VeterinaryService } from './veterinary.service';
import { CreateVeterinaryDTO } from './dto/create-veterinary.dto';
import { UpdateVeterinaryDTO } from './dto/update-veterinary.dto';

@Controller('veterinaries')
export class VeterinaryController {
  constructor(private readonly veterinaryService: VeterinaryService) {}

  @Post('register')
  create(@Body() createVetDto: CreateVeterinaryDTO) {
    return this.veterinaryService.create(createVetDto);
  }

  @Get()
  findAll() {
    return this.veterinaryService.findAll();
  }

  @Get(':id')
async findOne(@Param('id') id: string) {
  const veterinary = await this.veterinaryService.findOne(id);
  if (!veterinary) {
    throw new NotFoundException('Veterinário não encontrado');
  }
  const { password_hash, verification_code, ...safeVeterinary } = veterinary;
  return safeVeterinary;
}

  @Patch(':id')
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  async update(@Param('id') id: string, @Body() data: Partial<UpdateVeterinaryDTO>) {
    const updated = await this.veterinaryService.update(id, data);
    const { password_hash, verification_code, ...safeVeterinary } = updated;
    return { message: 'Veterinário atualizado com sucesso!', veterinary: safeVeterinary };
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.veterinaryService.remove(id);
    return { message: 'Veterinário excluído com sucesso!' }
  }
}
