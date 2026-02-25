import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseUUIDPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ProductService } from "../services/product.service";
import { CreateProductDTO } from "../dto/create-product.dto";
import { UpdateProductDTO } from "../dto/update-product.dto";
import { ResponseStatus } from "../../../common/interfaces/api-response.interface";
import { User } from "../../../common/decorators/user.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import multer from 'multer';
import { UserType } from "../../../common/enums";

@ApiTags('Catalog | Products')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    create(@User('id') userId: string, @Body() dto: CreateProductDTO) {
        return this.productService.create(userId, dto);
    }

    @Get()
    findAll(
        @User('id') userId?: string,
        @User('userType') userType?: UserType,
        @Query('storeId') queryStoreId?: string,
        @Query('categoryId') categoryId?: string
    ) {
        const targetStoreId = (userType === UserType.STORE) ? userId : queryStoreId;
        const publicView = userType !== UserType.STORE;

        return this.productService.findAll(targetStoreId, categoryId, publicView);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id/image')
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
    }))
    async uploadImage(
        @User('id') storeId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                    new FileTypeValidator({ fileType: 'image/(jpeg|png|webp|jpg)' }),
                ],
                exceptionFactory: () => new BadRequestException('Selecione uma imagem de até 5 MB para o produto.')
            }),
        ) file: Express.Multer.File
    ) {
        return this.productService.uploadImage(storeId, id, file);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id/toggle-active')
    async toggleActive(@User('id') storeId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.productService.toggleActive(storeId, id);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.productService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id')
    update(@User('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDTO) {
        return this.productService.update(userId, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete(':id')
    async remove(@User('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
        await this.productService.remove(userId, id);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Produto removido com sucesso.'
        };
    }
}