import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { VeterinaryAddressService } from "../services/veterinary-address.service";
import { CreateVeterinaryAddressDTO, UpdateVeterinaryAddressDTO } from "../dto/veterinary-address.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { UserType } from "../../../common/enums/user-type.enum";
import { AddressType } from "../../../common/enums/address-type.enum";
import { ApiBearerAuth } from "@nestjs/swagger";
import { User } from "../../../common/decorators/user.decorator";

@UseGuards(JwtAuthGuard)
@Controller('addresses/veterinary')
@ApiBearerAuth()
export class VeterinaryAddressController {
    constructor(private readonly service: VeterinaryAddressService) { }

    @Post()
    create(@User('id') veterinaryId: string, @Body(ValidationPipe) dto: CreateVeterinaryAddressDTO) {
        return this.service.create(dto, {
            userId: veterinaryId,
            userType: UserType.VETERINARY,
            addressType: AddressType.VETERINARY,
        });
    }

    @Patch(':id')
    update(@User('id') veterinaryId: string, @Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) dto: UpdateVeterinaryAddressDTO) {
        return this.service.update(id, dto, veterinaryId);
    }

    @Delete(':id')
    delete(@User('id') veterinaryId: string, @Param('id', ParseUUIDPipe) id: string) {
        return this.service.delete(id, veterinaryId);
    }

    @Get()
    findAll(@User('id') veterinaryId: string) {
        return this.service.findAllByUser(veterinaryId);
    }

    @Get('main')
    findMain(@User('id') veterinaryId: string) {
        return this.service.findMainAddress(veterinaryId);
    }
}
