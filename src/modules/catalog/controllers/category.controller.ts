import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CatalogService } from "../services/catalog.service";
import { CreateCategoryDTO } from "../dto/create-category.dto";
import { UpdateCategoryDTO } from "../dto/update-category.dto";

@ApiTags('Catalog')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoryController {
    constructor(private readonly catalogService: CatalogService) { }

    @Post()
    async create(@Req() req: any, @Body() dto: CreateCategoryDTO) {
        return await this.catalogService.createCategory(req.user.id, dto);
    }

    @Get()
    async findAll(@Req() req: any) {
        return await this.catalogService.findAllCategories(req.user.id);
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
        return await this.catalogService.findOneCategory(req.user.id, id);
    }

    @Patch(':id')
    async update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDTO,
    ) {
        return await this.catalogService.updateCategory(req.user.id, id, dto);
    }

    @Delete(':id')
    async remove(@Req() req: any, @Param('id') id: string) {
        return await this.catalogService.removeCategory(req.user.id, id);
    }

}