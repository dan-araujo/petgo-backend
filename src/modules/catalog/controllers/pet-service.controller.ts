import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseUUIDPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreatePetServiceDTO } from "../dto/create-service.dto";
import { UpdatePetServiceDTO } from "../dto/update-service.dto";
import { ResponseStatus } from "../../../common/interfaces/api-response.interface";
import { FileInterceptor } from "@nestjs/platform-express";
import { User } from "../../../common/decorators/user.decorator";
import { PetService } from "../services/pet-service.service";
import { UserType } from "../../../common/enums";

@ApiTags('Catalog | Services')
@Controller('services')
export class PetServiceController {
    constructor(private readonly petService: PetService) { }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post()
    create(@User('id') storeId: string, @Body() dto: CreatePetServiceDTO) {
        return this.petService.create(storeId, dto);
    }

    @Get()
    findAll(
        @User('id') userId?: string,
        @User('userType') userType?: UserType,
        @Query('storeId') queryStoreId?: string,
        @Query('categoryId') categoryId?: string
    ) {
        const targetStoreId = userType === UserType.STORE ? userId : queryStoreId;
        const publicView = userType !== UserType.STORE;

        return this.petService.findAll(targetStoreId, categoryId, publicView);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id/image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @User('id') storeId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                    new FileTypeValidator({ fileType: 'image/(jpeg|png|webp|jpg)' }),
                ],
                exceptionFactory: () => new BadRequestException('Selecione uma imagem de até 5 MB o serviço.')
            }),
        ) file: Express.Multer.File) {
        return this.petService.uploadImage(storeId, id, file);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id/toggle-active')
    async toggleActive(@User('id') storeId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.petService.toggleActive(storeId, id);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.petService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch(':id')
    update(@User('id') storeId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePetServiceDTO) {
        return this.petService.update(storeId, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete(':id')
    async remove(@User('id') storeId: string, @Param('id', ParseUUIDPipe) id: string) {
        await this.petService.remove(storeId, id);
        return {
            status: ResponseStatus.SUCCESS,
            message: 'Serviço removido com sucesso.'
        };
    }
}

