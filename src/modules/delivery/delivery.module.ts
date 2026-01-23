import { Module } from '@nestjs/common';
import { DeliveryController } from './controllers/delivery.controller';
import { Delivery } from './entities/delivery.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationModule } from '../auth/email-verification/email-verification.module';
import { DeliveryAddress } from './entities/delivery-address.entity';
import { Address } from '../address/entities/address.base.entity';
import { AddressModule } from '../address/address.module';
import { DeliveryAddressController } from './controllers/delivery-address.controller';
import { DeliveryAddressService } from './services/delivery-address.service';
import { DeliveryService } from './services/delivery.service';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, DeliveryAddress, Address]), 
  EmailVerificationModule,
  AddressModule,
],
  controllers: [DeliveryController, DeliveryAddressController],
  providers: [DeliveryService, DeliveryAddressService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
