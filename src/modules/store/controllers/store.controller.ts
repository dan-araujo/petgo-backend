import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, NotFoundException, UseGuards, Req, Put } from '@nestjs/common';
import { StoreService } from '../services/store.service';
import { CreateStoreDTO } from '../dto/create-store.dto';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { Store } from '../entities/store.entity';
import { UpdateStoreDTO } from '../dto/update-store.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SelectStoreTypeDTO } from '../dto/select-store-type.dto';
import { ManageBusinessHoursDTO } from '../dto/business-hours.dto';
import { CreateSpecialHourDTO } from '../dto/special-hours.dto';

@ApiTags('Stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Post('register')
  async create(@Body() dto: CreateStoreDTO): Promise<ApiResponse> {
    return await this.storeService.create(dto);
  }

  @Get()
  async findAll(): Promise<Store[]> {
    return await this.storeService.findAll();
  }

  @Get('business-hours')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getBusinessHours(@Req() req: any) {
    const storeId = req.user.id;
    return await this.storeService.findBusinessHours(storeId);
  }

  @Get('special-hours')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAllSpecialHours(@Req() req: any) {
    const storeId = req.user.id;
    return await this.storeService.findAllSpecialHours(storeId);
  }

  @Patch('select-type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async selectStoreType(@Req() req: any, @Body() dto: SelectStoreTypeDTO) {
    const storeId = req.user.id;
    return await this.storeService.selectStoreType(storeId, dto);
  }

  @Put('business-hours')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateBusinessHours(@Req() req: any, @Body() dto: ManageBusinessHoursDTO) {
    const storeId = req.user.id;
    return await this.storeService.updateBusinessHours(storeId, dto);
  }

  @Post('special-hours')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async setSpecialHours(@Req() req: any, @Body() dto: CreateSpecialHourDTO) {
    return await this.storeService.updateSpecialHours(req.user.id, dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partial<Store>> {
    const store = await this.storeService.findOne(id);
    const { password_hash, ...safeStore } = store;

    if (!store) {
      throw new NotFoundException('Loja não encontrada');
    }
    return safeStore;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDTO,
  ): Promise<Partial<Store>> {
    const updatedStore = await this.storeService.update(id, dto);
    const { password_hash, ...safeStore } = updatedStore;
    
    return safeStore;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.storeService.remove(id);
    return {
      status: 'success',
      message: 'Loja excluída com sucesso.',
    };
  }

  @Delete('special-hours/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeSpecialHour(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const storeId = req.user.id;
    return await this.storeService.removeSpecialHour(storeId, id);
  }
}


