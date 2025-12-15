import { Repository } from "typeorm";
import { Store } from "../../store/entities/store.entity";
import { Customer } from "../../customer/entities/customer.entity";
import { Delivery } from "../../delivery/entities/delivery.entity";
import { Veterinary } from "../../veterinary/entities/veterinary.entity";

export type UserType = 'store' | 'customer' | 'delivery' | 'veterinary';

export class UserRepoHelper {
  static getRepo(
    type: UserType,
    repos: {
      storeRepo?: Repository<Store>;
      customerRepo?: Repository<Customer>;
      deliveryRepo?: Repository<Delivery>
      veterinaryRepo?: Repository<Veterinary>;
    }
  ): Repository<any> {
    switch (type) {
      case 'store':
        return repos.storeRepo!;
      case 'customer':
        return repos.customerRepo!;
      case 'delivery':
        return repos.deliveryRepo!;
      case 'veterinary':
        return repos.veterinaryRepo!;
      default:
        throw new Error(`Tipo de usuário inválido ou não implementado: ${type}`);
    }
  }
}