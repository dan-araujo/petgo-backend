import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "../entities/store.entity";
import { Repository } from "typeorm";
import { SelectStoreTypeDTO } from "../dto/select-store-type.dto";
import { AccountStatus } from "../../../common/enums/account-status.enum";

@Injectable()
export class StoreOnboardingService {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,
    ) { }

    async selectStoreType(storeId: string, dto: SelectStoreTypeDTO): Promise<Store> {
        const store = await this.storeRepo.findOne({ where: { id: storeId } });
        if (!store) throw new NotFoundException('Loja não encontrada');

        store.storeType = dto.storeType;
        return await this.storeRepo.save(store);
    }

    async completeOnboarding(storeId: string): Promise<Store> {
        const store = await this.storeRepo.findOne({
            where: { id: storeId },
            relations: ['addresses', 'addresses.address', 'businessHours', 'specialHours']
        });

        if (!store) throw new NotFoundException('Loja não encontrada');
        if (!store.storeType) throw new BadRequestException('Selecione o tipo de loja');
        if (!store.addresses?.length) throw new BadRequestException('Cadastre pelo menos um endereço');
        if (!store.businessHours?.length) throw new BadRequestException('Cadastre o horário de funcionamento da sua loja');

        store.profileCompleted = true;
        store.status = AccountStatus.ACTIVE;
        return await this.storeRepo.save(store);
    }
}