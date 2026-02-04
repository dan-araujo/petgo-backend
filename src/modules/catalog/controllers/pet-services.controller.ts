import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PetServicesService } from "../services/pet-services.service";
import { CreatePetServiceDTO } from "../dto/create-service.dto";
import { UpdatePetServiceDTO } from "../dto/update-service.dto";

@ApiTags('Services')
@Controller('services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PetServicesController {
    constructor(private readonly petServicesService: PetServicesService) { }

    @Post()
    create(@Req() req: any, @Body() dto: CreatePetServiceDTO) {
        return this.petServicesService.create(req.user.id, dto);
    }

    @Get()
    findAll(@Req() req: any, @Query('categoryId') categoryId?: string) {
        return this.petServicesService.findAll(req.user.id, categoryId);
    }

    @Get(':id')
    findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
        return this.petServicesService.findOne(req.user.id, id);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePetServiceDTO) {
        return this.petServicesService.update(req.user.id, id, dto);
    }

    @Delete(':id')
    async remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
        await this.petServicesService.remove(req.user.id, id);
        return {
            status: 'success',
            message: 'Serviço removido com sucesso.'
        };
    }
}

