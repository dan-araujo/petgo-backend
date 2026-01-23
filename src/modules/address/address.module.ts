import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.base.entity';
import { AddressBaseService } from './address.base.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Address])],
    providers: [AddressBaseService],
    exports: [AddressBaseService],
})
export class AddressModule { }
