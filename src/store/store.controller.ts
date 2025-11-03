import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDTO } from './dto/create-store.dto';
import { UpdateStoreDTO } from './dto/update-store.dto';
import { Store } from './entities/store.entity';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) { }

  @Post('register')
  async create(@Body() dto: CreateStoreDTO): Promise<{ message: string; store: Partial<Store> }> {
    const newStore = await this.storeService.create(dto);
    const { password_hash, verification_code, ...safeStore } = newStore;

    return {
      message: 'Loja cadastrada com sucesso!',
      store: safeStore,
    };
  }

  @Get()
  async findAll(): Promise<Store[]> {
    return this.storeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Store> {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStoreDTO): Promise<Store> {
    return this.storeService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.storeService.remove(id);
    return { message: 'Loja removida com sucesso.' };
  }
}
