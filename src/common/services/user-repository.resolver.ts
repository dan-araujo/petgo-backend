import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "../../modules/store/entities/store.entity";
import { Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Customer } from "../../modules/customer/entities/customer.entity";
import { Delivery } from "../../modules/delivery/entities/delivery.entity";
import { Veterinary } from "../../modules/veterinary/entities/veterinary.entity";
import { UserType } from "../enums/user-type.enum";

@Injectable()
export class UserReposityResolver {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,
        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,
        @InjectRepository(Delivery)
        private readonly deliveryRepo: Repository<Delivery>,
        @InjectRepository(Veterinary)
        private readonly veterinaryRepo: Repository<Veterinary>,
    ) { }

    resolve(type: UserType): Repository<any> {
        const repositories: Record<UserType, Repository<any>> = {
            [UserType.STORE]: this.storeRepo,
            [UserType.CUSTOMER]: this.customerRepo,
            [UserType.DELIVERY]: this.deliveryRepo,
            [UserType.VETERINARY]: this.veterinaryRepo,
        };

        const repository = repositories[type];

        if(!repository) {
            throw new BadRequestException('Tipo de usuário inválido');
        }

        return repository;
    }
}
