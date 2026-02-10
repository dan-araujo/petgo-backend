import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDTO } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../address/entities/address.base.entity';
import { DataSource } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { Store } from '../store/entities/store.entity';
import { DeliveryType } from '../../common/enums/delivery-type.enum';
import { UserType } from '../../common/enums/user-type.enum';
import { ORDER_TRANSITION_RULES } from '../../common/constants/order-transitions.constant';
import { PaymentService } from '../payments/payment.service';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { OrderStatusLabels } from '../../common/constants/order-status-labels.constant';
import { LogisticsCalculatorService } from '../logistics/services/logistics-calculator.service';
import { CustomerAddressService } from '../customer/services/customer-address.service';
import { StoreAddressService } from '../store/services/store-address.service';
import { ProductService } from '../catalog/services/product.service';
import { OrderFactory } from './factories/order.factory';

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

  async findAll(userId: string, userType: UserType): Promise<Order[]> {
    const whereConditions = userType === UserType.STORE
      ? { storeId: userId }
      : { customerId: userId };

    return this.orderRepo.find({
      where: whereConditions,
      relations: ['items', 'store'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'store', 'customer'],
    });

    if (!order) throw new NotFoundException('Pedido não encontrado.');
    if (order.customerId !== userId && order.storeId !== userId) {
      throw new ForbiddenException('Você não tem permissão para ver este pedido.');
    }

    return order;
  }

  async updateStatus(id: string, userId: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.findOne(id, userId);
    const allowedStatus = ORDER_TRANSITION_RULES[order.status];
    const statusAtual = OrderStatusLabels[order.status];

    if (!allowedStatus || !allowedStatus.includes(newStatus)) {
      const opcoesValidas = allowedStatus
        .map((status) => OrderStatusLabels[status])
        .join('ou');

      throw new BadRequestException(`Ação inválida. O pedido está em '${statusAtual}' e só pode mudar para '${opcoesValidas || 'Nenhum'}.`);
    }

    order.status = newStatus;
    return this.orderRepo.save(order);
  }

  async cancel(id: string, userId: string): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('O pedido já saiu para entrega ou foi finalizado.');
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

      const order = manager.create(Order, {
        customerId: customerId,
        storeId: storeId,
        status: OrderStatus.PENDING,
        deliveryType: data.deliveryType,
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
