import { ProcessTranscription } from '@/application/use-cases/ProcessTranscription';
import { MockLLMProvider } from '@/infrastructure/llm/mockLlmProvider';
import { NotionClient } from '@/infrastructure/mcp/notionClient';
import { SupabaseRepository } from '@/infrastructure/repositories/SupabaseRepository';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log('--- STARTING ACADEMIC PULSE FULL FLOW TEST ---');
    const llm = new MockLLMProvider();
    const notion = new NotionClient();
    const repo = new (class extends SupabaseRepository {
        constructor() { super({} as any); }
        async createContent(content: any) { return content; }
    })() as any;
    const useCase = new ProcessTranscription(llm, notion, repo);

    const dbId = process.env.NOTION_DATABASE_ID;
    if (!dbId) {
        console.error('NOTION_DATABASE_ID missing in .env');
        return;
    }

    const mockTranscription = `
        Clase de Arquitectura de Software. Tarea: "Entrega de Proyecto Clean Architecture" 
        Fecha: 15 de febrero de 2026. Resumen: Usar interfaces, Testeable, Independencia de DB.
    `;

    try {
        await useCase.execute(mockTranscription, dbId);
        console.log('End-to-end test completed successfully!');
    } catch (error) {
        console.error('End-to-end flow failed:', error);
    }
}

main();
