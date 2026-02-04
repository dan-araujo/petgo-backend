import { Module } from '@nestjs/common';
import { CatalogService } from './services/catalog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { CategoryController } from './controllers/category.controller';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { PetService } from './entities/service.entity';
import { PetServicesController } from './controllers/pet-services.controller';
import { PetServicesService } from './services/pet-services.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, PetService])],
  controllers: [CategoryController, ProductController, PetServicesController],
  providers: [CatalogService, ProductService, PetServicesService],
  exports: [CatalogService, ProductService, PetServicesService]
})
export class CatalogModule { }
