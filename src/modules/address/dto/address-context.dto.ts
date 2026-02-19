import { IsEnum, IsUUID } from 'class-validator';
import { AddressType } from '../../../common/enums/address-type.enum';
import { UserType } from '../../../common/enums/user-type.enum';

export class AddressContextDTO {
  @IsUUID()
  userId: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsEnum(AddressType)
  addressType: AddressType;
}
