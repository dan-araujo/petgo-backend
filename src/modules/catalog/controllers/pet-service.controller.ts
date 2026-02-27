import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseUUIDPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreatePetServiceDTO } from "../dto/create-service.dto";
import { UpdatePetServiceDTO } from "../dto/update-service.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { User } from "../../../common/decorators/user.decorator";
import { PetService } from "../services/pet-service.service";
import { UserType } from "../../../common/enums";

@ApiTags('Catalog | Services')
@Controller('services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PetServiceController {
    constructor(private readonly petService: PetService) { }

    @Post()
    create(
        @User('id') userId: string,
        @User('userType') userType: UserType,
        @Body() dto: CreatePetServiceDTO
    ) {
        return this.petService.create(userId, userType, dto);
    }

    @Get()
    findAll(
        @User('id') userId?: string,
        @User('userType') userType?: UserType,
        @Query('storeId') queryStoreId?: string,
        @Query('veterinaryId') queryVetId?: string,
        @Query('categoryId') categoryId?: string
    ) {
        let targetId: string | undefined = undefined;
        let targetType: UserType | undefined = undefined;

        if (userType === UserType.STORE || userType === UserType.VETERINARY) {
            targetId = userId;
            targetType = userType;
        } else if (queryStoreId) {
            targetId = queryStoreId;
            targetType = UserType.STORE;
        } else if (queryVetId) {
            targetId = queryVetId;
            targetType = UserType.VETERINARY;
        }

        const publicView = (userType !== UserType.STORE && userType !== UserType.VETERINARY);

        return this.petService.findAll(targetId, categoryId, publicView, targetType);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.petService.findOne(id);
    }

    @Patch(':id')
    update(
        @User('id') userId: string,
        @User('userType') userType: UserType,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePetServiceDTO
    ) {
        return this.petService.update(userId, userType, id, dto);
    }

    @Patch(':id/toggle-active')
    async toggleActive(
        @User('id') userId: string,
        @User('userType') userType: UserType,
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.petService.toggleActive(userId, userType, id);
    }

    @Patch(':id/image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @User('id') userId: string,
        @User('userType') userType: UserType,
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                    new FileTypeValidator({ fileType: 'image/(jpeg|png|webp|jpg)' }),
                ],
                exceptionFactory: () => new BadRequestException('Selecione uma imagem de até 5 MB para o serviço.')
            }),
        ) file: Express.Multer.File) {
        return this.petService.uploadImage(userId, userType, id, file);
    }

    @Delete(':id')
    remove(
        @User('id') userId: string,
        @User('userType') userType: UserType,
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.petService.remove(userId, userType, id);
    }
}