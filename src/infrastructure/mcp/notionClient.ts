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
        // Standardize common variations
        if (lower.includes('metodología') || lower.includes('investigación') || lower.includes('seminario')) {
            return 'Metodología y Seminario de Investigación';
        }
        if (lower.includes('arquitectura')) return 'Arquitectura de Computadores';
        if (lower.includes('base de datos') || lower.includes('bd')) return 'Bases de Datos';
        if (lower.includes('gestión')) return 'Gestión Académica';

        // Default: Title Case
        return subject.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }

    async createTask(task: AcademicTask, databaseId?: string) {
        // Use provided ID or fallback to env
        const targetId = databaseId || process.env.NOTION_DATABASE_ID;

        if (!targetId) {
            throw new Error('NOTION_DATABASE_ID is not defined in environment variables.');
        }

        const normalizedSubject = this.normalizeSubject(task.subject);

        try {
            let fullDescription = `${task.summary.map(s => `• ${s}`).join('\n')} \n\n${task.description} `;
            if (fullDescription.length > 2000) {
                fullDescription = fullDescription.substring(0, 1997) + '...';
            }

            return await this.client.pages.create({
                parent: { database_id: targetId },
                properties: {
                    Name: {
                        title: [{ text: { content: task.title } }],
                    },
                    Subject: {
                        select: { name: normalizedSubject },
                    },
                    Type: {
                        select: { name: task.type },
                    },
                    Status: {
                        status: { name: 'Not started' },
                    },
                    Description: {
                        rich_text: [
                            { text: { content: fullDescription } }
                        ],
                    },
                    ...(task.deadline && {
                        Deadline: {
                            date: { start: task.deadline.toISOString() },
                        },
                    }),
                },
            } as any);
        } catch (error: any) {
            console.error('Notion Task Creation Error:', error.message);
            throw error;
        }
    }
}
