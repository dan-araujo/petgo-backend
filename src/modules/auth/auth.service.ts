import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserType } from '../../common/enums/user-type.enum';
import { LoginDTO } from './login/dto/login.dto';
import { Repository } from 'typeorm';
import { UserReposityResolver } from '../../common/services/user-repository.resolver';
import {
    ApiResponse,
    LoginSuccessData,
    VerificationData
} from '../../common/interfaces/api-response.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userRepoResolver: UserReposityResolver,
    ) { }

    async login(
        userType: UserType,
        dto: LoginDTO
    ): Promise<ApiResponse<LoginSuccessData | VerificationData>> {
        const repository = this.userRepoResolver.resolve(userType);
        const user = await this._findUser(repository, dto.email);

        const isValidPassword = await bcrypt.compare(
            dto.password,
            user.passwordHash
        );

        if (!isValidPassword) {
            throw new UnauthorizedException('E-mail ou senha incorretos');
        }

        if (user.status !== 'active') {
            return {
                status: 'pending_code',
                success: false,
                message: 'Conta não verificada. Código enviado para seu e-mail',
                email: user.email,
                data: {
                    email: user.email,
                    expiresIn: 10 * 60,
                },
            };
        }

        const token = await this.jwtService.signAsync({
            sub: user.id,
            type: userType,
        });

        const subtype = user.storeType || user.category || null;

        return {
            status: 'success',
            success: true,
            message: 'Login realizado com sucesso!',
            data: {
                access_token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    userType: user.userType,
                    profileCompleted: user.profiledCompleted ?? true,
                    subtype: user.subtype || user.category || null,
                },
            },
        };
    }

    private async _findUser(repo: Repository<any>, email: string): Promise<any> {
        const user = await repo.findOne({ where: { email } });

        if (!user) {
            throw new UnauthorizedException('E-mail ou senha incorretos');
        }

        return user;
    }
}
