import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AddressBaseService } from "../../address/address.base.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Address } from "../../address/entities/address.base.entity";
import { In, Repository } from "typeorm";
import { DataSource } from "typeorm";
import { AddressType } from "../../../common/enums/address-type.enum";
import { StoreAddress } from "../entities/store-address.entity";
import { CreateStoreAddressDTO, UpdateStoreAddressDTO } from "../dto/store-address.dto";
import { AddressContextDTO } from "../../address/dto/address-context.dto";
import { GeolocationService } from "../../logistics/services/geolocation.service";

@Injectable()
export class StoreAddressService extends AddressBaseService {
    constructor(
        @InjectRepository(Address)
        protected readonly addressRepo: Repository<Address>,
        @InjectRepository(StoreAddress)
        private readonly storeAddressRepo: Repository<StoreAddress>,
        private readonly dataSource: DataSource,
        private readonly geoService: GeolocationService,
    ) {
        super(addressRepo);
    }

    async create(
        input: CreateStoreAddressDTO,
        context: AddressContextDTO,
    ): Promise<StoreAddress> {
        this.validateAddressType(
            context.addressType,
            context.userType,
            AddressType.STORE,
        );

        await this.checkDuplicateAddress({
            ...input,
            userId: context.userId,
        });

        const coordinates = await this.tryGetCoordinates(input, this.geoService);

        return this.dataSource.transaction(async manager => {
            if (input.isMainAddress === true) {
                await this.unsetAllMainAddressesForUser(manager, {
                    addressType: AddressType.STORE,
                    userId: context.userId,
                    relationEntity: StoreAddress,
                    flagField: 'isMainAddress',
                });
            }

            const address = manager.create(Address, {
                ...input,
                ...context,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
            });

            await manager.save(address);

            const storeAddress = manager.create(StoreAddress, {
                id: address.id,
                storeId: context.userId,
                isMainAddress: input.isMainAddress ?? false,
            });

            await manager.save(storeAddress);

            return manager.findOneOrFail(StoreAddress, {
                where: { id: address.id },
                relations: ['address'],
            });
        });
    }

    async update(
        addressId: string,
        dto: UpdateStoreAddressDTO,
        userId: string,
    ): Promise<StoreAddress> {
        const currentAddress = await this.storeAddressRepo.findOne({
            where: { id: addressId },
            relations: ['address'],
        });

        if (!currentAddress) {
            throw new NotFoundException('Endereço não encontrado');
        }

        if (currentAddress.address.userId !== userId) {
            throw new ForbiddenException('Você não tem permissão para alterar esse endereço');
        }

        const hasAddressChanged = !!(dto.street || dto.number || dto.city || dto.state || dto.zipCode);
        let newCoordinates = {};

        if (hasAddressChanged) {
            const mergeAddressData = { ...currentAddress.address, ...dto };
            const coordinates = await this.tryGetCoordinates(mergeAddressData, this.geoService);

            if (coordinates.latitude && coordinates.longitude) {
                newCoordinates = {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude
                };
            }
        }

        return this.dataSource.transaction(async manager => {
            const finalUpdateData = { ...dto, ...newCoordinates };

            await this.updateBaseAddressFields(manager, addressId, finalUpdateData);

            if (dto.isMainAddress === true && !currentAddress.isMainAddress) {
                await this.unsetAllMainAddressesForUser(manager, {
                    addressType: AddressType.STORE,
                    userId,
                    relationEntity: StoreAddress,
                    flagField: 'isMainAddress',
                });

                currentAddress.isMainAddress = true;
            }

            await manager.save(currentAddress);

            return manager.findOneOrFail(StoreAddress, {
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

    async findAllByUser(userId: string): Promise<StoreAddress[]> {
        return this.storeAddressRepo.find({
            where: { storeId: userId },
            relations: ['address'],
            order: { isMainAddress: 'DESC' },
        });
    }

    async findMainAddress(userId: string): Promise<StoreAddress | null> {
        return this.storeAddressRepo.findOne({
            where: { storeId: userId, isMainAddress: true },
            relations: ['address'],
        });
    }

    async getStoreAddress(storeId: string): Promise<StoreAddress> {
        const storeAddress = await this.storeAddressRepo.findOne({
            where: { storeId: storeId, isMainAddress: true },
            relations: ['address'],
        });

        if (!storeAddress || !storeAddress.address) {
            throw new BadRequestException('A loja selecionado não possui endereço configurado para entrega.');
        }

        return storeAddress;
    }
}
