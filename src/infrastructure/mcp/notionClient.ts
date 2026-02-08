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
        });

        const database = response.results.find((res: any) =>
            res.title?.[0]?.plain_text === title && !res.archived
        );

        return database ? database.id : null;
    }

    async createSubjectDatabase(subjectName: string, parentPageId: string): Promise<string> {
        // Step 1: Create the database with just the title
        const createResponse = await this.client.databases.create({
            parent: { type: 'page_id', page_id: parentPageId },
            title: [{ text: { content: `${subjectName} - Academic Pulse` } }],
            properties: {
                Name: { title: {} }
            }
        } as any);

        const databaseId = createResponse.id;
        console.log(`Database created (${databaseId}). Adding properties...`);

        // Step 2: Update the schema to add other columns
        await this.client.databases.update({
            database_id: databaseId,
            properties: {
                Date: { date: {} },
                Subject: { select: {} },
                Description: { rich_text: {} }
            }
        } as any);

        // Step 3: Wait for consistency (Notion API lag)
        // Step 3: Wait for consistency (Notion API lag)
        // Step 3: Wait for consistency (Notion API lag)
        console.log(`Verifying properties for ${databaseId}...`);

        // Wait first to give Notion time
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            const dbCheck = await this.client.databases.retrieve({ database_id: databaseId }) as any;
            const properties = dbCheck.properties || {};
            const props = Object.keys(properties);
            console.log(`Properties found: ${props.join(', ')}`);
        } catch (e) {
            console.log(`Error verifying DB properties:`, e);
        }

        return databaseId;
    }

    async createTask(task: AcademicTask, databaseId: string) {
        // Helper function to create the page payload
        const createPage = async () => {
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
                        select: { name: task.subject },
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
        };

        try {
            return await createPage();
        } catch (error: any) {
            if (error.message?.includes('property that exists')) {
                console.log('⚠️ Missing properties detected. Attempting auto-repair...');

                // Auto-repair: Add the missing columns
                await this.client.databases.update({
                    database_id: databaseId,
                    properties: {
                        Date: { date: {} },
                        Subject: { select: {} },
                        Description: { rich_text: {} }
                    }
                } as any);

                console.log('✅ Database schema repaired. Retrying task creation...');
                return await createPage();
            }
            throw error;
        }
    }
}
