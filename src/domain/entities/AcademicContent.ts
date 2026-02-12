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
    attachments?: { name: string, url: string, type: string, size?: number }[];
    notes?: string;
    transcription?: string; // Phase 7: Raw content for contextual chat
    googleEventId?: string; // Phase 9: Google Sync tracking
    created_at?: string;
}
