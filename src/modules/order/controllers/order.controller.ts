import { Controller, Get, Post, Body, Patch, Param, ValidationPipe, UseGuards, ParseUUIDPipe, Query, ForbiddenException } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDTO } from '../dto/create-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { OrderStatusLabels } from '../../../common/constants/order-status-labels.constant';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { ResponseStatus } from '../../../common/interfaces/api-response.interface';
import { User } from '../../../common/decorators/user.decorator';
import { UserType } from '../../../common/enums';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  create(@User('id') userId: string, @Body(ValidationPipe) dto: CreateOrderDTO) {
    return this.orderService.create(userId, dto);
  }

  @Get()
  findAll(
    @User('id') userId: string,
    @User('userType') userType: UserType,
    @Query('status') status?: string
  ) {
    const statusFilter = status
      ? status.split(',').map(status => status.trim().toUpperCase() as OrderStatus)
      : undefined;
    return this.orderService.findAll(userId, userType, statusFilter);
  }

  @Get(':id')
  findOne(@User('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.findOneMasked(id, userId);
  }

  @Patch(':id/status')
  async update(
    @User('id') userId: string,
    @User('userType') userType: UserType,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: OrderStatus,
    @Body('deliveryCode') deliveryCode?: string,
  ) {
    const order = await this.orderService.updateStatus(id, userId, userType, status, deliveryCode);
    const translatedStatus = OrderStatusLabels[order.status];

    return {
      status: ResponseStatus.SUCCESS,
      message: `O status do pedido foi atualizado para ${translatedStatus}`,
      data: {
        id: order.id,
        newStatus: order.status,
        updatedAt: order.updatedAt
      }
    };
  }

  @Patch(':id/accept')
  async acceptOrder(
    @User('id') userId: string,
    @User('userType') userType: UserType,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    if (userType !== UserType.DELIVERY) {
      throw new ForbiddenException('Apenas entregadores parceiros podem aceitar corridas.');
    }

    const order = await this.orderService.acceptOrder(id, userId);

    return {
      status: ResponseStatus.SUCCESS,
      message: 'Corrida aceita com sucesso! Dirija-se à loja',
      data: {
        id: order.id,
        status: order.status,
        deliveryId: order.deliveryId
      }
    };
  }

  @Patch(':id/cancel')
  async cancel(@User('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    const order = await this.orderService.cancel(id, userId);
    const message = order.paymentStatus === PaymentStatus.REFUNDED
      ? 'Pedido cancelado e estorno do pagamento solicitado com sucesso.'
      : 'Pedido cancelado com sucesso.';

    return {
      status: ResponseStatus.SUCCESS,
      message: message,
      data: {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    };
  }
}
