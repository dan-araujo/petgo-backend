import { In, Repository } from "typeorm";
import { CatalogService } from "./catalog.service";
import { Product } from "../entities/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDTO } from "../dto/create-product.dto";
import { UpdateProductDTO } from "../dto/update-product.dto";
import { OrderItemDTO } from "../../order/dto/create-order.dto";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
        private readonly catalogService: CatalogService,
    ) { }

    async create(storeId: string, dto: CreateProductDTO): Promise<Product> {
        const category = await this.catalogService.findOneCategory(storeId, dto.categoryId);
        const product = this.productRepo.create({
            ...dto,
            storeId: storeId,
        });

        return await this.productRepo.save(product);
    }

    async findAll(storeId: string, categoryId?: string): Promise<Product[]> {
        const whereClause: any = { storeId: storeId };

        if (categoryId) whereClause.categoryId = categoryId;

        return await this.productRepo.find({
            where: whereClause,
            order: { name: 'ASC' },
            relations: ['category'],
        });
    }

    async findOne(storeId: string, id: string): Promise<Product> {
        const product = await this.productRepo.findOne({
            where: { id, storeId: storeId },
            relations: ['category']
        });

        if (!product) throw new NotFoundException('Produto não encontrado.');

        return product;
    }

    async update(storeId: string, id: string, dto: UpdateProductDTO): Promise<Product> {
        const product = await this.findOne(storeId, id);

        if (dto.categoryId && dto.categoryId !== product.categoryId) {
            await this.catalogService.findOneCategory(storeId, dto.categoryId);
        }

        Object.assign(product, dto);

        return await this.productRepo.save(product);
    }

    async remove(storeId: string, id: string): Promise<void> {
        const result = await this.productRepo.softDelete({ id, storeId: storeId });

        if (result.affected === 0) throw new NotFoundException('Produto não encontrado.');
    }

    async getStoreProducts(dto: OrderItemDTO[], storeId: string): Promise<Product[]> {
        const productIds = dto.map((item) => item.productId);
        const products = await this.productRepo.find({
            where: { id: In(productIds), storeId: storeId },
        });

        if (products.length !== productIds.length) {
            throw new BadRequestException('Alguns produtos não foram encontrados ou pertencem a outra loja.')
        }

        return products;
    }
}