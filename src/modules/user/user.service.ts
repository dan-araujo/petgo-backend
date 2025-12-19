import { Injectable } from "@nestjs/common";
import { UserRepoHelper } from "../../common/helpers/user-repo.helper";

@Injectable()
export class UserService {
    constructor(private userRepoHelper: UserRepoHelper) {}

    async findByEmail(email: string) {
        return this.userRepoHelper.findUserByEmail(email);
    }
}