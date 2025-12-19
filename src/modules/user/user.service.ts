import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserRepoHelper } from "../../common/helpers/user-repo.helper";
import { UserType } from "../../common/enums/user-type.enum";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserService {
    constructor(
        private userRepoHelper: UserRepoHelper, 
        @InjectRepository(User)
        private userRepository: Repository<User>) { }

    async findByEmail(email: string) {
        return this.userRepoHelper.findUserByEmail(email);
    }

    async updateUserEmail(userId: string, oldEmail: string, newEmail: string, userType: UserType): Promise<void> {
        try {
            const result = await this.userRepository.update({
                email: oldEmail,
                user_type: userType,
                user_id: userId,
            }, { email: newEmail });

            if (result.affected === 0) {
                throw new InternalServerErrorException('Usuário não encontrado na tabela de mapeamento');
            }
        } catch (error) {
            throw new InternalServerErrorException('Erro ao atualizar email na tabela de usuários');
        }
    }
}