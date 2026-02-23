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
import { StoreHoursService } from './services/store-hours.service';
import { LogisticsModule } from '../logistics/logistics.module';
import { StoreHoursController } from './controllers/store-hours.controller';
import { GeolocationService } from '../logistics/services/geolocation.service';
import { StoreUploadController } from './controllers/store-upload.controller';
import { CloudinaryModule } from '../../shared/cloudinary/cloudinary.module';
import { StoreOnboardingController } from './controllers/store-onboarding.controller';
import { StoreOnboardingService } from './services/store-onboarding.service';
import { PetSupply } from './entities/pet-supply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Store,
    StoreAddress,
    Address,
    StoreBusinessHours,
    StoreSpecialHours,
    Petshop,
    PetSupply,
  ]),
    EmailVerificationModule,
    AddressModule,
    LogisticsModule,
    CloudinaryModule,
  ],
  controllers: [
    StoreController, 
    StoreAddressController, 
    StoreHoursController, 
    StoreUploadController,
    StoreOnboardingController
  ],
  providers: [
    StoreService, 
    StoreAddressService, 
    StoreHoursService, 
    StoreOnboardingService,
    GeolocationService
  ],
  exports: [StoreService, StoreAddressService, StoreHoursService],
})
export class StoreModule { }

