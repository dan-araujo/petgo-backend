import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LogisticsService } from './services/logistics.service'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpsertLogisticsDTO } from './dto/upsert-logistics.dto';
import { UserType } from '../../common/enums/user-type.enum';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Logistics Configuration')
@Controller('logistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) { }

  @Post('config')
  upsertConfig(@User('id') userId: string, @User('userType') userType: UserType, @Body() dto: UpsertLogisticsDTO) {
    const ownerType = userType === UserType.VETERINARY ? UserType.VETERINARY : UserType.STORE;
    return this.logisticsService.upsert(userId, ownerType, dto);
  }

  @Get('config')
  getConfig(@User('id') userId: string, @User('userType') userType: UserType) {
    const ownerType = userType === UserType.VETERINARY ? UserType.VETERINARY : UserType.STORE;
    return this.logisticsService.findMyConfig(userId, ownerType);
  }
}
