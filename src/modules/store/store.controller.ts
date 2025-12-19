import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, NotFoundException } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDTO } from './dto/create-store.dto';
import { UpdateStoreDTO } from './dto/update-store.dto';
import { Store } from './entities/store.entity';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { AuthResponse } from '../auth/auth.service';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Post('register')
  async create(@Body() dto: CreateStoreDTO): Promise<ApiResponse<Partial<AuthResponse>>> {
    return await this.storeService.create(dto);
  }

  @Get()
  async findAll(): Promise<Store[]> {
    return this.storeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const store = await this.storeService.findOne(id);
    if (!store) {
      throw new NotFoundException('Loja não encontrada');
    }
    const { password_hash, verification_code, ...safeStore } = store;
    return { data: safeStore }
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStoreDTO):
    Promise<ApiResponse<Partial<Store>>> {
    const updatedStore = await this.storeService.update(id, dto);
    const { password_hash, verification_code, ...safeStore } = updatedStore;

    return {
      message: 'Loja atualizada com sucesso!',
      data: safeStore,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ApiResponse<Partial<void>>> {
    await this.storeService.remove(id);
    return { message: 'Loja excluída com sucesso.' };
  }
}
