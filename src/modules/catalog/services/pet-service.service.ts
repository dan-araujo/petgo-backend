import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Service } from "../entities/service.entity";
import { Repository } from "typeorm";
import { CategoryService } from "./category.service";
import { CreatePetServiceDTO } from "../dto/create-service.dto";
import { UpdatePetServiceDTO } from "../dto/update-service.dto";
import { CloudinaryService } from "../../../shared/cloudinary/cloudinary.service";
import { UserType } from "../../../common/enums";
import { getOwnerCondition, verifyManagementPermission } from "../../../common/helpers/permission.helper";

@Injectable()
export class PetService {
    constructor(
        @InjectRepository(Service)
        private readonly petServiceRepo: Repository<Service>,
        private readonly categoryService: CategoryService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async create(userId: string, userType: UserType, dto: CreatePetServiceDTO): Promise<Service> {
        verifyManagementPermission(userType, 'serviços');

        await this.categoryService.findOneCategory(dto.categoryId, userId);

        const petService = this.petServiceRepo.create({
            ...dto,
            ...getOwnerCondition(userId, userType)
        });

        return await this.petServiceRepo.save(petService);
    }

    async findAll(targetId?: string, categoryId?: string, publicView = false, targetUserType?: UserType): Promise<Service[]> {
        const whereClause: any = (targetId && targetUserType) ? getOwnerCondition(targetId, targetUserType) : {};

        if (categoryId) whereClause.categoryId = categoryId;
        if (publicView) whereClause.isActive = true;

        return await this.petServiceRepo.find({
            where: whereClause,
            order: { name: 'ASC' },
            relations: ['category', 'store', 'veterinary'],
        });
    }

    async findOne(id: string, userId?: string, userType?: UserType): Promise<Service> {
        const ownerCondition = (userId && userType) ? getOwnerCondition(userId, userType) : {};
        const petService = await this.petServiceRepo.findOne({
            where: { id, ...ownerCondition },
            relations: ['category', 'store', 'veterinary']
        });
        if (!petService) throw new NotFoundException('Serviço não encontrado.');
        return petService;
    }

    async update(userId: string, userType: UserType, id: string, dto: UpdatePetServiceDTO): Promise<Service> {
        verifyManagementPermission(userType, 'serviços');
        const petService = await this.findOne(id, userId, userType);

        if (dto.categoryId && dto.categoryId !== petService.categoryId) {
            await this.categoryService.findOneCategory(dto.categoryId, userId, userType);
        }

        Object.assign(petService, dto);
        return await this.petServiceRepo.save(petService);
    }

    async remove(userId: string, userType: UserType, id: string): Promise<void> {
        verifyManagementPermission(userType, 'serviços');

        const result = await this.petServiceRepo.softDelete({
            id,
            ...getOwnerCondition(userId, userType)
        });
        
        if (result.affected === 0) throw new NotFoundException('Serviço não encontrado.');
    }

    async uploadImage(userId: string, userType: UserType, id: string, file: Express.Multer.File): Promise<Service> {
        verifyManagementPermission(userType, 'serviços');
        const service = await this.findOne(id, userId, userType);

        const uploadResult = await this.cloudinaryService.uploadImage(file, 'petgo/services');
        service.imageUrl = uploadResult.secure_url;

        return await this.petServiceRepo.save(service);
    }

    async toggleActive(userId: string, userType: UserType, id: string): Promise<Service> {
        verifyManagementPermission(userType, 'serviços');

        const service = await this.findOne(id, userId, userType);
        service.isActive = !service.isActive;
        return await this.petServiceRepo.save(service);
    }
}