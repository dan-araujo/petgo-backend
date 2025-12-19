import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerService } from './customer.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../modules/user/user.module';

@Module({
    imports:
        [TypeOrmModule.forFeature([Customer]), 
        AuthModule,
        UserModule,
    ],
    providers: [CustomerService],
    controllers: [CustomerController],
    exports: [CustomerService]
})
export class CustomerModule { }
