import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Service } from "../entities/service.entity";
import { Repository } from "typeorm";
import { CategoryService } from "./category.service";
import { CreatePetServiceDTO } from "../dto/create-service.dto";
import { UpdatePetServiceDTO } from "../dto/update-service.dto";
import { CloudinaryService } from "../../../shared/cloudinary/cloudinary.service";

@Injectable()
export class PetService {
    constructor(
        @InjectRepository(Service)
        private readonly petServiceRepo: Repository<Service>,
        private readonly catalogService: CategoryService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async create(storeId: string, dto: CreatePetServiceDTO): Promise<Service> {
        await this.catalogService.findOneCategory(storeId, dto.categoryId);

        const petService = this.petServiceRepo.create({
            ...dto,
            storeId: storeId,
        });

        return await this.petServiceRepo.save(petService);
    }

    async findAll(storeId?: string, categoryId?: string, publicView = false): Promise<Service[]> {
        const whereClause: any = {};

        if (storeId) whereClause.storeId = storeId;
        if (categoryId) whereClause.categoryId = categoryId;
        if (publicView) {
            whereClause.isActive = true;
        }

        return await this.petServiceRepo.find({
            where: whereClause,
            order: { name: 'ASC' },
            relations: ['category', 'store'],
        });
    }

    async findOne(id: string, storeId?: string): Promise<Service> {
        const where: any = { id };

        if (storeId) {
            where.storeId = storeId;
        }

        const petService = await this.petServiceRepo.findOne({
            where,
            relations: ['category', 'store']
        });

        if (!petService) throw new NotFoundException('Serviço não encontrado.');

        return petService;
    }

    async update(storeId: string, id: string, dto: UpdatePetServiceDTO): Promise<Service> {
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

    async uploadImage(storeId: string, id: string, file: Express.Multer.File): Promise<Service> {
        const service = await this.findOne(storeId, id);
        const uploadResult = await this.cloudinaryService.uploadImage(file, 'petgo/services');

        service.imageUrl = uploadResult.secure_url;
        return await this.petServiceRepo.save(service);
    }

    async toggleActive(storeId: string, id: string): Promise<Service> {
        const service = await this.findOne(storeId, id);
        service.isActive = !service.isActive;
        return await this.petServiceRepo.save(service);
    }

}