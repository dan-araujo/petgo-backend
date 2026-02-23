import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { UserType } from '../enums/user-type.enum'; //

@Injectable()
export class ParseUserTypePipe implements PipeTransform<string, UserType> {
    transform(value: string): UserType {
        const upperValue = value?.toUpperCase() as UserType;

        if (!Object.values(UserType).includes(upperValue)) {
            throw new BadRequestException(`Tipo de usuário inválido na rota: ${value}`);
        }

        return upperValue;
    }
}