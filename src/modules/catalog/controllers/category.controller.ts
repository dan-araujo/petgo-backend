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
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    async create(@User('id') userId: string, @User('userType') userType: UserType, @Body() dto: CreateCategoryDTO) {
        return await this.categoryService.createCategory(userId, userType, dto);
    }

    @Get()
    async findAll(
        @User('id') userId: string,
        @User('userType') userType: UserType,
        @Query('storeId') queryStoreId?: string,
        @Query('veterinaryId') queryVetId?: string,
    ) {
        let targetId: string | undefined = undefined;
        let targetType: UserType | undefined = undefined;

        if (userType === UserType.STORE || userType === UserType.VETERINARY) {
            targetId = userId;
            targetType = userType;
            return await this.categoryService.findAllCategories(targetId, targetType);
        }

        if (queryStoreId) {
            return await this.categoryService.findAllCategories(queryStoreId, UserType.STORE);
        }

        if (queryVetId) {
            return await this.categoryService.findAllCategories(queryVetId, UserType.VETERINARY);
        }

        return await this.categoryService.findAllGlobalCategories();
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @User('id') userId: string,
        @User('userType') userType: UserType
    ) {
        const isOwner = userType === UserType.STORE || userType === UserType.VETERINARY;
        return await this.categoryService.findOneCategory(id, isOwner ? userId : undefined, isOwner ? userType : undefined);
    }

    @Patch(':id')
    async update(
        @User('id') userId: string,
        @User('userType') userType: UserType,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateCategoryDTO,
    ) {
        return await this.categoryService.updateCategory(userId, userType, id, dto);
    }

    @Delete(':id')
    async remove(
        @User('id') userId: string,
        @User('userType') userType: UserType,
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return await this.categoryService.removeCategory(userId, userType, id);
    }
}