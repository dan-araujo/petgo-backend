import { Controller, Get, Post, Body, Patch, Param, Req, ValidationPipe, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrderStatusLabels } from '../../common/constants/order-status-labels.constant';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { ResponseStatus } from '../../common/interfaces/api-response.interface';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  create(@Req() req: any, @Body(ValidationPipe) dto: CreateOrderDTO) {
    return this.orderService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.orderService.findAll(req.user.id, req.user.userType);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.findOne(id, req.user.id);
  }

  @Patch(':id/status')
  async update(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body('status') status: OrderStatus) {
    const order = await this.orderService.updateStatus(id, req.user.id, status);
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

  @Patch(':id/cancel')
  async remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const order = await this.orderService.cancel(id, req.user.id);
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
