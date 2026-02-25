import { Module } from '@nestjs/common';
import { CategoryService } from './services/category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { CategoryController } from './controllers/category.controller';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { PetServiceController } from './controllers/pet-service.controller';
import { CloudinaryService } from '../../shared/cloudinary/cloudinary.service';
import { PetService } from './services/pet-service.service';
import { Service } from './entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, Service])],
  controllers: [CategoryController, ProductController, PetServiceController],
  providers: [CategoryService, ProductService, PetService, CloudinaryService],
  exports: [CategoryService, ProductService, PetService]
})
export class CatalogModule { }
