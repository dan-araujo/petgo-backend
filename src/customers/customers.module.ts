import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { CustomersService } from './customers.service';

@Module({
    imports: [TypeOrmModule.forFeature([Customer])],
    providers: [CustomersService],
    controllers: [CustomersController],
    exports: [CustomersService]
})
export class CustomersModule { }
