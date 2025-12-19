import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Store } from "../../store/entities/store.entity";
import { Customer } from "../../customer/entities/customer.entity";
import { Delivery } from "../../delivery/entities/delivery.entity";
import { Veterinary } from "../../veterinary/entities/veterinary.entity";
import { UserService } from "./user.service";
import { UserRepoHelper } from "../../common/helpers/user-repo.helper";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Store, Customer, Delivery, Veterinary]),
    ],
    providers: [UserService, UserRepoHelper],
    exports: [UserService, UserRepoHelper, TypeOrmModule],
})
export class UserModule { }