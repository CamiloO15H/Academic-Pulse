"use server"

import { ProcessTranscription } from '@/application/use-cases/ProcessTranscription';
import { GeminiProvider } from '@/infrastructure/llm/GeminiProvider';
import { NotionClient } from '@/infrastructure/mcp/notionClient';

export async function processAcademicTranscription(transcription: string, confirmedSubject?: string) {
    console.log('Server Action: Processing transcription');

    const llm = new GeminiProvider();
    const notion = new NotionClient();
    const useCase = new ProcessTranscription(llm, notion);

    const dbId = process.env.NOTION_DATABASE_ID;
    if (!dbId) {
        throw new Error('NOTION_DATABASE_ID missing in environment');
    }

    try {
        const result = await useCase.execute(transcription, dbId, confirmedSubject);
        return {
            success: result.status === 'SUCCESS',
            status: result.status,
            data: result.data,
            message: result.message
        };
    } catch (error: any) {
        console.error('Action Error:', error);
        return { success: false, status: 'ERROR', error: error.message };
    }
}
