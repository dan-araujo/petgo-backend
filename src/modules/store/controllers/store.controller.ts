import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { StoreService } from '../services/store.service';
import { CreateStoreDTO } from '../dto/create-store.dto';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { Store } from '../entities/store.entity';
import { UpdateStoreDTO } from '../dto/update-store.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';


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

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Acesso Restrito: Busca todos os dados da loja logada (via Token)'
  })
  async getMe(@Req() req: any): Promise<Partial<Store>> {
    return await this.storeService.findOne(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Acesso Público: Busca informações de uma loja para exibir ao cliente'
  })
  async findOne(@Param('id') id: string): Promise<Partial<Store>> {
    const store = await this.storeService.findOne(id);
    const { passwordHash: passwordHash, ...safeStore } = store;

    return safeStore;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDTO,
  ): Promise<Partial<Store>> {
    const updatedStore = await this.storeService.update(id, dto);
    const { passwordHash: passwordHash, ...safeStore } = updatedStore;

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
}


