import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
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

    async create(data: CreateCustomerDTO): Promise<Customer> {
        const existingByEmail = await this.customerRepo.findOne({
            where: { email: data.email },
        });
        if (existingByEmail) {
            throw new ConflictException('E-mail já cadastrado');
        }

        if (data.cpf) {
            const existingByCpf = await this.customerRepo.findOne({
                where: { cpf: data.cpf },
            });
            if (existingByCpf) {
                throw new ConflictException('Já existe um cliente com esse CPF');
            }
        }

        const existingByPhone = await this.customerRepo.findOne({
            where: { phone: data.phone },
        });
        if (existingByPhone) {
            throw new ConflictException('Telefone já cadastrado');
        }

        const password_hash = await bcrypt.hash(data.password, 10);
        const customer = this.customerRepo.create({
            name: data.name,
            email: data.email,
            phone: data.phone,
            cpf: data.cpf,
            password_hash,
            role: 'customer',
            verification_code: this.generatedVerificationCode(),
            code_expires_at: new Date(Date.now() + 15 * 60 * 1000),
        });
        return this.customerRepo.save(customer);
    }

    async update(id: string, data: Partial<CreateCustomerDTO>): Promise<Customer> {
        const customer = await this.customerRepo.findOne({ where: { id } });

        if (!customer) {
            throw new NotFoundException('Cliente não encontrado');
        }

        if (data.email && data.email !== customer.email) {
            const existingByEmail = await this.customerRepo.findOne({
                where: { email: data.email },
            });
            if (existingByEmail) {
                throw new ConflictException('E-mail já existe.');
            }
        }

        if (data.cpf && data.cpf !== customer.cpf) {
            const existingByCpf = await this.customerRepo.findOne({
                where: { cpf: data.cpf },
            });
            if (existingByCpf) {
                throw new ConflictException('CPF já existe.');
            }
        }

        if (data.phone && data.phone !== customer.phone) {
            const existingByPhone = await this.customerRepo.findOne({
                where: { phone: data.phone },
            });
            if (existingByPhone) {
                throw new ConflictException('Telefone já cadastrado');
            }
        }

        // Atualiza apenas os campos enviados
        Object.assign(customer, data);

        return this.customerRepo.save(customer);
    }

    async remove(id: string): Promise<void> {
        try {
            const result = await this.customerRepo.softDelete(id);
            if (result.affected === 0) {
                throw new NotFoundException('Cliente não encontrado');
            }
        } catch (error) {
            throw error;
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