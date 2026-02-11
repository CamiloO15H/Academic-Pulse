export interface AcademicContent {
    id?: string;
    subjectId?: string;
    title: string;
    sourceType: 'transcription' | 'web' | 'video';
    contentType?: 'parcial' | 'taller' | 'tarea' | 'apunte';
    importanceLevel?: number; // 1-5
    deadline?: Date;
    status: 'pending' | 'completed' | 'archived';
    description: string;
    summary: string[];
    keyInsights?: string[];
    studySteps?: string[];
    classDate?: Date; // Feature 7: Date of the actual class
    created_at?: string;
}
