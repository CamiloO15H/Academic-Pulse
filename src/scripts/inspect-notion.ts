import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkNotionStructure() {
    const notion = new Client({
        auth: process.env.NOTION_API_KEY,
    });

    const dbId = process.env.NOTION_DATABASE_ID;
    console.log('Checking database:', dbId);

    try {
        const response = await notion.databases.retrieve({ database_id: dbId! });
        console.log('Database Title:', response.title[0]?.plain_text);
        console.log('Parent Information:', JSON.stringify(response.parent, null, 2));
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkNotionStructure();
