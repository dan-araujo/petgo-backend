import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PetService } from "../entities/service.entity";
import { Repository } from "typeorm";
import { CatalogService } from "./catalog.service";
import { CreatePetServiceDTO } from "../dto/create-service.dto";
import { UpdatePetServiceDTO } from "../dto/update-service.dto";

@Injectable()
export class PetServicesService {
    constructor(
        @InjectRepository(PetService)
        private readonly petServiceRepo: Repository<PetService>,
        private readonly catalogService: CatalogService,
    ) { }

    async create(storeId: string, dto: CreatePetServiceDTO): Promise<PetService> {
        await this.catalogService.findOneCategory(storeId, dto.categoryId);

        const petService = this.petServiceRepo.create({
            ...dto,
            storeId: storeId,
        });

        return await this.petServiceRepo.save(petService);
    }

    async findAll(storeId: string, categoryId?: string): Promise<PetService[]> {
        const whereClause: any = { store_id: storeId };

        if (categoryId) whereClause.category_id = categoryId;

        return await this.petServiceRepo.find({
            where: whereClause,
            order: { name: 'ASC' },
            relations: ['category'],
        });
    }

    async findOne(storeId: string, id: string): Promise<PetService> {
        const petService = await this.petServiceRepo.findOne({
            where: { id, storeId: storeId },
            relations: ['category']
        });

        if (!petService) throw new NotFoundException('Serviço não encontrado.');

        return petService;
    }

    async update(storeId: string, id: string, dto: UpdatePetServiceDTO): Promise<PetService> {
        const petService = await this.findOne(storeId, id);

        if (dto.categoryId && dto.categoryId !== petService.categoryId) {
            await this.catalogService.findOneCategory(storeId, dto.categoryId);
        }

        Object.assign(petService, dto);

        return await this.petServiceRepo.save(petService);
    }

    async remove(storeId: string, id: string): Promise<void> {
        const result = await this.petServiceRepo.softDelete({ id, storeId: storeId });

        if (result.affected === 0) throw new NotFoundException('Serviço não encontrado.');
    }

}