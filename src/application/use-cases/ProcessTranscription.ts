import { LLMProvider } from '@/application/agents/llmProvider';
import { NotionClient } from '@/infrastructure/mcp/notionClient';
import { SYSTEM_PROMPT } from '@/application/agents/prompts';
import { AcademicTask } from '@/domain/entities/AcademicTask';

export class ProcessTranscription {
    constructor(
        private llmProvider: LLMProvider,
        private notionClient: NotionClient
    ) { }

    async execute(transcription: string, databaseId: string): Promise<void> {
        console.log('--- Analyzing transcription with AI ---');
        const response = await this.llmProvider.generate(transcription, SYSTEM_PROMPT);

        const extractedData = JSON.parse(response.content);

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
        await this.notionClient.createTask(task, databaseId);
        console.log('--- Process completed successfully ---');
    }
}
