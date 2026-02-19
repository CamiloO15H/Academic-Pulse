import { getColombiaNow } from './date';

export type Subject = 'Arquitectura' | 'Estadística' | 'Metodología' | 'Admin. de BD' | 'Gestión' | 'Inv. Operaciones e Informática Avanzada' | 'Seminario' | 'BD' | 'General';

export function getSubjectBySchedule(): Subject {
    const now = getColombiaNow();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...
    const hour = now.getHours();

    switch (day) {
        case 1: // Lunes
            return 'Arquitectura';
        case 2: // Martes
            return hour < 14 ? 'Gestión' : 'Inv. Operaciones e Informática Avanzada';
        case 4: // Jueves
            return 'Inv. Operaciones e Informática Avanzada';
        case 5: // Viernes
            return hour < 13 ? 'Arquitectura' : 'Seminario';
        case 6: // Sábado
            return 'BD';
        default:
            return 'General';
    }
}
