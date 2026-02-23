import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CatalogService } from "../services/catalog.service";
import { CreateCategoryDTO } from "../dto/create-category.dto";
import { UpdateCategoryDTO } from "../dto/update-category.dto";
import { User } from "../../../common/decorators/user.decorator";

@ApiTags('Catalog')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoryController {
    constructor(private readonly catalogService: CatalogService) { }

    @Post()
    async create(@User('id') userId: string, @Body() dto: CreateCategoryDTO) {
        return await this.catalogService.createCategory(userId, dto);
    }

    @Get()
    async findAll(@User('id') userId: string) {
        return await this.catalogService.findAllCategories(userId);
    }

    @Get(':id')
    async findOne(@User('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
        return await this.catalogService.findOneCategory(userId, id);
    }

    @Patch(':id')
    async update(
        @User('id') userId: string,
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDTO,
    ) {
        return await this.catalogService.updateCategory(userId, id, dto);
    }

    @Delete(':id')
    async remove(@User('id') userId: string, @Param('id') id: string) {
        return await this.catalogService.removeCategory(userId, id);
    }

}