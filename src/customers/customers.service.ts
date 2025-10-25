import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "./customer.entity";
import { IsNull, Repository } from 'typeorm';
import { CreateCustomerDTO } from "./dto/create-customer.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,
    ) { }

    private async validateUniqueness(
        data: Partial<CreateCustomerDTO>, excludeId?: string,
    ): Promise<void> {
        const { email, cpf, phone } = data;

        const conditions: any[] = [];
        if(email) conditions.push({ email });
        if(cpf) conditions.push({ cpf });
        if(phone) conditions.push({ phone });
        if(conditions.length === 0) return;

        const existing = await this.customerRepo.findOne({ where: conditions });

        if (!existing) return;
        if (excludeId && existing.id === excludeId) return;

        if (existing.email === email) throw new ConflictException('E-mail já cadastrado');
        if (cpf && existing.cpf === cpf) throw new ConflictException('Já existe um cliente com esse CPF');
        if (phone && existing.phone === phone) throw new ConflictException('Telefone já cadastrado');
    }

    async create(data: CreateCustomerDTO): Promise<Customer> {
        try {
            await this.validateUniqueness(data);

            const password_hash = await bcrypt.hash(data.password, 10);
            const cpf = data.cpf?.trim() === '' ? null : data.cpf;
            const customer = this.customerRepo.create({
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf: cpf as any,
                password_hash,
                role: 'customer',
                verification_code: this.generatedVerificationCode(),
                code_expires_at: new Date(Date.now() + 15 * 60 * 1000),
            });

            return this.customerRepo.save(customer);
        } catch (error) {
            console.error('Erro ao criar o cliente: ', error);

            if (error instanceof ConflictException) throw error;

            throw new InternalServerErrorException('Erro interno ao cadastrar cliente');
        }
    }

    async update(id: string, data: Partial<CreateCustomerDTO>): Promise<Customer> {
        try {
            const customer = await this.customerRepo.findOne({ where: { id } });

            if (!customer) throw new NotFoundException('Cliente não encontrado');

            await this.validateUniqueness(data, id);

            if('password' in data) {
                throw new BadRequestException('A senha não pode ser alterada por este endopoint. Use o fluxo de recuperação de senha.')
            }

            // Atualiza apenas os campos enviados
            Object.assign(customer, data);

            return this.customerRepo.save(customer);
        } catch (error) {
            console.error('Erro ao atualizar cliente: ', error);

            if (error instanceof NotFoundException || error instanceof ConflictException) throw error;

            throw new InternalServerErrorException('Erro interno ao atualizar cliente');
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const result = await this.customerRepo.softDelete(id);
            if (result.affected === 0) {
                throw new NotFoundException('Cliente não encontrado');
            }
        } catch (error) {
            console.error('Erro ao remover cliente: ', error);
            throw new InternalServerErrorException('Erro interno ao remover cliente');
        }
    }

    async findAll(): Promise<Customer[]> {
        return this.customerRepo.find({ where: { deleted_at: IsNull() } });
    }

    async findOne(id: string) {
        const customer = await this.customerRepo.findOne({
            where: { id, deleted_at: IsNull() },
        });

        if (!customer) {
            throw new NotFoundException('Cliente não encontrado');
        }

        return customer;
    }

    /* Caso queira restaurar cliente antigo 
    async restore(id: string): Promise<void> {
        const result = await this.customerRepo.restore(id);
        if(result.affected === 0) {
            throw new NotFoundException('Cliente não encontrado');
        }
    }
    */


    private generatedVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

}