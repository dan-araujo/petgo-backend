import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "../entities/store.entity";
import { Repository } from "typeorm";
import { SelectStoreTypeDTO } from "../dto/select-store-type.dto";
import { AccountStatus } from "../../../common/enums/account-status.enum";
import { Petshop } from "../entities/petshop.entity";
import { PetSupply } from "../entities/pet-supply.entity";
import { StoreType } from "../../../common/enums/store-type.enum";

@Injectable()
export class StoreOnboardingService {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,
        @InjectRepository(Petshop)
        private readonly petshopRepo: Repository<Petshop>,
        @InjectRepository(PetSupply)
        private readonly petSupplyRepo: Repository<PetSupply>,
    ) { }

    async selectStoreType(storeId: string, dto: SelectStoreTypeDTO) {
        const store = await this.storeRepo.findOne({ where: { id: storeId } });
        if (!store) throw new NotFoundException('Loja não encontrada');

        store.storeType = dto.storeType;
        await this.storeRepo.save(store);

        if (dto.storeType === StoreType.PETSHOP) {
            const exists = await this.petshopRepo.findOne({ where: { storeId: storeId } });
            if (!exists) {
                await this.petshopRepo.save(this.petshopRepo.create({ storeId: storeId }));
            }
        }
        else if (dto.storeType === StoreType.PET_SUPPLY) {
            const exists = await this.petSupplyRepo.findOne({ where: { storeId: storeId } });
            if (!exists) {
                await this.petSupplyRepo.save(this.petSupplyRepo.create({ storeId: storeId }));
            }
        }

        return { message: 'Tipo de loja selecionado e perfil especializado criado com sucesso', storeType: dto.storeType };
    }

    async completeOnboarding(storeId: string) {
        const store = await this.storeRepo.findOne({
            where: { id: storeId },
            relations: ['addresses', 'businessHours', 'logisticsConfig']
        });

        if (!store) throw new NotFoundException('Loja não encontrada');
        if (!store.storeType) throw new BadRequestException('Selecione o tipo de loja');
        if (!store.addresses?.length) throw new BadRequestException('Cadastre pelo menos um endereço');
        if (!store.businessHours?.length) throw new BadRequestException('Defina seus horários de funcionamento');
        if (!store.logoUrl) throw new BadRequestException('É necessário fazer upload do Logo para dar personalidade a sua loja');
        if (!store.description) throw new BadRequestException('Adicione uma descrição para sua loja');
        if (!store.logisticsConfig) throw new BadRequestException('Configure suas regras de venda e entrega');

        store.profileCompleted = true;
        store.status = AccountStatus.ACTIVE;
        return await this.storeRepo.save(store);
    }
}