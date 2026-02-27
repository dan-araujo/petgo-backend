import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ValidationPipe } from '@nestjs/common';
import { PetService } from './pet.service';
import { CreatePetDTO } from './dto/create-pet.dto';
import { UpdatePetDTO } from './dto/update-pet.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Pets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) { }

  @Post()
  create(@User('id') customerId: string, @Body(ValidationPipe) dto: CreatePetDTO) {
    return this.petService.create(customerId, dto);
  }

  @Get()
  findAll(@User('id') customerId: string,) {
    return this.petService.findAllByCustomer(customerId);
  }

  @Get(':id')
  findOne(@User('id') customerId: string, @Param('id') id: string) {
    return this.petService.findOne(id, customerId);
  }

  @Patch(':id')
  update(@User('id') customerId: string, @Param('id') id: string, @Body(ValidationPipe) dto: UpdatePetDTO) {
    return this.petService.update(id, customerId, dto);
  }

  @Delete(':id')
  remove(@User('id') customerId: string, @Param('id') id: string) {
    return this.petService.remove(id, customerId);
  }
}
