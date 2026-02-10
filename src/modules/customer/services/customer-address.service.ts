import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AddressType } from "../../../common/enums/address-type.enum";
import { CreateCustomerAddressDTO, UpdateCustomerAddressDTO } from "../dto/customer-address.dto";
import { CustomerAddress } from "../entities/customer-address.entity";
import { DataSource, In, Repository } from "typeorm";
import { Address } from "../../address/entities/address.base.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { AddressBaseService } from "../../address/address.base.service";
import { AddressContextDTO } from "../../address/dto/address-context.dto";

@Injectable()
export class CustomerAddressService extends AddressBaseService {
    constructor(
        @InjectRepository(Address)
        protected readonly addressRepo: Repository<Address>,
        @InjectRepository(CustomerAddress)
        private readonly customerAddressRepo: Repository<CustomerAddress>,
        private readonly dataSource: DataSource,
    ) {
        super(addressRepo);
    }

    async create(
        input: CreateCustomerAddressDTO,
        context: AddressContextDTO,
    ): Promise<CustomerAddress> {

        this.validateAddressType(
            context.addressType,
            context.userType,
            AddressType.CUSTOMER,
        );

        await this.checkDuplicateAddress({
            ...input,
            userId: context.userId,
        });

        return this.dataSource.transaction(async manager => {
            if (input.isDefault === true) {
                await this.unsetAllMainAddressesForUser(manager, {
                    addressType: AddressType.CUSTOMER,
                    userId: context.userId,
                    relationEntity: CustomerAddress,
                    flagField: 'isDefault',
                });
            }

            const address = manager.create(Address, {
                ...input,
                ...context,
            });
            await manager.save(address);

            const customerAddress = manager.create(CustomerAddress, {
                id: address.id,
                customerId: context.userId,
                addressLabel: input.addressLabel ?? 'other',
                isDefault: input.isDefault ?? false,
            });

            await manager.save(customerAddress);

            return manager.findOneOrFail(CustomerAddress, {
                where: { id: address.id },
                relations: ['address'],
            });
        });
    }

    async update(
        addressId: string,
        dto: UpdateCustomerAddressDTO,
        userId: string,
    ): Promise<CustomerAddress> {

        return this.dataSource.transaction(async manager => {
            const customerAddress = await manager.findOne(CustomerAddress, {
                where: { id: addressId },
                relations: ['address'],
            });

            if (!customerAddress) {
                throw new NotFoundException('Endereço não encontrado');
            }

            if (customerAddress.address.userId !== userId) {
                throw new ForbiddenException('Você não pode alterar este endereço');
            }

            await this.updateBaseAddressFields(manager, addressId, dto);

            if (dto.isDefault === true && !customerAddress.isDefault) {
                await this.unsetAllMainAddressesForUser(manager, {
                    addressType: AddressType.CUSTOMER,
                    userId,
                    relationEntity: CustomerAddress,
                    flagField: 'isDefault',
                });

                customerAddress.isDefault = true;
            }

            if (dto.addressLabel !== undefined) {
                customerAddress.addressLabel = dto.addressLabel;
            }

            await manager.save(customerAddress);

            return manager.findOneOrFail(CustomerAddress, {
                where: { id: addressId },
                relations: ['address'],
            });
        });
    }


    async delete(id: string, userId: string): Promise<{ success: true }> {
        const address = await this.addressRepo.findOne({
            where: { id },
        });

        if (!address) {
            throw new NotFoundException('Endereço não encontrado');
        }

        if (address.userId !== userId) {
            throw new ForbiddenException('Você não tem permissão para excluir esse endereço');
        }

        await this.addressRepo.delete({ id });

        return { success: true };
    }


    async findAllByUser(userId: string): Promise<CustomerAddress[]> {
        return this.customerAddressRepo.find({
            where: { customerId: userId },
            relations: ['address'],
            order: { isDefault: 'DESC' },
        });
    }

    async findMainAddress(userId: string): Promise<CustomerAddress | null> {
        return this.customerAddressRepo.findOne({
            where: { customerId: userId, isDefault: true },
            relations: ['address'],
        });
    }

    async getDeliveryAddress(customerId: string, addressId: string): Promise<Address> {
        const address = await this.addressRepo.findOne({
            where: { id: addressId, userId: customerId },
        });

        if (!address) {
            throw new NotFoundException('Endereço de entrega não encontrado.');
        }

        return address;
    }
}
