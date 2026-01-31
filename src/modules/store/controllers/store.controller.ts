import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { StoreService } from '../services/store.service';
import { CreateStoreDTO } from '../dto/create-store.dto';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { Store } from '../entities/store.entity';
import { UpdateStoreDTO } from '../dto/update-store.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SelectStoreTypeDTO } from '../dto/select-store-type.dto';

@ApiTags('Stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Post('register')
  async create(@Body() dto: CreateStoreDTO): Promise<ApiResponse> {
    return await this.storeService.create(dto);
  }

  @Get()
  async findAll(): Promise<ApiResponse<Store[]>> {
    const stores = await this.storeService.findAll();
    return {
      status: 'success',
      message: 'Lojas recuperadas com sucesso!',
      data: stores,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<Partial<Store>>> {
    const store = await this.storeService.findOne(id);
    if (!store) {
      throw new NotFoundException('Loja não encontrada');
    }

    const { password_hash, ...safeStore } = store;
    return {
      status: 'success',
      message: 'Loja recuperada com sucesso!',
      data: safeStore,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDTO,
  ): Promise<ApiResponse<Partial<Store>>> {
    const updatedStore = await this.storeService.update(id, dto);
    const { password_hash, ...safeStore } = updatedStore;
    return {
      status: 'success',
      message: 'Loja atualizada com sucesso!',
      data: safeStore,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.storeService.remove(id);
    return {
      status: 'success',
      message: 'Loja excluída com sucesso.',
    };
  }

  @Patch('select-type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async selectStoreType(@Req() req: any, @Body() dto: SelectStoreTypeDTO) {
    const storeId = req.user.id;
    return await this.storeService.selectStoreType(storeId, dto);
  }
}


