import { NotionClient } from '../infrastructure/mcp/notionClient.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const notion = new NotionClient();
    const dbId = process.env.NOTION_DATABASE_ID;

    if (!dbId) {
        console.error('NOTION_DATABASE_ID is missing in .env');
        return;
    }

    try {
        console.log('Attempting to create a test page in Notion...');
        const response = await notion.createTask({
            title: 'Hello World - Academic Pulse Test',
            subject: 'AI Integration',
            description: 'This is a test task created during environment setup.',
            dueDate: new Date()
        }, dbId);

        console.log('Success! Page created with ID:', response.id);
    } catch (error) {
        console.error('Error creating page:', error);
    }
}

main();
