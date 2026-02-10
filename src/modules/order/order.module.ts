import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { LogisticsModule } from '../logistics/logistics.module';
import { Product } from '../catalog/entities/product.entity';
import { Store } from '../store/entities/store.entity';
import { Address } from '../address/entities/address.base.entity';
import { StoreAddress } from '../store/entities/store-address.entity';
import { PaymentModule } from '../payments/payment.module';
import { CustomerModule } from '../customer/customer.module';
import { StoreModule } from '../store/store.module';
import { CatalogModule } from '../catalog/catalog.module';
import { OrderFactory } from './factories/order.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      Store,
    ]),
    LogisticsModule,
    PaymentModule,
    CustomerModule,
    StoreModule,
    CatalogModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderFactory],
})
export class OrderModule { }
