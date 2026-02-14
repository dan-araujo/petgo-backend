import { IsEnum, IsNotEmpty } from "class-validator";
import { StoreType } from "../../../common/enums/store-type.enum";

export class SelectStoreTypeDTO {
    @IsNotEmpty({ message: 'Escolha o seu tipo de loja' })
    @IsEnum(StoreType, { message: 'Tipo de loja inválido' })
    storeType: StoreType;
}