import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, NotFoundException } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDTO } from './dto/create-delivery.dto';
import { UpdateDeliveryDTO } from './dto/update-delivery.dto';
import { Delivery } from './entities/delivery.entity';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { AuthResponse } from '../auth/auth.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) { }

  @Post('register')
  async create(@Body() dto: CreateDeliveryDTO): Promise<AuthResponse> {
    return await this.deliveryService.create(dto);
  }

  @Get()
  async findAll(): Promise<Delivery[]> {
    return this.deliveryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const delivery = await this.deliveryService.findOne(id);
    if (!delivery) {
      throw new NotFoundException('Entregador não encontrado');
    }
    const { password_hash, verification_code, ...safeDelivery } = delivery;
    return { data: safeDelivery }
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDeliveryDTO):
    Promise<ApiResponse<Partial<Delivery>>> {
    const updatedDelivery = await this.deliveryService.update(id, dto);
    const { password_hash, verification_code, ...safeDelivery } = updatedDelivery;
    return {
      message: 'Entregador atualizado com sucesso!',
      data: safeDelivery,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    await this.deliveryService.remove(id);
    return { message: 'Entregador removido com sucesso.' }
  }
}