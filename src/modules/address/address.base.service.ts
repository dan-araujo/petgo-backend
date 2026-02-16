import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DeepPartial, EntityManager, EntityTarget, In, ObjectLiteral, Repository } from "typeorm";
import { Address } from "./entities/address.base.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { AddressType } from "../../common/enums/address-type.enum";
import { GeolocationService } from "../logistics/services/geolocation.service";

@Injectable()
export class AddressBaseService {
    constructor(
        @InjectRepository(Address)
        protected readonly addressRepo: Repository<Address>,
    ) { }

    async createBaseAddress(data: DeepPartial<Address>): Promise<Address> {
        try {
            const address = this.addressRepo.create(data);
            return await this.addressRepo.save(address);
        } catch (error) {
            console.error('Erro ao criar endereço base:', error);
            throw new BadRequestException('Erro ao criar endereço');
        }
    }

    async updateBaseAddress(id: string, data: DeepPartial<Address>) {
        try {
            const address = await this.addressRepo.findOne({ where: { id } });

            if (!address) {
                throw new NotFoundException('Endereço não encontrado');
            }

            Object.assign(address, data);
            return await this.addressRepo.save(address);
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Erro ao atualizar endereço base:', error);
            throw new BadRequestException('Erro ao atualizar endereço');
        }
    }

    protected async updateBaseAddressFields(manager: EntityManager, addressId: string, dto: any): Promise<void> {
        const baseUpdate: Partial<Address> = {};
        const unsafe = baseUpdate as any;

        if (dto.street !== undefined) unsafe.street = dto.street;
        if (dto.number !== undefined) unsafe.number = dto.number;
        if (dto.complement !== undefined) unsafe.complement = dto.complement;
        if (dto.city !== undefined) unsafe.city = dto.city;
        if (dto.neighborhood !== undefined) unsafe.neighborhood = dto.neighborhood;
        if (dto.state !== undefined) unsafe.state = dto.state;
        if (dto.zipCode !== undefined) unsafe.zipCode = dto.zipCode;
        if (dto.longitude !== undefined) unsafe.longitude = dto.longitude;
        if (dto.latitude !== undefined) unsafe.latitude = dto.latitude;

        if (Object.keys(baseUpdate).length > 0) {
            await manager.update(Address, addressId, baseUpdate);
        }
    }

    async deleteBaseAddress(id: string): Promise<void> {
        const address = await this.addressRepo.findOne({ where: { id } });

        if (!address) {
            throw new NotFoundException('Endereço não encontrado');
        }

        await this.addressRepo.softRemove(address);
    }

    async findById(id: string): Promise<Address> {
        const address = await this.addressRepo.findOne({ where: { id } });

        if (!address) {
            throw new NotFoundException('Endereço não encontrado');
        }

        return address;
    }

    validateAddressType(addressType: string, userType: string, expectedType: string): void {
        if (addressType !== expectedType || userType !== expectedType) {
            throw new BadRequestException(`address_type e user_type devem ser "${expectedType}`);
        }
    }

    async checkDuplicateAddress(dto: DeepPartial<Address>): Promise<void> {
        const existing = await this.addressRepo.findOne({
            where: {
                userId: dto.userId,
                street: dto.street,
                number: dto.number,
                zipCode: dto.zipCode,
            },
        });

        if (existing) {
            throw new BadRequestException('Endereço já cadastrado para esse usuário.');
        }
    }

    protected async unsetAllMainAddressesForUser<T extends ObjectLiteral>(
        manager: EntityManager,
        options: {
            addressType: AddressType;
            userId: string;
            relationEntity: EntityTarget<T>;
            flagField: keyof T;
        },
    ): Promise<void> {
        const addressIds = await manager.find(Address, {
            where: {
                userId: options.userId,
                addressType: options.addressType,
            },
            select: ['id'],
        });

        if (addressIds.length === 0) return;

        await manager.update(
            options.relationEntity,
            {
                id: In(addressIds.map(a => a.id)),
            } as any,
            {
                [options.flagField]: false,
            } as any,
        );
    }

    protected async tryGetCoordinates(dto: any, geoService: GeolocationService)
        : Promise<{ latitude: number | null, longitude: number | null }> {
        // Ajuste fino do usuário para o front-end
        if (dto.latitude && dto.longitude) {
            return {
                latitude: Number(dto.latitude),
                longitude: Number(dto.longitude),
            }
        }

        // Validação mínima
        if (!dto.street || !dto.city || !dto.state) {
            return { latitude: null, longitude: null };
        }

        try {
            // Tentativa 1: Busca exata (Ideal para avenidas principais e locais bem mapeados)
            const fullAddress = this.buildFullAddress(dto);
            const coords = await geoService.getCoordinatesFromAddress(fullAddress);

            if (coords) {
                return { latitude: coords.lat, longitude: coords.lon };
            }

            // Tentativa 2 (Fallback): Busca aprimorada, o pino cai no meio da rua e o usuário ajusta no front-end
            console.log('Tentativa exata falhou. Tentando busca apromixamada (apenas rua)...');
            const streetAddress = `${dto.street}, ${dto.city} - ${dto.state}`;
            const approximateCoordinates = await geoService.getCoordinatesFromAddress(streetAddress);

            if (approximateCoordinates) {
                return { latitude: approximateCoordinates.lat, longitude: approximateCoordinates.lon };
            }
        } catch (error) {
            console.warn(`[AddressBaseService] Falha na geolocalização automática: ${error.message}`);
        }

        return { latitude: null, longitude: null };
    }

    buildFullAddress(dto: any): string {
        return `${dto.street}, ${dto.number || ''}, ${dto.city} - ${dto.state}, ${dto.zip_code || ''}`;
    }

}