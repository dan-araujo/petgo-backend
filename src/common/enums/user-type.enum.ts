import { Repository } from "typeorm";
import { Store } from "../../modules/store/entities/store.entity";
import { Customer } from "../../modules/customer/entities/customer.entity";
import { Delivery } from "../../modules/delivery/entities/delivery.entity";
import { Veterinary } from "../../modules/veterinary/entities/veterinary.entity";

export enum UserType {
    CUSTOMER = 'customer',
    DELIVERY = 'delivery',
    STORE = 'store',
    VETERINARY = 'veterinary'
}

export const UserTypeMap: Record<string, UserType> = {
    'customer': UserType.CUSTOMER,
    'delivery': UserType.DELIVERY,
    'store': UserType.STORE,
    'veterinary': UserType.VETERINARY,
};

export interface UserRepositories {
    storeRepo?: Repository<Store>;
    customerRepo?: Repository<Customer>;
    deliveryRepo?: Repository<Delivery>;
    veterinaryRepo?: Repository<Veterinary>;
}

export const UserTypeToRepoMap: Record<UserType, keyof UserRepositories> = {
    [UserType.STORE]: 'storeRepo',
    [UserType.CUSTOMER]: 'customerRepo',
    [UserType.DELIVERY]: 'deliveryRepo',
    [UserType.VETERINARY]: 'veterinaryRepo',
};

export function isValidUserType(value: any): value is UserType {
    return Object.values(UserType).includes(value);
}

export function getUserTypeLabel(type: UserType): string {
    const labels: Record<UserType, string> = {
        [UserType.CUSTOMER]: 'Cliente',
        [UserType.DELIVERY]: 'Entregador',
        [UserType.STORE]: 'Loja Parceira',
        [UserType.VETERINARY]: 'Veterinário',
    };

    return labels[type];
}