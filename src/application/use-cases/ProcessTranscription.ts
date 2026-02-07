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

        // Find or use default database
        let targetDbId = defaultDatabaseId;
        const dbTitle = `${subject} - Academic Pulse`;
        const exists = await this.notionClient.findDatabaseByTitle(dbTitle);

        if (exists) {
            targetDbId = exists;
            console.log(`Using existing database for ${subject}: ${targetDbId}`);
        } else {
            console.log(`Database for ${subject} not found. Attempting to create one...`);
            const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
            if (parentPageId) {
                targetDbId = await this.notionClient.createSubjectDatabase(subject, parentPageId);
                console.log(`Created new database for ${subject}: ${targetDbId}`);
            } else {
                console.warn('NOTION_PARENT_PAGE_ID missing. Falling back to default database.');
            }
        }

        const task: AcademicTask = {
            title: extractedData.title,
            subject: extractedData.subject,
            description: extractedData.description,
            summary: extractedData.summary || []
        };

        if (extractedData.dueDate) {
            task.dueDate = new Date(extractedData.dueDate);
        }

        console.log('--- Syncing with Notion ---');
        await this.notionClient.createTask(task, targetDbId);
        console.log('--- Process completed successfully ---');

        return { status: 'SUCCESS', message: 'Procesado y sincronizado con éxito.' };
    }
}
