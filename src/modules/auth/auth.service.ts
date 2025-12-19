import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserType } from '../../common/enums/user-type.enum';
import { LoginDTO } from './dto/login.dto';
import { EmailVerificationService } from '../../common/services/email-verification.service';
import { Repository } from 'typeorm';
import { Store } from '../store/entities/store.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../customer/entities/customer.entity';
import { Delivery } from '../delivery/entities/delivery.entity';
import { Veterinary } from '../veterinary/entities/veterinary.entity';

export interface AuthResponse {
    status: 'success' | 'pending_code' | 'new_sent_code' | 'error';
    message: string;
    email?: string;
    data?: any;
}
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,
        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,
        @InjectRepository(Delivery)
        private readonly deliveryRepo: Repository<Delivery>,
        @InjectRepository(Veterinary)
        private readonly veterinaryRepo: Repository<Veterinary>,
        private readonly jwtService: JwtService,
        private readonly emailVerificationService: EmailVerificationService,
    ) { }

    async login(type: UserType, dto: LoginDTO): Promise<AuthResponse> {
        const repo = this._getRepository(type);
        const user = await this._findUser(repo, dto.email);

        const isValid = await bcrypt.compare(dto.password, user.password_hash);
        if (!isValid) throw new UnauthorizedException('E-mail ou senha incorretos');

        const emailResult = await this.emailVerificationService.handleOnLogin(repo, user);
        if (!emailResult.shouldContinueLogin) {
            return {
                status: emailResult.response.status,
                message: emailResult.response.message,
                email: emailResult.response.email
            };
        }

        const token = await this.jwtService.signAsync({ sub: user.id, type });
        return {
            status: 'success',
            message: 'Login realizado com sucesso!',
            data: {
                access_token: await token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    category: user.category,
                },
            },
        };
    }

    async completeUserRegistration(type, userId, email, name): Promise<AuthResponse> {
        const repo = this._getRepository(type);
        const user = { id: userId, email, name }
        await this.emailVerificationService.sendVerificationCode(repo, user);

        return {
            status: 'pending_code',
            message: 'Cadastro realizado! Código de verificação enviado para seu e-mail.',
            email: email,
            data: { userId, email },
        };
    }

    private _getRepository(type: UserType): Repository<any> {
        const repositories = {
            [UserType.STORE]: this.storeRepo,
            [UserType.CUSTOMER]: this.customerRepo,
            [UserType.DELIVERY]: this.deliveryRepo,
            [UserType.VETERINARY]: this.veterinaryRepo,
        };

        const repo = repositories[type];
        if (!repo) {
            throw new InternalServerErrorException(`Tipo de usuário inválido: ${type}`);
        }
        return repo;
    }

    private async _findUser(repo: Repository<any>, email: string): Promise<any> {
        const user = await repo.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('E-mail ou senha incorretos');
        }
        return user;
    }

}
