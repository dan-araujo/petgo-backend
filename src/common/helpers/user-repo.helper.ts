import { Repository } from "typeorm";
import { Store } from "../../store/entities/store.entity";

export type UserType = 'store' | 'customer' | 'delivery' | 'veterinary';

export class UserRepoHelper {
    static getRepo(
     type: UserType,
     repos: {
        storeRepo?: Repository<Store>;
     }
    ): Repository<any> {
      switch(type) {
        case 'store':
            return repos.storeRepo!;
        default:
            throw new Error(`Tipo de usuário inválido ou não implementado: ${type}`);
      }
    }
}