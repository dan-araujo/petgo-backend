import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreService } from './services/store.service';
import { Store } from './entities/store.entity';
import { EmailVerificationModule } from '../auth/email-verification/email-verification.module';
import { StoreController } from './controllers/store.controller';
import { StoreAddress } from './entities/store-address.entity';
import { Address } from '../address/entities/address.base.entity';
import { AddressModule } from '../address/address.module';
import { StoreAddressController } from './controllers/store-address.controller';
import { StoreAddressService } from './services/store-address.service';
import { StoreBusinessHours } from './entities/store-business-hour.entity';
import { StoreSpecialHours } from './entities/store-special-hour.entity';
import { Petshop } from './entities/petshop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Store, 
    StoreAddress, 
    Address,
    StoreBusinessHours,
    StoreSpecialHours,
    Petshop,
  ]),
    EmailVerificationModule,
    AddressModule,
  ],
  controllers: [StoreController, StoreAddressController],
  providers: [StoreService, StoreAddressService],
  exports: [StoreService],
})
export class StoreModule { }

