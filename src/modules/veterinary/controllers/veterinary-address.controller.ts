import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { VeterinaryAddressService } from "../services/veterinary-address.service";
import { CreateVeterinaryAddressDTO, UpdateVeterinaryAddressDTO } from "../dto/veterinary-address.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { UserType } from "../../../common/enums/user-type.enum";
import { AddressType } from "../../../common/enums/address-type.enum";

@UseGuards(JwtAuthGuard)
@Controller('addresses/veterinary')
export class VeterinaryAddressController {
    constructor(private readonly service: VeterinaryAddressService) { }

    @Post()
    create(@Req() req, @Body(ValidationPipe) dto: CreateVeterinaryAddressDTO) {
        return this.service.create(dto, {
            user_id: req.user.id,
            user_type: UserType.VETERINARY,
            address_type: AddressType.VETERINARY,
        });
    }

    @Patch(':id')
    update(@Req() req, @Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) dto: UpdateVeterinaryAddressDTO) {
        return this.service.update(id, dto, req.user.id);
    }

    @Delete(':id')
    delete(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
        return this.service.delete(id, req.user.id);
    }

    @Get()
    findAll(@Req() req) {
        return this.service.findAllByUser(req.user.id);
    }

    @Get('main')
    findMain(@Req() req) {
        return this.service.findMainAddress(req.user.id);
    }
}
