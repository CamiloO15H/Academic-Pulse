import { LLMProvider } from '@/application/agents/llmProvider';
import { NotionClient } from '@/infrastructure/mcp/notionClient';
import { SYSTEM_PROMPT } from '@/application/agents/prompts';
import { AcademicTask } from '@/domain/entities/AcademicTask';
import { getSubjectBySchedule } from '@/application/utils/schedule';

export class ProcessTranscription {
    constructor(
        private llmProvider: LLMProvider,
        private notionClient: NotionClient
    ) { }

    async execute(transcription: string, defaultDatabaseId: string, confirmedSubject?: string): Promise<{ status: string; data?: AcademicTask; message?: string }> {
        const scheduledSubject = getSubjectBySchedule();
        const contextualPrompt = `Contexto Horario: Hoy es un día para la materia "${scheduledSubject}". \n\nTranscripción: ${transcription}`;

        console.log('--- Analyzing transcription with AI ---');
        const response = await this.llmProvider.generate(contextualPrompt, SYSTEM_PROMPT);

        const extractedData = JSON.parse(response.content);

        // Use confirmed subject if provided, otherwise detection results
        const subject = confirmedSubject || extractedData.subject;

        // Confidence Check (skipped if confirmedSubject is provided)
        if (!confirmedSubject && extractedData.confidence < 80) {
            console.log(`Confidence low (${extractedData.confidence}%). Requiring confirmation.`);
            return {
                status: 'REQUIRES_CONFIRMATION',
                data: extractedData,
                message: 'La IA no está segura de la materia. Por favor confirma o selecciona una.'
            };
        }

        console.log(`Detected Subject: ${subject} (${extractedData.confidence}%)`);

        const task: AcademicTask = {
            title: extractedData.title,
            subject: subject,
            description: extractedData.description,
            summary: extractedData.summary || []
        };

        if (extractedData.dueDate) {
            task.dueDate = new Date(extractedData.dueDate);
        }

        console.log('--- Syncing with Notion ---');
        // Use defaultDatabaseId which is NOTION_DATABASE_ID from actions.ts
        await this.notionClient.createTask(task, defaultDatabaseId);
        console.log('--- Process completed successfully ---');

        return { status: 'SUCCESS', message: 'Procesado y sincronizado con éxito.' };
    }
}
