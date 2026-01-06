import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "../modules/customer/entities/customer.entity";
import { Delivery } from "../modules/delivery/entities/delivery.entity";
import { Store } from "../modules/store/entities/store.entity";
import { Veterinary } from "../modules/veterinary/entities/veterinary.entity";
import { UserReposityResolver } from "./services/user-repository.resolver";

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, Delivery, Store, Veterinary]),
  ],
  providers: [UserReposityResolver],
  exports: [UserReposityResolver],
})
export class CommonModule {}
