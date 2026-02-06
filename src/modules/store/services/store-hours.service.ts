import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ManageBusinessHoursDTO } from "../dto/business-hours.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Store } from "../entities/store.entity";
import { StoreBusinessHours } from "../entities/store-business-hour.entity";
import { StoreSpecialHours } from "../entities/store-special-hour.entity";
import { CreateSpecialHourDTO } from "../dto/special-hours.dto";

@Injectable()
export class StoreHoursService {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepo: Repository<Store>
    ) { }

    private async findStore(storeId: string): Promise<Store> {
        const store = await this.storeRepo.findOne({ where: { id: storeId, deleted_at: IsNull() } });
        if (!store) throw new NotFoundException('Loja não encontrada.');
        return store;
    }


    async updateBusinessHours(storeId: string, dto: ManageBusinessHoursDTO) {
        const store = await this.findStore(storeId);

        for (const hourDTO of dto.hours) {
            if (!hourDTO.is_closed && hourDTO.opens_at >= hourDTO.closes_at) {
                throw new BadRequestException(
                    `No dia ${hourDTO.day_of_week}, o horário de abertura (${hourDTO.opens_at}) deve ser menor que o horário de fechamento (${hourDTO.closes_at}).`,
                );
            }

            const existingHour = await this.storeRepo.manager.findOne(StoreBusinessHours, {
                where: {
                    store_id: store.id, day_of_week: hourDTO.day_of_week
                },
            });

            if (existingHour) {
                Object.assign(existingHour, hourDTO);
                await this.storeRepo.manager.save(existingHour);
            } else {
                const newHour = this.storeRepo.manager.create(StoreBusinessHours, {
                    ...hourDTO,
                    store: store,
                });
                await this.storeRepo.manager.save(newHour);
            }
        }

        return { message: 'Horários de funcionamento atualizados com sucesso!' };
    }

    async findBusinessHours(storeId: string): Promise<StoreBusinessHours[]> {
        return await this.storeRepo.manager.find(StoreBusinessHours, {
            where: { store_id: storeId },
            order: { day_of_week: 'ASC' },
        });
    }

    async resetBusinessHours(storeId: string) {
        await this.storeRepo.manager.delete(StoreBusinessHours, { store_id: storeId });
        return { message: 'Horários de funcionamento reiniciados com sucesso!' };
    }

    async updateSpecialHours(storeId: string, dto: CreateSpecialHourDTO) {
        const store = await this.findStore(storeId);

        if (!dto.is_closed && dto.opens_at >= dto.closes_at) {
            throw new BadRequestException(
                `O horário de abertura deve ser menor que o de fechamento`);
        }

        let specialHour = await this.storeRepo.manager.findOne(StoreSpecialHours, {
            where: { store_id: store.id, specific_date: dto.specific_date }
        });

        if (specialHour) {
            Object.assign(specialHour, dto);
        } else {
            specialHour = this.storeRepo.manager.create(StoreSpecialHours, {
                ...dto,
                store: store,
            });
        }

        return await this.storeRepo.manager.save(specialHour);
    }

    async findAllSpecialHours(storeId: string): Promise<StoreSpecialHours[]> {
        return await this.storeRepo.manager.find(StoreSpecialHours, {
            where: { store_id: storeId },
            order: { specific_date: 'ASC' },
        });
    }

    async removeSpecialHour(storeId: string, specialHourId: string) {
        const specialHour = await this.storeRepo.manager.findOne(StoreSpecialHours, {
            where: { id: specialHourId, store_id: storeId }
        });

        if (!specialHour) throw new NotFoundException('Horário especial não encontrado.');

        await this.storeRepo.manager.remove(specialHour);

        return { message: 'Horário especial removido com sucesso!' };
    }
}