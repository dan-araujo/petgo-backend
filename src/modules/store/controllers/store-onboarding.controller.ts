import { Body, Controller, HttpCode, HttpStatus, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { SelectStoreTypeDTO } from "../dto/select-store-type.dto";
import { StoreOnboardingService } from "../services/store-onboarding.service";
import { User } from "../../../common/decorators/user.decorator";

@ApiTags('Store | Onboarding')
@Controller('stores/onboarding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StoreOnboardingController {
    constructor(private readonly storeOnboardingService: StoreOnboardingService) { }

    @Patch('select-type')
    @HttpCode(HttpStatus.OK)
    async selectStoreType(@User('id') storeId: string, @Body() dto: SelectStoreTypeDTO) {
        return await this.storeOnboardingService.selectStoreType(storeId, dto);
    }

    @Patch('complete')
    @HttpCode(HttpStatus.OK)
    async complete(@User('id') storeId: string) {
        return await this.storeOnboardingService.completeOnboarding(storeId);
    }
}