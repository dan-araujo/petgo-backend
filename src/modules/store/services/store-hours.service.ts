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
        const store = await this.storeRepo.findOne({ where: { id: storeId, deletedAt: IsNull() } });
        if (!store) throw new NotFoundException('Loja não encontrada.');
        return store;
    }


    async updateBusinessHours(storeId: string, dto: ManageBusinessHoursDTO) {
        const store = await this.findStore(storeId);
        const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

        for (const hourDTO of dto.hours) {
            if (!hourDTO.isClosed) {
                this.validateTimeRange(
                    hourDTO.opensAt,
                    hourDTO.closesAt,
                    `No dia ${hourDTO.dayOfWeek} (${dayNames[hourDTO.dayOfWeek]}})`
                );
            }

            const existingHour = await this.storeRepo.manager.findOne(StoreBusinessHours, {
                where: {
                    storeId: store.id, dayOfWeek: hourDTO.dayOfWeek
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
            where: { storeId: storeId },
            order: { dayOfWeek: 'ASC' },
        });
    }

    async resetBusinessHours(storeId: string) {
        await this.storeRepo.manager.delete(StoreBusinessHours, { store_id: storeId });
        return { message: 'Horários de funcionamento reiniciados com sucesso!' };
    }

    async updateSpecialHours(storeId: string, dto: CreateSpecialHourDTO) {
        const store = await this.findStore(storeId);

        if (!dto.isClosed) {
            this.validateTimeRange(
                dto.opensAt,
                dto.closesAt,
                `Na data ${dto.specificDate}`
            );
        }

        let specialHour: StoreSpecialHours | null = null;

        if (dto.id) {
            specialHour = await this.storeRepo.manager.findOne(StoreSpecialHours, {
                where: { id: dto.id, storeId: store.id }
            });
        }

        if (!specialHour) {
            specialHour = await this.storeRepo.manager.findOne(StoreSpecialHours, {
                where: { storeId: store.id, specificDate: dto.specificDate }
            });
        }

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
            where: { storeId: storeId },
            order: { specificDate: 'ASC' },
        });
    }

    async removeSpecialHour(storeId: string, specialHourId: string) {
        const specialHour = await this.storeRepo.manager.findOne(StoreSpecialHours, {
            where: { id: specialHourId, storeId: storeId }
        });

        if (!specialHour) throw new NotFoundException('Horário especial não encontrado.');

        await this.storeRepo.manager.remove(specialHour);

        return { message: 'Horário especial removido com sucesso!' };
    }

    private validateTimeRange(opensAt: string, closesAt: string, contextLabel?: string): void {
        const [openH, openM] = opensAt.split(':').map(Number);
        const [closeH, closeM] = closesAt.split(':').map(Number);

        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;

        if (openMinutes >= closeMinutes) {
            const prefix = contextLabel ? `${contextLabel}: ` : '';
            throw new BadRequestException(
                `${prefix} horário de abertura (${opensAt}) deve ser menor que o de fechamento (${closesAt}).`);
        }
    }
}