import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LogisticsConfig } from '../entities/logistics-config.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserType } from '../../../common/enums/user-type.enum';
import { UpsertLogisticsDTO } from '../dto/upsert-logistics.dto';

@Injectable()
export class LogisticsService {
  constructor(@InjectRepository(LogisticsConfig) private logisticRepo: Repository<LogisticsConfig>) { }

  async upsert(
    userId: string,
    userType: UserType.STORE | UserType.VETERINARY,
    dto: UpsertLogisticsDTO,
  ): Promise<LogisticsConfig> {
    const whereClause = userType === UserType.STORE ? { storeId: userId } : { veterinaryId: userId };
    let config = await this.logisticRepo.findOne({ where: whereClause });

    if (config) Object.assign(config, dto);
    else config = this.logisticRepo.create({ ...dto, ...whereClause });

    return this.logisticRepo.save(config);
  }

  findMyConfig(userId: string, userType: UserType.STORE | UserType.VETERINARY) {
    const whereClause = userType === UserType.STORE ? { storeId: userId } : { veterinaryId: userId };
    return this.logisticRepo.findOne({ where: whereClause });
  }

}
