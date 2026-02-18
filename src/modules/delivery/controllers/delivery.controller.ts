import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, NotFoundException } from '@nestjs/common';
import { CreateDeliveryDTO } from '../dto/create-delivery.dto';
import { UpdateDeliveryDTO } from '../dto/update-delivery.dto';
import { Delivery } from '../entities/delivery.entity';
import { ApiResponse, ResponseStatus } from '../../../common/interfaces/api-response.interface';
import { DeliveryService } from '../services/delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) { }

  @Post('register')
  async create(@Body() dto: CreateDeliveryDTO): Promise<ApiResponse> {
    return await this.deliveryService.create(dto);
  }

  @Get()
  async findAll(): Promise<ApiResponse<Delivery[]>> {
    const deliveries = await this.deliveryService.findAll();
    return {
      status: ResponseStatus.SUCCESS,
      message: 'Entregadores recuperados com sucesso!',
      data: deliveries,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Partial<Delivery>>> {
    const delivery = await this.deliveryService.findOne(id);
    if (!delivery) {
      throw new NotFoundException('Entregador não encontrado');
    }

    const { passwordHash: passwordHash, ...safeDelivery } = delivery;
    return {
      status: ResponseStatus.SUCCESS,
      message: 'Entregador recuperado com sucesso!',
      data: safeDelivery,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeliveryDTO,
  ): Promise<ApiResponse<Partial<Delivery>>> {
    const updatedDelivery = await this.deliveryService.update(id, dto);
    const { passwordHash: passwordHash, ...safeDelivery } = updatedDelivery;
    return {
      status: ResponseStatus.SUCCESS,
      message: 'Entregador atualizado com sucesso!',
      data: safeDelivery,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.deliveryService.remove(id);
    return {
      status: ResponseStatus.SUCCESS,
      message: 'Entregador removido com sucesso.',
    };
  }
}