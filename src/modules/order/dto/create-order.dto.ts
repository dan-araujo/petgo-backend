import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsUUID, Min, ValidateNested } from "class-validator";

export class OrderItemDTO {
    @IsUUID('4', { message: 'ID do produto inválido' })
    @IsNotEmpty()
    productId: string;

    @IsInt()
    @Min(1, { message: 'A quantidade deve ser maior que 0' })
    quantity: number;
}

export class CreateOrderDTO {
    @IsUUID('4', { message: 'ID da loja inválido' })
    @IsNotEmpty()
    storeId: string;

    @IsUUID('4', { message: 'ID do endereço de entrega inválido' })
    @IsNotEmpty({ message: 'O endereço de entrega é obrigatório' })
    deliveryAddressId: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'O pedido deve conter pelo menos um item' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDTO)
    items: OrderItemDTO[];

}
