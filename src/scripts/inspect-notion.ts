import { Client } from '@notionhq/client';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkNotionStructure() {
    const notion = new Client({
        auth: process.env.NOTION_API_KEY,
    });

    const id = 'cfd553ffc2694ec09626d6e4b5d6d94a';
    console.log('Inspecting Database:', id);

    try {
        const response: any = await notion.databases.retrieve({ database_id: id });
        console.log('Database Title:', response.title[0]?.plain_text);
        if (response.properties) {
            console.log('Property Keys:', Object.keys(response.properties));
            console.log('Full Properties JSON:', JSON.stringify(response.properties, null, 2));
        } else {
            console.log('Properties object is missing/empty');
        }
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkNotionStructure();
