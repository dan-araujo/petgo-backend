import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Store } from '../store/entities/store.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRepoHelper, UserType } from '../common/helpers/user-repo.helper';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>,
        private readonly jwtService: JwtService,
    ) { }

    async loginUser(type: UserType, dto: LoginDTO) {
        try {
            const repo = UserRepoHelper.getRepo(type, { storeRepo: this.storeRepo });
            const user = await repo.findOne({ where: { email: dto.email }});

            if(!user) throw new UnauthorizedException('Credenciais inválidas');

            const isValid = await bcrypt.compare(dto.password, user.password_hash);
            if(!isValid) throw new UnauthorizedException('Credenciais inválidas');

            const payload = { sub: user.id, type };
            const token = await this.jwtService.signAsync(payload);

            return {
                message: 'Login realizado com sucesso!',     
                data: {
                    access_token: token,
                    user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    category: user.category,
                    },
                },
            };
        } catch (error) {
            if(error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error.message || 'Erro ao realizar login');
        }
    }
}
