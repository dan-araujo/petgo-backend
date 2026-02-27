import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Not, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDTO } from '../dto/create-category.dto';
import slugify from 'slugify';
import { UpdateCategoryDTO } from '../dto/update-category.dto';
import { Product } from '../entities/product.entity';
import { UserType } from '../../../common/enums';
import { getOwnerCondition, verifyManagementPermission } from '../../../common/helpers/permission.helper';
import { Service } from '../entities/service.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
        @InjectRepository(Service) private readonly serviceRepo: Repository<Service>,
    ) { }

    async createCategory(userId: string, userType: UserType, dto: CreateCategoryDTO): Promise<Category> {
        verifyManagementPermission(userType, 'categorias');
        const slug = slugify(dto.name, { lower: true, strict: true });

        const onwerCondition = getOwnerCondition(userId, userType);
        const existing = await this.categoryRepo.exists({ where: { ...onwerCondition, slug } });
        if (existing) throw new ConflictException('Você já possui uma categoria com esse nome');

        const category = this.categoryRepo.create({
            ...dto,
            ...onwerCondition,
            slug
        });

        return await this.categoryRepo.save(category);
    }

    async updateCategory(userId: string, userType: UserType, id: string, dto: UpdateCategoryDTO): Promise<Category> {
        verifyManagementPermission(userType, 'categorias');
        const category = await this.findOneCategory(id, userId, userType);

        if (dto.name) {
            const newSlug = slugify(dto.name, { lower: true, strict: true });

            const hasConflict = await this.categoryRepo.exists({
                where: {
                    ...getOwnerCondition(userId, userType),
                    slug: newSlug,
                    id: Not(id)
                }
            });

            if (hasConflict) throw new ConflictException('Você já possui uma categoria com esse nome');
            
            category.slug = newSlug;
        }

        Object.assign(category, dto);
        return await this.categoryRepo.save(category);
    }

    async findAllCategories(targetId?: string, userType?: UserType): Promise<Category[]> {
        const whereClause = (targetId && userType) ? getOwnerCondition(targetId, userType) : {};

        return await this.categoryRepo.find({
            where: whereClause,
            order: { name: 'ASC' }
        });
    }

    async findAllGlobalCategories(): Promise<Category[]> {
        return await this.categoryRepo.createQueryBuilder('category')
            .distinctOn(['category.slug'])
            .orderBy('category.slug', 'ASC')
            .getMany();
    }

    async findOneCategory(id: string, userId?: string, userType?: UserType): Promise<Category> {
        const onwerCondition = (userId && userType) ? getOwnerCondition(userId, userType) : {};
        const category = await this.categoryRepo.findOne({ where: { id, ...onwerCondition } });
        if (!category) throw new NotFoundException('Categoria não encontrada');
        return category;
    }

    async removeCategory(userId: string, userType: UserType, id: string): Promise<void> {
        verifyManagementPermission(userType, 'categorias');
        const categoryExists = await this.categoryRepo.exists({
            where: { id, ...getOwnerCondition(userId, userType) }
        });
        if (!categoryExists) throw new NotFoundException('Categoria não encontrada.');

        const hasProducts = await this.productRepo.exists({ where: { categoryId: id } });
        const hasServices = await this.serviceRepo.exists({ where: { categoryId: id } });

        if (hasProducts || hasServices) {
            throw new BadRequestException(
                `Não é possível excluir: existem ${hasProducts} produtos e ${hasServices} serviços vinculados.`
            );
        }

        const result = await this.categoryRepo.delete({ id, ...getOwnerCondition(userId, userType) });
        if (result.affected === 0) throw new NotFoundException('Categoria não encontrada.');
    }
}