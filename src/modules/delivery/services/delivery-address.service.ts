import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AddressBaseService } from "../../address/address.base.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Address } from "../../address/entities/address.base.entity";
import { In, Repository } from "typeorm";
import { DeliveryAddress } from "../entities/delivery-address.entity";
import { DataSource } from "typeorm";
import { CreateDeliveryAddressDTO, UpdateDeliveryAddressDTO } from "../dto/delivery-address.dto";
import { AddressType } from "../../../common/enums/address-type.enum";
import { AddressContextDTO } from "../../address/dto/address-context.dto";

@Injectable()
export class DeliveryAddressService extends AddressBaseService {
    constructor(
        @InjectRepository(Address)
        protected readonly addressRepo: Repository<Address>,
        @InjectRepository(DeliveryAddress)
        private readonly deliveryAddressRepo: Repository<DeliveryAddress>,
        private readonly dataSource: DataSource,
    ) { super(addressRepo) }

    async create(
        input: CreateDeliveryAddressDTO,
        context: AddressContextDTO,
    ): Promise<DeliveryAddress> {

        this.validateAddressType(
            context.addressType,
            context.userType,
            AddressType.DELIVERY,
        );

        await this.checkDuplicateAddress({
            ...input,
            userId: context.userId,
        });

        return this.dataSource.transaction(async manager => {
            if (input.isCurrentLocation === true) {
                await this.unsetAllMainAddressesForUser(manager, {
                    addressType: AddressType.DELIVERY,
                    userId: context.userId,
                    relationEntity: DeliveryAddress,
                    flagField: 'isCurrentLocation',
                });
            }

            const address = manager.create(Address, {
                ...input,
                ...context,
            });
            await manager.save(address);

            const deliveryAddress = manager.create(DeliveryAddress, {
                id: address.id,
                deliveryId: context.userId,
                addressType: AddressType.DELIVERY,
                isCurrentLocation: input.isCurrentLocation ?? false,
            });

            await manager.save(deliveryAddress);

            return manager.findOneOrFail(DeliveryAddress, {
                where: { id: address.id },
                relations: ['address'],
            });
        });
    }


    async update(
        addressId: string,
        dto: UpdateDeliveryAddressDTO,
        userId: string,
    ): Promise<DeliveryAddress> {

        return this.dataSource.transaction(async manager => {
            const deliveryAddress = await manager.findOne(DeliveryAddress, {
                where: { id: addressId },
                relations: ['address'],
            });

            if (!deliveryAddress) {
                throw new NotFoundException('Endereço não encontrado');
            }

            if (deliveryAddress.address.userId !== userId) {
                throw new ForbiddenException('Você não tem permissão para alterar esse endereço');
            }

            await this.updateBaseAddressFields(manager, addressId, dto);

            if (dto.isCurrentLocation === true && !deliveryAddress.isCurrentLocation) {
                await this.unsetAllMainAddressesForUser(manager, {
                    addressType: AddressType.DELIVERY,
                    userId,
                    relationEntity: DeliveryAddress,
                    flagField: 'isCurrentLocation',
                });

                deliveryAddress.isCurrentLocation = true;
            }

            await manager.save(deliveryAddress);

            return manager.findOneOrFail(DeliveryAddress, {
                where: { id: addressId },
                relations: ['address'],
            });
        });
    }



    async delete(id: string, userId: string): Promise<{ success: true }> {
        const address = await this.addressRepo.findOne({ where: { id } });

        if (!address) {
            throw new NotFoundException('Endereço não encontrado');
        }

        if (address.userId !== userId) {
            throw new ForbiddenException('Você não tem permissão para excluir esse endereço');
        }

        await this.addressRepo.delete({ id });

        return { success: true };
    }


    async findAllByUser(deliveryId: string): Promise<DeliveryAddress[]> {
        return this.deliveryAddressRepo.find({
            where: { deliveryId: deliveryId },
            relations: ['address'],
            order: { isCurrentLocation: 'DESC' },
        });
    }

    async findCurrentLocation(deliveryId: string): Promise<DeliveryAddress | null> {
        return this.deliveryAddressRepo.findOne({
            where: { deliveryId: deliveryId, isCurrentLocation: true },
            relations: ['address'],
        });
    }
}
