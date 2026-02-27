import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { EmailVerificationModule } from '../auth/email-verification/email-verification.module';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';
import { CustomerAddress } from './entities/customer-address.entity';
import { AddressModule } from '../address/address.module';
import { CustomerAddressService } from './services/customer-address.service';
import { CustomerAddressController } from './controllers/customer-address.controller';
import { Address } from '../address/entities/address.base.entity';
import { Pet } from '../pet/entities/pet.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Customer, CustomerAddress, Address, Pet]), 
    EmailVerificationModule,
    AddressModule,
],
    providers: [CustomerService, CustomerAddressService],
    controllers: [CustomerController, CustomerAddressController],
    exports: [CustomerService, CustomerAddressService],
})
export class CustomerModule { }
