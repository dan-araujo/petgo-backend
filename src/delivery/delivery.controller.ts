import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDTO } from './dto/create-delivery.dto';
import { UpdateDeliveryDTO } from './dto/update-delivery.dto';
import { Delivery } from './entities/delivery.entity';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) { }

  @Post('register')
  async create(@Body() dto: CreateDeliveryDTO): Promise<{ message: string; delivery: Partial<Delivery> }> {
    const newDelivery = await this.deliveryService.create(dto);
    const { password_hash, verification_code, ...safeDelivery } = newDelivery;

    return {
      message: 'Entregador cadastro com sucesso!',
      delivery: safeDelivery,
    };
  }

  @Get()
  async findAll(): Promise<Delivery[]> {
    return this.deliveryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Delivery> {
    return this.deliveryService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDeliveryDTO): Promise<Delivery> {
    return this.deliveryService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.deliveryService.remove(id);
    return { message: 'Entregador removido com sucesso.' }
  }
}
