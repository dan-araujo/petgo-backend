import { In, Repository } from "typeorm";
import { CategoryService } from "./category.service";
import { Product } from "../entities/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDTO } from "../dto/create-product.dto";
import { UpdateProductDTO } from "../dto/update-product.dto";
import { OrderItemDTO } from "../../order/dto/create-order.dto";
import { CloudinaryService } from "../../../shared/cloudinary/cloudinary.service";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product) private readonly productRepo: Repository<Product>,
        private readonly catalogService: CategoryService,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async create(storeId: string, dto: CreateProductDTO): Promise<Product> {
        const category = await this.catalogService.findOneCategory(storeId, dto.categoryId);
        const product = this.productRepo.create({
            ...dto,
            storeId: storeId,
        });

        return await this.productRepo.save(product);
    }

    async findAll(storeId?: string, categoryId?: string, publicView = false): Promise<Product[]> {
        const whereClause: any = {};

        if (storeId) whereClause.storeId = storeId;
        if (categoryId) whereClause.categoryId = categoryId;
        if (publicView) {
            whereClause.isActive = true;
        }

        return await this.productRepo.find({
            where: whereClause,
            order: { createdAt: 'DESC' },
            relations: ['category', 'store'],
        });
    }

    async findOne(id: string, storeId?: string): Promise<Product> {
        const where: any = { id };

        if (storeId) {
            where.storeId = storeId;
        }

        const product = await this.productRepo.findOne({
            where,
            relations: ['category', 'store']
        });

        if (!product) throw new NotFoundException('Item não encontrado.');

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

    async uploadImage(storeId: string, id: string, file: Express.Multer.File): Promise<Product> {
        const product = await this.findOne(storeId, id);
        const uploadResult = await this.cloudinaryService.uploadImage(file, 'petgo/products');

        product.imageUrl = uploadResult.secure_url;
        return await this.productRepo.save(product);
    }

    async toggleActive(storeId: string, id: string): Promise<Product> {
        const product = await this.findOne(storeId, id);
        product.isActive = !product.isActive;
        return await this.productRepo.save(product);
    }
}