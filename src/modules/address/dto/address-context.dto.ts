import { IsEnum, IsUUID } from 'class-validator';
import { AddressType } from '../../../common/enums/address-type.enum';
import { UserType } from '../../../common/enums/user-type.enum';
import { AddressInputDTO } from './address-input.dto';

export class AddressContextDTO {
  @IsUUID()
  user_id: string;

  @IsEnum(UserType)
  user_type: UserType;

  @IsEnum(AddressType)
  address_type: AddressType;
}
