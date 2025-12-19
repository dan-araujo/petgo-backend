import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryDTO } from './create-delivery.dto';

export class UpdateDeliveryDTO extends PartialType(CreateDeliveryDTO) {}
