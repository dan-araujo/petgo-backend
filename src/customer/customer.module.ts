import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerService } from './customer.service';

@Module({
    imports: [TypeOrmModule.forFeature([Customer])],
    providers: [CustomerService],
    controllers: [CustomerController],
    exports: [CustomerService]
})
export class CustomerModule { }
