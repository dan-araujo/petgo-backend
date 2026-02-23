import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { StoreHoursService } from "../services/store-hours.service";
import { CreateSpecialHourDTO } from "../dto/special-hours.dto";
import { ManageBusinessHoursDTO } from "../dto/business-hours.dto";
import { User } from "../../../common/decorators/user.decorator";

@ApiTags('Stores | Hours')
@Controller('stores/profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StoreHoursController {
    constructor(private readonly storeHoursService: StoreHoursService) { }

    @Get('business-hours')
    async getBusinessHours(@User('id') storeId: string) {
        return await this.storeHoursService.findBusinessHours(storeId);
    }

    @Get('special-hours')
    async findAllSpecialHours(@User('id') storeId: string) {
        return await this.storeHoursService.findAllSpecialHours(storeId);
    }

    @Put('business-hours')
    async updateBusinessHours(@User('id') storeId: string, @Body() dto: ManageBusinessHoursDTO) {
        return await this.storeHoursService.updateBusinessHours(storeId, dto);
    }

    @Delete('business-hours/reset')
    async resetBusinessHours(@User('id') storeId: string) {
        return await this.storeHoursService.resetBusinessHours(storeId);
    }

    @Post('special-hours')
    async setSpecialHours(@User('id') storeId: string, @Body() dto: CreateSpecialHourDTO) {
        return await this.storeHoursService.updateSpecialHours(storeId, dto);
    }

    @Delete('special-hours/:id')
    async removeSpecialHour(@User('id') storeId: string, @Param('id', ParseUUIDPipe) id: string) {
        return await this.storeHoursService.removeSpecialHour(storeId, id);
    }

}