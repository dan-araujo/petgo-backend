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
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDTO } from '../dto/create-customer.dto';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import { Customer } from '../entities/customer.entity';
import { UpdateCustomerDTO } from '../dto/update-customer.dto';


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
      status: 'success',
      message: 'Clientes recuperados com sucesso!',
      data: customers,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponse<Partial<Customer>>> {
    const customer = await this.customerService.findOne(id);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const { passwordHash, ...safeCustomer } = customer;
    return {
      status: 'success',
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
      status: 'success',
      message: 'Cliente atualizado com sucesso!',
      data: safeCustomer,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponse<null>> {
    await this.customerService.remove(id);
    return {
      status: 'success',
      message: 'Cliente excluído com sucesso!',
    };
  }
}
