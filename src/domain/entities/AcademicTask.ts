export interface AcademicTask {
    title: string;
    subject: string;
    type: 'Parcial' | 'Taller' | 'Tarea' | 'Resumen';
    deadline?: Date;
    description: string;
    summary: string[];
}
