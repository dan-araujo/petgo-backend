import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Address } from "../../address/entities/address.base.entity";
import { Repository } from "typeorm";
import { VeterinaryAddress } from "../entities/veterinary-address.entity";
import { DataSource } from "typeorm";
import { CreateVeterinaryAddressDTO, UpdateVeterinaryAddressDTO } from "../dto/veterinary-address.dto";
import { AddressType } from "../../../common/enums/address-type.enum";
import { AddressBaseService } from "../../address/address.base.service";
import { AddressContextDTO } from "../../address/dto/address-context.dto";

@Injectable()
export class VeterinaryAddressService extends AddressBaseService {
    constructor(
        @InjectRepository(Address)
        protected readonly addressRepo: Repository<Address>,
        @InjectRepository(VeterinaryAddress)
        private readonly veterinaryAddressRepo: Repository<VeterinaryAddress>,
        private readonly dataSource: DataSource,
    ) {
        super(addressRepo);
    }

    async create(
        input: CreateVeterinaryAddressDTO,
        context: AddressContextDTO,
    ): Promise<VeterinaryAddress> {

        this.validateAddressType(
            context.address_type,
            context.user_type,
            AddressType.VETERINARY,
        );

        await this.checkDuplicateAddress({
            ...input,
            user_id: context.user_id,
        });

        return this.dataSource.transaction(async manager => {
            if (input.is_main_location === true) {
                await this.unsetAllMainAddressesForUser(manager, {
                    addressType: AddressType.VETERINARY,
                    userId: context.user_id,
                    relationEntity: VeterinaryAddress,
                    flagField: 'is_main_location',
                });
            }

            const address = manager.create(Address, {
                ...input,
                ...context,
            });
            await manager.save(address);

            const veterinaryAddress = manager.create(VeterinaryAddress, {
                id: address.id,
                is_main_location: input.is_main_location ?? false,
            });

            await manager.save(veterinaryAddress);

            return manager.findOneOrFail(VeterinaryAddress, {
                where: { id: address.id },
                relations: ['address'],
            });
        });
    }

    async update(
        addressId: string,
        dto: UpdateVeterinaryAddressDTO,
        userId: string,
    ): Promise<VeterinaryAddress> {

        return this.dataSource.transaction(async manager => {
            const veterinaryAddress = await manager.findOne(VeterinaryAddress, {
                where: { id: addressId },
                relations: ['address'],
            });

            if (!veterinaryAddress) {
                throw new NotFoundException('Endereço não encontrado');
            }

            if (veterinaryAddress.address.user_id !== userId) {
                throw new ForbiddenException('Você não tem permissão para alterar esse endereço');
            }

            await this.updateBaseAddressFields(manager, addressId, dto);

            if (dto.is_main_location === true && !veterinaryAddress.is_main_location) {
                await this.unsetAllMainAddressesForUser(manager, {
                    addressType: AddressType.VETERINARY,
                    userId,
                    relationEntity: VeterinaryAddress,
                    flagField: 'is_main_location',
                });

                veterinaryAddress.is_main_location = true;
            }

            await manager.save(veterinaryAddress);

            return manager.findOneOrFail(VeterinaryAddress, {
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

        if (address.user_id !== userId) {
            throw new ForbiddenException('Você não tem permissão para excluir esse endereço');
        }

        await this.addressRepo.delete({ id });

        return { success: true };
    }

    async findAllByUser(userId: string): Promise<VeterinaryAddress[]> {
        return this.veterinaryAddressRepo.find({
            where: {
                address: {
                    user_id: userId,
                    address_type: AddressType.VETERINARY,
                },
            },
            relations: ['address'],
            order: {
                is_main_location: 'DESC',
                address: { created_at: 'DESC' },
            },
        });
    }

    async findMainAddress(userId: string): Promise<VeterinaryAddress | null> {
        return this.veterinaryAddressRepo.findOne({
            where: {
                is_main_location: true,
                address: {
                    user_id: userId,
                    address_type: AddressType.VETERINARY,
                },
            },
            relations: ['address'],
        });
    }
}
