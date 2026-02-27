import { ForbiddenException } from "@nestjs/common";
import { UserType } from "../enums";

export function verifyManagementPermission(userType: UserType, contextName: string = 'este recurso') {
    if (userType !== UserType.STORE && userType !== UserType.VETERINARY) {
        throw new ForbiddenException(`Acesso negado: Apenas lojas e veterinários podem gerenciar ${contextName}.`);
    }
}

export function getOwnerCondition(userId: string, userType: UserType): Record<string, string> {
    if (userType === UserType.STORE) return { storeId: userId };
    if (userType === UserType.VETERINARY) return { veterinaryId: userId };
    return {};
}