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

    async findDatabaseByTitle(title: string): Promise<string | null> {
        const response = await this.client.search({
            query: title,
            filter: { property: 'object', value: 'database' },
        });

        const database = response.results.find((res: any) =>
            res.title?.[0]?.plain_text === title && !res.archived
        );

        return database ? database.id : null;
    }

    async createSubjectDatabase(subjectName: string, parentPageId: string): Promise<string> {
        const response = await this.client.databases.create({
            parent: { page_id: parentPageId },
            title: [{ text: { content: `${subjectName} - Academic Pulse` } }],
            properties: {
                Name: { title: {} },
                Date: { date: {} },
                Subject: { select: {} },
                Description: { rich_text: {} }
            },
        });
        return response.id;
    }

    async createTask(task: AcademicTask, databaseId: string) {
        return await this.client.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Name: {
                    title: [{ text: { content: task.title } }],
                },
                Subject: {
                    select: { name: task.subject },
                },
                Description: {
                    rich_text: [
                        { text: { content: `${task.summary.map(s => `• ${s}`).join('\n')} \n\n${task.description} ` } }
                    ],
                },
                ...(task.dueDate && {
                    Date: {
                        date: { start: task.dueDate.toISOString() },
                    },
                }),
            },
        });
    }
}
