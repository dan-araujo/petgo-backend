import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateAppointmentDTO {
    @IsUUID('4', { message: 'Id da loja inválido' })
    @IsNotEmpty({ message: 'A loja é obrigatória' })
    storeId: string;

    @IsUUID('4', { message: 'Id do serviço inválido' })
    @IsNotEmpty({ message: 'O serviço é obrigatório' })
    serviceId: string;

    @IsOptional()
    @IsUUID('4', { message: 'Id do veterinário inválido' })
    veterinaryId: string;

    @IsDateString({}, { message: 'A data do agendamento deve estar no formato ISO 8601 (ex: 2026-02-26T14:00:00Z)' })
    @IsNotEmpty({ message: 'O horário do agendamento é obrigatório' })
    scheduledAt: string;
}
