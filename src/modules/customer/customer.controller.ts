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
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDTO } from './dto/create-customer.dto';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { Customer } from './entities/customer.entity';
import { UpdateCustomerDTO } from './dto/update-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('register')
  async create(@Body() dto: CreateCustomerDTO): Promise<ApiResponse<any>> {
    return await this.customerService.create(dto);
  }

  @Get()
  async findAll(): Promise<ApiResponse<Customer[]>> {
    const customers = await this.customerService.findAll();
    return {
      message: 'Clientes recuperados com sucesso!',
      data: customers,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const customer = await this.customerService.findOne(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
    const { password_hash, ...safeCustomer } = customer;
    return { data: safeCustomer };
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<UpdateCustomerDTO>,
  ): Promise<ApiResponse<Partial<Customer>>> {
    const updatedCustomer = await this.customerService.update(id, dto);
    const { password_hash, ...safeCustomer } =
      updatedCustomer;
    return {
      message: 'Cliente atualizado com sucesso!',
      data: safeCustomer,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<null>> {
    await this.customerService.remove(id);
    return { message: 'Cliente excluído com sucesso!' };
  }
}
