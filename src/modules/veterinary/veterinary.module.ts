import { Module } from '@nestjs/common';
import { VeterinaryController } from './controllers/veterinary.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Veterinary } from './entities/veterinary.entity';
import { EmailVerificationModule } from '../auth/email-verification/email-verification.module';
import { VeterinaryService } from './services/veterinary.service';
import { VeterinaryAddressService } from './services/veterinary-address.service';
import { VeterinaryAddressController } from './controllers/veterinary-address.controller';
import { VeterinaryAddress } from './entities/veterinary-address.entity';
import { Address } from '../address/entities/address.base.entity';
import { AddressModule } from '../address/address.module';

@Module({
  imports: [TypeOrmModule.forFeature([Veterinary, VeterinaryAddress, Address]),
    EmailVerificationModule,
    AddressModule
  ],
  providers: [VeterinaryService, VeterinaryAddressService],
  controllers: [VeterinaryController, VeterinaryAddressController],
  exports: [VeterinaryService]
})
export class VeterinaryModule { }
