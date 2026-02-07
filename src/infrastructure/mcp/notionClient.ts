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
