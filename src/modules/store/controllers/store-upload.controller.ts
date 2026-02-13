import { BadRequestException, Controller, ForbiddenException, NotFoundException, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CloudinaryService } from "../../../shared/cloudinary/cloudinary.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Store } from "../entities/store.entity";
import { Repository } from "typeorm";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import multer from 'multer';


@ApiTags('Store | Uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('stores')
export class StoreUploadController {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Post(':id/upload-logo')
    @ApiOperation({ summary: 'Upload de Logo' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024 },
    }))
    async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req) {
        return this.executeUpload(id, req.user.id, file, 'logo');
    }

    @Post('id:/upload-banner')
    @ApiOperation({ summary: 'Upload de Banner' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
    }))
    async uploadBanner(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req) {
        return this.executeUpload(id, req.user.id, file, 'banner');
    }

    private async executeUpload(storeId: string, userId: string, file: Express.Multer.File, type: 'logo' | 'banner') {
        if (!file) throw new BadRequestException('Arquivo inválido');
        if (userId !== storeId) {
            throw new ForbiddenException('Você não tem permissão para alterar esta loja.');
        }

        const store = await this.storeRepo.findOne({ where: { id: storeId } });
        if (!store) throw new NotFoundException('Loja não encontrada');

        const result = await this.cloudinaryService.uploadImage(file);
        if (type === 'logo') store.logoUrl = result.secure_url;
        else store.bannerUrl = result.secure_url;

        await this.storeRepo.save(store);
        return {
            message: `${type === 'logo' ? 'Logo' : 'Banner'} atualizado com sucesso}`,
            url: result.secure_url
        };
    }
}