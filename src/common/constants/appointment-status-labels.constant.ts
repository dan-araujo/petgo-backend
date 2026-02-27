import { AppointmentStatus } from "../enums";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: 'Aguardando Aprovação',
    [AppointmentStatus.SCHEDULED]: 'Agendado',
    [AppointmentStatus.CONFIRMED]: 'Confirmado',
    [AppointmentStatus.IN_PROGRESS]: 'Em Atendimento',
    [AppointmentStatus.COMPLETED]: 'Concluído',
    [AppointmentStatus.CANCELLED]: 'Cancelado',
    [AppointmentStatus.NO_SHOW]: 'Não Compareceu',
};

export const APPOINTMENT_STATUS_DESCRIPTIONS: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: 'Sua solicitação foi enviada e aguarda a confirmação do profissional.',
    [AppointmentStatus.SCHEDULED]: 'O horário foi reservado no sistema.',
    [AppointmentStatus.CONFIRMED]: 'Tudo certo! O profissional confirmou sua presença.',
    [AppointmentStatus.IN_PROGRESS]: 'O serviço está sendo executado no momento.',
    [AppointmentStatus.COMPLETED]: 'O atendimento foi finalizado com sucesso.',
    [AppointmentStatus.CANCELLED]: 'Este agendamento foi cancelado e o horário liberado.',
    [AppointmentStatus.NO_SHOW]: 'O cliente não compareceu ao horário agendado.',
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: '#FFA500', // Laranja
    [AppointmentStatus.SCHEDULED]: '#3498db', // Azul
    [AppointmentStatus.CONFIRMED]: '#2ecc71', // Verde
    [AppointmentStatus.IN_PROGRESS]: '#9b59b6', // Roxo
    [AppointmentStatus.COMPLETED]: '#27ae60', // Verde Escuro
    [AppointmentStatus.CANCELLED]: '#e74c3c', // Vermelho
    [AppointmentStatus.NO_SHOW]: '#95a5a6', // Cinza
};