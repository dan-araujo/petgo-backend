import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CategoryService } from "../services/category.service";
import { CreateCategoryDTO } from "../dto/create-category.dto";
import { UpdateCategoryDTO } from "../dto/update-category.dto";
import { User } from "../../../common/decorators/user.decorator";
import { UserType } from "../../../common/enums";

@ApiTags('Catalog | Categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly catalogService: CategoryService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    async create(@User('id') userId: string, @Body() dto: CreateCategoryDTO) {
        return await this.catalogService.createCategory(userId, dto);
    }

    @Get()
    async findAll(
        @User('id') userId?: string,
        @User('userType') userType?: UserType,
        @Query('storeId') queryStoreId?: string
    ) {
        const targetStoreId = userType === UserType.STORE ? userId : queryStoreId;

        if (!targetStoreId) {
            throw new BadRequestException('Informe o Id da loja para listar as categorias.');
        }

        return await this.catalogService.findAllCategories(targetStoreId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return await this.catalogService.findOneCategory(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id')
    async update(
        @User('id') userId: string,
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDTO,
    ) {
        return await this.catalogService.updateCategory(userId, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete(':id')
    async remove(@User('id') userId: string, @Param('id') id: string) {
        return await this.catalogService.removeCategory(userId, id);
    }

}