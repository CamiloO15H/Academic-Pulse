import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { AcademicTask } from '@/domain/entities/AcademicTask';

dotenv.config();

export class NotionClient {
    private client: Client;

    constructor() {
        this.client = new Client({
            auth: process.env.NOTION_API_KEY ?? '',
        });
    }

    private normalizeSubject(subject: string): string {
        const lower = subject.toLowerCase();
        if (lower.includes('metodología') || lower.includes('investigación') || lower.includes('seminario')) {
            return 'Metodología y Seminario de Investigación';
        }
        return subject;
    }

    async findDatabaseByTitle(title: string): Promise<string | null> {
        const normalizedTitle = this.normalizeSubject(title);
        const searchTitle = `${normalizedTitle} - Academic Pulse`;

        const response = await this.client.search({
            query: searchTitle,
            filter: { property: 'object', value: 'database' }
        });

        const database = response.results.find((res: any) =>
            res.title?.[0]?.plain_text === searchTitle && !res.archived
        );

        return database ? database.id : null;
    }

    async createSubjectDatabase(subjectName: string, parentPageId: string): Promise<string> {
        const normalized = this.normalizeSubject(subjectName);
        const title = `${normalized} - Academic Pulse`;

        // Step 1: Create the database with the core schema immediately
        // Simplify to just Name for creation if update is more stable, 
        // but user asked for "Simple" so we'll try a balance.
        const response = await this.client.databases.create({
            parent: { type: 'page_id', page_id: parentPageId },
            title: [{ text: { content: title } }],
            properties: {
                Name: { title: {} },
                Date: { date: {} },
                Subject: { select: {} },
                Description: { rich_text: {} }
            }
        } as any);

        console.log(`Created new database: ${title} (${response.id})`);
        return response.id;
    }

    async createTask(task: AcademicTask, databaseId: string) {
        const normalizedSubject = this.normalizeSubject(task.subject);

        try {
            let fullDescription = `${task.summary.map(s => `• ${s}`).join('\n')} \n\n${task.description} `;
            if (fullDescription.length > 2000) {
                fullDescription = fullDescription.substring(0, 1997) + '...';
            }

            return await this.client.pages.create({
                parent: { database_id: databaseId },
                properties: {
                    Name: {
                        title: [{ text: { content: task.title } }],
                    },
                    Subject: {
                        select: { name: normalizedSubject },
                    },
                    Description: {
                        rich_text: [
                            { text: { content: fullDescription } }
                        ],
                    },
                    ...(task.dueDate && {
                        Date: {
                            date: { start: task.dueDate.toISOString() },
                        },
                    }),
                },
            } as any);
        } catch (error: any) {
            if (error.message?.includes('property that exists')) {
                console.log('⚠️ Notion schema latency detected.');
                throw new Error(`¡Base de datos preparada! Por favor, espera 10 segundos y vuelve a procesar para que Notion sincronice los cambios.`);
            }
            throw error;
        }
    }
}
