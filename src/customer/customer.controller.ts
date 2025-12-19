import { Controller, Get, Post, Body, NotFoundException, Param, Patch, UsePipes, ValidationPipe, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDTO } from './dto/create-customer.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { Customer } from './entities/customer.entity';
import { AuthResponse } from '../auth/auth.service';

@Controller('customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Post('register')
    async create(@Body() dto: CreateCustomerDTO): Promise<ApiResponse<Partial<AuthResponse>>> {
        return await this.customerService.create(dto);
    }

    @Get()
    async findAll(): Promise<Customer[]> {
        return this.customerService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        const customer = await this.customerService.findOne(id);
        if (!customer) {
            throw new NotFoundException('Cliente não encontrado');
        }
        const { password_hash, verification_code, ...safeCustomer } = customer;
        return { data: safeCustomer }
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateCustomerDTO>):
        Promise<ApiResponse<Partial<Customer>>> {
        const updatedCustomer = await this.customerService.update(id, dto);
        const { password_hash, verification_code, ...safeCustomer } = updatedCustomer;
        return {
            message: 'Cliente atualizado com sucesso!',
            data: safeCustomer,
        };
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string):
        Promise<ApiResponse<Partial<void>>> {
        await this.customerService.remove(id);
        return { message: 'Cliente excluído com sucesso!' };
    }
}
