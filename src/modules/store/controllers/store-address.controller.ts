import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { StoreAddressService } from "../services/store-address.service";
import { CreateStoreAddressDTO, UpdateStoreAddressDTO } from "../dto/store-address.dto";
import { UserType } from "../../../common/enums/user-type.enum";
import { AddressType } from "../../../common/enums/address-type.enum";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@Controller('addresses/store')
@ApiBearerAuth()
export class StoreAddressController {
    constructor(private readonly service: StoreAddressService) { }

    @Post()
    create(@Req() req: any, @Body(ValidationPipe) dto: CreateStoreAddressDTO) {
        return this.service.create(dto, {
            userId: req.user.id,
            userType: UserType.STORE,
            addressType: AddressType.STORE,
        });
    }

    @Patch(':id')
    update(@Req() req, @Param('id', ParseUUIDPipe) id: string, @Body(ValidationPipe) dto: UpdateStoreAddressDTO) {
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
