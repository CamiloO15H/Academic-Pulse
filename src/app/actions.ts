"use server"

import { ProcessTranscription } from '@/application/use-cases/ProcessTranscription';
import { MockLLMProvider } from '@/infrastructure/llm/mockLlmProvider';
import { NotionClient } from '@/infrastructure/mcp/notionClient';

export async function processAcademicTranscription(transcription: string) {
    console.log('Server Action: Processing transcription');

    // In a real app, we would use a Factory or DI container
    const llm = new MockLLMProvider();
    const notion = new NotionClient();
    const useCase = new ProcessTranscription(llm, notion);

    const dbId = process.env.NOTION_DATABASE_ID;
    if (!dbId) {
        throw new Error('NOTION_DATABASE_ID missing in environment');
    }

    try {
        await useCase.execute(transcription, dbId);
        return { success: true, message: 'Transcription processed and synced with Notion!' };
    } catch (error: any) {
        console.error('Action Error:', error);
        return { success: false, error: error.message };
    }
}
