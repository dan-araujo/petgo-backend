import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AddressType } from "../../../common/enums/address-type.enum";
import { CreateCustomerAddressDTO, UpdateCustomerAddressDTO } from "../dto/customer-address.dto";
import { CustomerAddress } from "../entities/customer-address.entity";
import { DataSource, In, Repository } from "typeorm";
import { Address } from "../../address/entities/address.base.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { AddressBaseService } from "../../address/address.base.service";
import { AddressContextDTO } from "../../address/dto/address-context.dto";
import { UpdateBaseAddressDTO } from "../../address/dto/update-address.dto";

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
            context.address_type,
            context.user_type,
            AddressType.CUSTOMER,
        );

        await this.checkDuplicateAddress({
            ...input,
            user_id: context.user_id,
        });

        return this.dataSource.transaction(async manager => {
            if (input.is_default === true) {
                await this.unsetAllMainAddressesForUser(manager, {
                    addressType: AddressType.CUSTOMER,
                    userId: context.user_id,
                    relationEntity: CustomerAddress,
                    flagField: 'is_default',
                });
            }

            const address = manager.create(Address, {
                ...input,
                ...context,
            });
            await manager.save(address);

            const customerAddress = manager.create(CustomerAddress, {
                id: address.id,
                address_label: input.address_label ?? 'other',
                is_default: input.is_default ?? false,
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

            if (customerAddress.address.user_id !== userId) {
                throw new ForbiddenException('Você não pode alterar este endereço');
            }

            await this.updateBaseAddressFields(manager, addressId, dto);

            if (dto.is_default === true && !customerAddress.is_default) {
                await this.unsetAllMainAddressesForUser(manager, {
                    addressType: AddressType.CUSTOMER,
                    userId,
                    relationEntity: CustomerAddress,
                    flagField: 'is_default',
                });

                customerAddress.is_default = true;
            }

            if (dto.address_label !== undefined) {
                customerAddress.address_label = dto.address_label;
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

        if (address.user_id !== userId) {
            throw new ForbiddenException('Você não tem permissão para excluir esse endereço');
        }

        await this.addressRepo.delete({ id });

        return { success: true };
    }


    async findAllByUser(userId: string): Promise<CustomerAddress[]> {
        return this.customerAddressRepo.find({
            where: {
                address: {
                    user_id: userId,
                    address_type: AddressType.CUSTOMER,
                },
            },
            relations: ['address'],
            order: {
                is_default: 'DESC',
                address: { created_at: 'DESC' },
            },
        });
    }

    async findMainAddress(userId: string): Promise<CustomerAddress | null> {
        return this.customerAddressRepo.findOne({
            where: {
                is_default: true,
                address: {
                    user_id: userId,
                    address_type: AddressType.CUSTOMER,
                },
            },
            relations: ['address'],
        });
    }
}
