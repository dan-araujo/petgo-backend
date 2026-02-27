import { AppointmentStatus } from "../enums/appointment-status.enum";

export const APPOINTMENT_TRANSITIONS_RULES: Record<AppointmentStatus, AppointmentStatus[]> = {
    [AppointmentStatus.PENDING]: [
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.CANCELLED
    ],
    [AppointmentStatus.SCHEDULED]: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW
    ],
    [AppointmentStatus.CONFIRMED]: [
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW
    ],
    [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED],
    [AppointmentStatus.COMPLETED]: [],
    [AppointmentStatus.CANCELLED]: [],
    [AppointmentStatus.NO_SHOW]: [],
};