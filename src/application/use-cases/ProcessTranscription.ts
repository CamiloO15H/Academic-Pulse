import { LLMProvider } from '@/application/agents/llmProvider';
import { NotionClient } from '@/infrastructure/mcp/notionClient';
import { SupabaseRepository } from '@/infrastructure/repositories/SupabaseRepository';
import { SYSTEM_PROMPT } from '@/application/agents/prompts';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import { getSubjectBySchedule } from '@/application/utils/schedule';

export class ProcessTranscription {
    constructor(
        private llmProvider: LLMProvider,
        private notionClient: NotionClient,
        private supabaseRepository: SupabaseRepository
    ) { }

    async execute(transcription: string, defaultDatabaseId: string, confirmedSubject?: string, userId?: string, subjectId?: string, classDate?: Date): Promise<{ status: string; data?: AcademicContent; message?: string }> {
        const scheduledSubject = getSubjectBySchedule();
        const contextualPrompt = `Contexto Horario: Hoy es un día para la materia "${scheduledSubject}". \n\nTranscripción: ${transcription}
        
        INSTRUCCIONES ADICIONALES:
        - Si el usuario ya conoció la materia, úsala.
        - Extrae "key_insights": Una lista de los puntos clave más importantes (máximo 3).
        - Extrae "study_steps": Una lista de pasos sugeridos para estudiar este tema.
        - Source Type es "transcription".
        `;

        console.log('--- Analyzing transcription with AI for SaaS ---');
        const response = await this.llmProvider.generate(contextualPrompt, SYSTEM_PROMPT);

        // Robust JSON Extraction & Sanitization
        let cleanContent = this.sanitizeJsonResponse(response.content);

        let extractedData;
        try {
            extractedData = JSON.parse(cleanContent);
        } catch (e: any) {
            console.error('Failed to parse LLM JSON. Content was:', cleanContent);
            throw new Error(`Error parsing AI response: ${e.message}`);
        }

        const content: AcademicContent = {
            subjectId: subjectId || undefined,
            title: extractedData.title,
            sourceType: 'transcription',
            contentType: extractedData.type || 'apunte',
            importanceLevel: extractedData.importance || 1,
            deadline: extractedData.deadline ? new Date(extractedData.deadline) : undefined,
            status: 'pending',
            description: extractedData.description,
            summary: extractedData.summary || [],
            keyInsights: extractedData.key_insights || [],
            studySteps: extractedData.study_steps || [],
            classDate: classDate || new Date() // Feature 7: Use provided class date or fallback to now
        };

        // If subjectId is missing, we might need to resolve it by name from Supabase, 
        // but for now we assume the UI passes a valid subjectId or we fail gracefully / create a default.
        // The architecture says: "Dashboard loads subjects, user selects card -> subjectId passed".

        if (!content.subjectId) {
            console.warn('Subject ID missing in SaaS flow. Transcription might be orphaned or require manual subject mapping.');
            // In a real scenario, we might look up the subject by name here using repository
        }

        console.log('--- Syncing with Supabase (Primary Authenticated) ---');
        // Repository instance already has auth client injected in actions.ts
        const savedContent = await this.supabaseRepository.createContent(content);

        console.log('--- Syncing with Notion (Mirror) ---');
        // Notion sync is fire-and-forget
        const subjectName = confirmedSubject || 'General';

        this.notionClient.createTask(content, subjectName, defaultDatabaseId).catch(err => {
            console.error('Notion async mirror failed:', err.message);
        });
        return { status: 'SUCCESS', data: savedContent, message: 'Contenido procesado y guardado en tu cuenta.' };
    }

    private sanitizeJsonResponse(raw: string): string {
        // 1. Remove Markdown code blocks and trim
        let clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();

        // 2. Clear invisible control characters (\x00-\x1F) except for allowed whitespace
        // Also handle actual newlines that Gemini might put inside a string value
        clean = clean.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, '');

        // 3. Extract content between first { and last } to remove extra conversational text
        const firstBrace = clean.indexOf('{');
        const lastBrace = clean.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            clean = clean.substring(firstBrace, lastBrace + 1);
        }

        return clean;
    }
}
