import { Controller, Get, Post, Body, NotFoundException, Param, Patch, UsePipes, ValidationPipe, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDTO } from './dto/create-customer.dto';

@Controller('customers')
export class CustomerController {
    constructor(private readonly customersService: CustomerService) { }

    @Post('register')
    async register(@Body() dto: CreateCustomerDTO) {
        const newCustomer = await this.customersService.create(dto);
        const { password_hash, verification_code, ...safeCustomer } = newCustomer;
        return { message: 'Cliente cadastrado com sucesso!', customer: safeCustomer };
    };

    @Get()
    async findAll() {
        return this.customersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const customer = await this.customersService.findOne(id);
        if (!customer) {
            throw new NotFoundException('Cliente não encontrado');
        }
        const { password_hash, verification_code, ...safeCustomer } = customer;
        return safeCustomer;
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe({ skipMissingProperties: true }))
    async update(@Param('id') id: string, @Body() data: Partial<CreateCustomerDTO>) {
        const updated = await this.customersService.update(id, data);
        const { password_hash, verification_code, ...safeCustomer } = updated;
        return { message: 'Cliente atualizado com sucesso!', customer: safeCustomer };
    }

    /* Restaurar cliente antigo caso necessário
    @Patch(':id/restore')
    async restore(@Param('id', new ParseUUIDPipe()) id: string) {
        await this.customersService.restore(id);
        return { message: 'Cliente restaurado com sucesso!'};
    } */

    @Delete(':id')
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        await this.customersService.remove(id);
        return { message: 'Cliente excluído com sucesso!' };
    }
}
