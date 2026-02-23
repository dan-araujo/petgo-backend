import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { StoreService } from '../services/store.service';
import { CreateStoreDTO } from '../dto/create-store.dto';
import { ApiResponse, ResponseStatus } from '../../../common/interfaces/api-response.interface';
import { Store } from '../entities/store.entity';
import { UpdateStoreDTO } from '../dto/update-store.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { User } from '../../../common/decorators/user.decorator';


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
  @ApiOperation({ summary: 'Busca os dados da loja logada' })
  async getMe(@User('id') storeId: string): Promise<Partial<Store>> {
    return await this.storeService.findOne(storeId);
  }

  @Patch('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza os dados da loja logada' })
  async updateMe(@User('id') storeId: string, @Body() dto: UpdateStoreDTO): Promise<Partial<Store>> {
    const updatedStore = await this.storeService.update(storeId, dto);
    const { passwordHash, ...safeStore } = updatedStore;
    return safeStore;
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDTO,
    @User('id') storeId: string
  ): Promise<Partial<Store>> {
    if (storeId !== id) {
      throw new ForbiddenException('Você não tem permissão para editar esta loja.');
    }

    const updatedStore = await this.storeService.update(id, dto);
    const { passwordHash, ...safeStore } = updatedStore;
    return safeStore;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @User('id') loggedUserId: string): Promise<ApiResponse<null>> {
    if (loggedUserId !== id) {
      throw new ForbiddenException('Você não tem permissão para excluir esta loja.');
    }
    await this.storeService.remove(id);
    return { status: ResponseStatus.SUCCESS, message: 'Loja excluída com sucesso.' };
  }
}


