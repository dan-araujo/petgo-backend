import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDTO } from '../dto/create-category.dto';
import slugify from 'slugify';
import { UpdateCategoryDTO } from '../dto/update-category.dto';
import { Product } from '../entities/product.entity';

@Injectable()
export class CatalogService {
    constructor(
        @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    ) { }

    async createCategory(storeId: string, dto: CreateCategoryDTO): Promise<Category> {
        const slug = slugify(dto.name, { lower: true, strict: true });
        const existing = await this.categoryRepo.findOne({
            where: { store_id: storeId, slug }
        });

        if (existing) throw new ConflictException('Você já possui uma categoria com esse nome');

        const category = this.categoryRepo.create({
            ...dto,
            store_id: storeId,
            slug
        });

        return await this.categoryRepo.save(category);
    }

    async updateCategory(storeId: string, id: string, dto: UpdateCategoryDTO): Promise<Category> {
        const category = await this.findOneCategory(storeId, id);

        if (dto.name && dto.name !== category.name) {
            const newSlug = slugify(dto.name, { lower: true, strict: true });
            const conflict = await this.categoryRepo.findOne({ where: { store_id: storeId, slug: newSlug } });

            if (conflict && conflict.id !== id) throw new ConflictException('Você já possui uma categoria com esse nome');

            category.slug = newSlug;
        }

        Object.assign(category, dto);
        return await this.categoryRepo.save(category);
    }

    async findAllCategories(storeId: string): Promise<Category[]> {
        return await this.categoryRepo.find({
            where: { store_id: storeId },
            order: { created_at: 'DESC' }
        });
    }

    async findOneCategory(storeId: string, id: string): Promise<Category> {
        const category = await this.categoryRepo.findOne({ where: { id, store_id: storeId } });

        if (!category) throw new NotFoundException('Categoria não encontrada');

        return category;
    }

    async removeCategory(storeId: string, id: string): Promise<void> {
        const count = await this.productRepo.count({ where: { category_id: id } });

        if (count > 0) {
            throw new BadRequestException(
                `Ei, você tem ${count} produtos nessa categoria. Tem certeza? Apague ou mova eles primeiro.`
            );
        }

        const result = await this.categoryRepo.delete({ id, store_id: storeId });

        if (result.affected === 0) throw new NotFoundException('Categoria não encontrada.');
    }
}
