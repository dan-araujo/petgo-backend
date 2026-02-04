import { Repository } from "typeorm";
import { CatalogService } from "./catalog.service";
import { Product } from "../entities/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDTO } from "../dto/create-product.dto";
import { UpdateProductDTO } from "../dto/update-product.dto";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
        private readonly catalogService: CatalogService,
    ) { }

    async create(storeId: string, dto: CreateProductDTO): Promise<Product> {
        const category = await this.catalogService.findOneCategory(storeId, dto.category_id);
        const product = this.productRepo.create({
            ...dto,
            store_id: storeId,
        });

        return await this.productRepo.save(product);
    }

    async findAll(storeId: string, categoryId?: string): Promise<Product[]> {
        const whereClause: any = { store_id: storeId };

        if (categoryId) whereClause.category_id = categoryId;

        return await this.productRepo.find({
            where: whereClause,
            order: { name: 'ASC' },
            relations: ['category'],
        });
    }

    async findOne(storeId: string, id: string): Promise<Product> {
        const product = await this.productRepo.findOne({
            where: { id, store_id: storeId },
            relations: ['category']
        });

        if (!product) throw new NotFoundException('Produto não encontrado.');

        return product;
    }

    async update(storeId: string, id: string, dto: UpdateProductDTO): Promise<Product> {
        const product = await this.findOne(storeId, id);

        if (dto.category_id && dto.category_id !== product.category_id) {
            await this.catalogService.findOneCategory(storeId, dto.category_id);
        }

        Object.assign(product, dto);

        return await this.productRepo.save(product);
    }

    async remove(storeId: string, id: string): Promise<void> {
        const result = await this.productRepo.softDelete({ id, store_id: storeId });

        if (result.affected === 0) throw new NotFoundException('Produto não encontrado.');
    }
}