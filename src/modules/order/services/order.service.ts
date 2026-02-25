import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDTO } from '../dto/create-order.dto';
import { Order } from '../entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Address } from '../../address/entities/address.base.entity';
import { DataSource } from 'typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { Store } from '../../store/entities/store.entity';
import { DeliveryType } from '../../../common/enums/delivery-type.enum';
import { UserType } from '../../../common/enums/user-type.enum';
import { ORDER_TRANSITION_RULES } from '../../../common/constants/order-transitions.constant';
import { PaymentService } from '../../payments/payment.service';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { OrderStatusLabels } from '../../../common/constants/order-status-labels.constant';
import { LogisticsCalculatorService } from '../../logistics/services/logistics-calculator.service';
import { CustomerAddressService } from '../../customer/services/customer-address.service';
import { StoreAddressService } from '../../store/services/store-address.service';
import { ProductService } from '../../catalog/services/product.service';
import { OrderFactory } from '../factories/order.factory';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Store)
    private storeRepo: Repository<Store>,
    private readonly customerAddressService: CustomerAddressService,
    private readonly storeAddressService: StoreAddressService,
    private readonly productService: ProductService,
    private readonly logisticsCalculator: LogisticsCalculatorService,
    private readonly paymentService: PaymentService,
    private readonly dataSource: DataSource,
    private readonly orderFactory: OrderFactory,
  ) { }

  async create(customerId: string, dto: CreateOrderDTO) {
    const store = await this.storeRepo.findOne({ where: { id: dto.storeId } });
    if (!store) throw new BadRequestException('Loja não encontrada.');

    const customerAddress = await this.customerAddressService.getDeliveryAddress(customerId, dto.deliveryAddressId);
    const storeAddress = await this.storeAddressService.getStoreAddress(dto.storeId);
    const products = await this.productService.getStoreProducts(dto.items, dto.storeId);
    const { orderItems, productsTotal } = this.orderFactory.buildOrderItems(dto.items, products);
    const logistics = await this.logisticsCalculator.calculateLogistics(store, storeAddress, customerAddress, productsTotal);

    return this.persistOrder(customerId, dto.storeId, {
      deliveryAddress: customerAddress,
      orderItems,
      subtotal: productsTotal,
      deliveryFee: logistics.deliveryFee,
      deliveryType: logistics.deliveryType,
      distanceKm: logistics.distanceKm
    });
  }

  async findAll(userId: string, userType: UserType, statusFilter?: OrderStatus[]): Promise<Order[]> {
    let whereConditions: any = {};

    if (userType === UserType.STORE) {
      whereConditions.storeId = userId;
    } else if (userType === UserType.DELIVERY) {
      whereConditions.deliveryId = userId;
    } else {
      whereConditions.customerId = userId;
    }

    if (statusFilter && statusFilter.length > 0) {
      whereConditions['status'] = In(statusFilter);
    }

    return this.orderRepo.find({
      where: whereConditions,
      relations: ['items', 'store', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'store', 'customer'],
    });

    if (!order) throw new NotFoundException('Pedido não encontrado.');
    if (order.customerId !== userId && order.storeId !== userId && order.deliveryId !== userId) {
      throw new ForbiddenException('Você não tem permissão para ver este pedido.');
    }
    if (order.customerId !== userId) {
      delete order.deliveryCode;
    }

    return order;
  }

  async updateStatus(
    id: string, userId: string,
    userType: UserType,
    newStatus: OrderStatus,
    providedCode?: string,
  ): Promise<Order> {
    const order = await this.findOne(id, userId);
    const allowedStatus = ORDER_TRANSITION_RULES[order.status];

    if (userType === UserType.CUSTOMER && newStatus !== OrderStatus.CANCELLED) {
      throw new ForbiddenException('O cliente não possui permissão para finalizar ou alterar este status. Apenas o cancelamento é permitido.');
    }

    if (!allowedStatus || !allowedStatus.includes(newStatus)) {
      throw new BadRequestException(`Transição inválida de ${OrderStatusLabels[order.status]} para ${OrderStatusLabels[newStatus]}.`);
    }

    if (newStatus === OrderStatus.DELIVERED) {
      if (!providedCode || providedCode !== order.deliveryCode) {
        throw new BadRequestException('Código de confirmação inválido. Solicite o código de 4 digitos ao cliente para finalizar a entrega.');
      }
    }

    if (userType === UserType.STORE && order.deliveryType === DeliveryType.APP_PARTNER) {
      const forbiddenForStore = [OrderStatus.IN_DELIVERY, OrderStatus.DELIVERED];
      if (forbiddenForStore.includes(newStatus)) {
        throw new ForbiddenException('Apenas o entregador parceiro pode atualizar o status de entrega.');
      }
    }

    if (userType === UserType.DELIVERY) {
      const allowedForDelivery = [OrderStatus.IN_DELIVERY, OrderStatus.DELIVERED];
      if (!allowedForDelivery.includes(newStatus)) {
        throw new ForbiddenException('Entregadores só podem atualizar saídas e entregas.');
      }
    }

    order.status = newStatus;
    return this.orderRepo.save(order);
  }

  async acceptOrder(id: string, deliveryId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pedido não encontrado.');
    if (order.deliveryType !== DeliveryType.APP_PARTNER) {
      throw new BadRequestException('Este pedido não utiliza entregadores parceiros.');
    }
    if (order.deliveryId) {
      throw new BadRequestException('Esta corrida já foi aceita por outro entregador.');
    }

    const acceptableStatus = [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP];
    if (!acceptableStatus.includes(order.status)) {
      throw new BadRequestException(`Você não pode aceitar um pedido com status ${OrderStatusLabels[order.status]}`);
    }

    order.deliveryId = deliveryId;

    return this.orderRepo.save(order);
  }

  async cancel(id: string, userId: string): Promise<Order> {
    const order = await this.findOne(id, userId);
    const cancellableStatus = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY_FOR_PICKUP
    ];
    if (!cancellableStatus.includes(order.status)) {
      throw new BadRequestException('O pedido já saiu para entrega ou foi finalizado e não pode ser cancelado.');
    }

    if (order.paymentTransactionId && order.paymentStatus === PaymentStatus.PAID) {
      await this.paymentService.refund(order.paymentTransactionId);
      order.paymentStatus = PaymentStatus.REFUNDED;
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }

  private async persistOrder(
    customerId: string,
    storeId: string,
    data: {
      deliveryAddress: Address,
      orderItems: OrderItem[],
      subtotal: number,
      deliveryFee: number,
      deliveryType: DeliveryType,
      total?: number,
      distanceKm: number,
    }) {
    return this.dataSource.transaction(async (manager) => {
      const finalDeliveryFee = Number(data.deliveryFee.toFixed(2));
      const finalSubtotal = Number(data.subtotal.toFixed(2));
      const finalTotal = Number((finalSubtotal + finalDeliveryFee).toFixed(2));
      const secretCode = Math.floor(1000 + Math.random() * 9000).toString();

      const order = manager.create(Order, {
        customerId: customerId,
        storeId: storeId,
        status: OrderStatus.PENDING,
        deliveryType: data.deliveryType,
        deliveryCode: secretCode,
        subtotal: finalSubtotal,
        deliveryFee: finalDeliveryFee,
        total: finalTotal,
        deliveryAddress: `${data.deliveryAddress.street}, ${data.deliveryAddress.number} - ${data.deliveryAddress.city}`,
        deliveryStreet: data.deliveryAddress.street,
        deliveryNumber: data.deliveryAddress.number,
        deliveryCity: data.deliveryAddress.city,
        deliveryNeighborhood: data.deliveryAddress.neighborhood,
        deliveryZipCode: data.deliveryAddress.zipCode,
        deliveryLatitude: Number(data.deliveryAddress.latitude),
        deliveryLongitude: Number(data.deliveryAddress.longitude),
      });

      const savedOrder = await manager.save(order);

      for (const item of data.orderItems) {
        item.order = savedOrder;
      }

      await manager.save(data.orderItems);

      return {
        ...savedOrder,
        items: data.orderItems,
        distanceKm: data.distanceKm.toFixed(2),
        subtotal: finalSubtotal,
        deliveryFee: finalDeliveryFee,
        total: finalTotal
      };
    });
  }
}
