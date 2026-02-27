import {
  Controller,
  Get,
  Post,
  Body,
  NotFoundException,
  Param,
  Patch,
  UsePipes,
  ValidationPipe,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDTO } from '../dto/create-customer.dto';
import { ApiResponse, ResponseStatus } from '../../../common/interfaces/api-response.interface';
import { Customer } from '../entities/customer.entity';
import { UpdateCustomerDTO } from '../dto/update-customer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { User } from '../../../common/decorators/user.decorator';


@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @Post('register')
  async create(@Body() dto: CreateCustomerDTO): Promise<ApiResponse> {
    return await this.customerService.create(dto);
  }

  @Get()
  async findAll(): Promise<ApiResponse<Customer[]>> {
    const customers = await this.customerService.findAll();
    return {
      status: ResponseStatus.SUCCESS,
      message: 'Clientes recuperados com sucesso!',
      data: customers,
    };
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca os dados do cliente logada' })
  async getMe(@User('id') customerId: string): Promise<Partial<Customer>> {
    return await this.customerService.findOne(customerId);
  }

  @Patch('profile/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza os dados do cliente logado' })
  async updateMe(@User('id') customerId: string, @Body() dto: UpdateCustomerDTO): Promise<Partial<Customer>> {
    const updatedCustomer = await this.customerService.update(customerId, dto);
    const { passwordHash, ...safeCustomer } = updatedCustomer;
    return safeCustomer;
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponse<Partial<Customer>>> {
    const customer = await this.customerService.findOne(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const { passwordHash, ...safeCustomer } = customer;
    return {
      status: ResponseStatus.SUCCESS,
      message: 'Cliente recuperado com sucesso!',
      data: safeCustomer,
    };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<UpdateCustomerDTO>,
  ): Promise<ApiResponse<Partial<Customer>>> {
    const updatedCustomer = await this.customerService.update(id, dto);
    const { passwordHash, ...safeCustomer } = updatedCustomer;
    return {
      status: ResponseStatus.SUCCESS,
      message: 'Cliente atualizado com sucesso!',
      data: safeCustomer,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponse<null>> {
    await this.customerService.remove(id);
    return {
      status: ResponseStatus.SUCCESS,
      message: 'Cliente excluído com sucesso!',
    };
  }
}
