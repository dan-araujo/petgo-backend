import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ProductService } from "../services/product.service";
import { CreateProductDTO } from "../dto/create-product.dto";
import { UpdateProductDTO } from "../dto/update-product.dto";
import { ResponseStatus } from "../../../common/interfaces/api-response.interface";

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    create(@Req() req: any, @Body() dto: CreateProductDTO) {
        return this.productService.create(req.user.id, dto);
    }

    @Get()
    findAll(@Req() req: any, @Query('categoryId') categoryId?: string) {
        return this.productService.findAll(req.user.id, categoryId);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
        return this.productService.findOne(req.user.id, id);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDTO) {
        return this.productService.update(req.user.id, id, dto);
    }

    @Delete(':id')
    async remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
        await this.productService.remove(req.user.id, id);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Produto removido com sucesso.'
        };
    }
}