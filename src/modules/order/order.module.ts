import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { LogisticsModule } from '../logistics/logistics.module';
import { Product } from '../catalog/entities/product.entity';
import { Store } from '../store/entities/store.entity';
import { PaymentModule } from '../payments/payment.module';
import { CustomerModule } from '../customer/customer.module';
import { StoreModule } from '../store/store.module';
import { CatalogModule } from '../catalog/catalog.module';
import { OrderFactory } from './factories/order.factory';
import { OrderSearchController } from './controllers/order-search.controller';
import { OrderSearchService } from './services/order-search.service';

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
  controllers: [OrderController, OrderSearchController],
  providers: [OrderService, OrderFactory, OrderSearchService],
  exports: [OrderService, OrderFactory, OrderSearchService],
})
export class OrderModule { }
