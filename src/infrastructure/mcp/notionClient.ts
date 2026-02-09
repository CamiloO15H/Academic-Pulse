import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
import { AcademicContent } from '../../domain/entities/AcademicContent';

dotenv.config();

export class NotionClient {
    private client: Client;

    constructor() {
        this.client = new Client({
            auth: process.env.NOTION_API_KEY ?? '',
        });
    }

    async createTask(content: AcademicContent, subjectName: string, databaseId?: string) {
        const targetDbId = databaseId || process.env.NOTION_DATABASE_ID;

        if (!targetDbId) {
            console.warn('NOTION_DATABASE_ID missing. Notion mirror skipped.');
            return null;
        }

        try {
            const properties: any = {
                Name: {
                    title: [{ text: { content: content.title } }],
                },
                Subject: {
                    rich_text: [{ text: { content: subjectName } }],
                },
                Type: {
                    rich_text: [{ text: { content: content.contentType || 'apunte' } }]
                },
                Source: {
                    rich_text: [{ text: { content: content.sourceType } }]
                }
            };

            if (content.deadline) {
                properties['Date'] = {
                    date: { start: new Date(content.deadline).toISOString().split('T')[0] }
                };
            }

            const children: any[] = [];

            // Add Key Insights if present
            if (content.keyInsights && content.keyInsights.length > 0) {
                children.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: { rich_text: [{ text: { content: '💡 Key Insights' } }] }
                });
                content.keyInsights.forEach(point => {
                    children.push({
                        object: 'block',
                        type: 'bulleted_list_item',
                        bulleted_list_item: { rich_text: [{ text: { content: point } }] }
                    });
                });
            }

            if (content.summary && content.summary.length > 0) {
                children.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: { rich_text: [{ text: { content: 'Resumen' } }] }
                });
                content.summary.forEach(point => {
                    children.push({
                        object: 'block',
                        type: 'bulleted_list_item',
                        bulleted_list_item: { rich_text: [{ text: { content: point } }] }
                    });
                });
            }

            // Description
            if (content.description) {
                children.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: { rich_text: [{ text: { content: 'Descripción' } }] }
                });

                const descChunks = content.description.match(/.{1,2000}/g) || [];
                descChunks.forEach(chunk => {
                    children.push({
                        object: 'block',
                        type: 'paragraph',
                        paragraph: { rich_text: [{ text: { content: chunk } }] }
                    });
                });
            }

            return await this.client.pages.create({
                parent: { database_id: targetDbId },
                properties: properties,
                children: children
            });
        } catch (error: any) {
            if (error.code === 'validation_error' && error.message.includes('property that exists')) {
                console.error('Notion Mirror Sync Error: Missing properties in your Notion Database.');
                console.error('Please ensure your database has headers: "Name" (title), "Subject" (rich_text), "Type" (rich_text), "Source" (rich_text), and "Date" (date).');
            } else {
                console.error('Notion Mirror Sync Error (Non-blocking):', error.message);
            }
            return null;
        }
    }
}
