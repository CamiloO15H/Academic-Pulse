
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const testKeys = async () => {
    const fastKeys = (process.env.GOOGLE_API_KEY || "").split(',').map(k => k.trim()).filter(Boolean);
    const heavyKeys = (process.env.GOOGLE_API_KEY_HEAVY || "").split(',').map(k => k.trim()).filter(Boolean);

    console.log(`\n🔍 Found ${fastKeys.length} FAST keys and ${heavyKeys.length} HEAVY keys.\n`);

    const checkKey = async (key: string, index: number, type: string) => {
        const genAI = new GoogleGenerativeAI(key);
        // Using lite model for potential better quota
        const modelName = "gemini-2.0-flash-lite-001"; // Exact name from list
        const model = genAI.getGenerativeModel({ model: modelName });

        try {
            const result = await model.generateContent("Test connection. Reply with 'OK'.");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ [${type} #${index}] Status: ACTIVE (${modelName}) | Response: ${text.trim().substring(0, 10)}...`);
            return true;
        } catch (error: any) {
            let status = 'UNKNOWN ERROR';
            if (error.status === 429) status = 'QUOTA EXHAUSTED (429)';
            if (error.status === 400 || error.message?.includes("400")) status = 'INVALID KEY (400)';
            if (error.status === 403 || error.message?.includes("403")) status = 'PERMISSION DENIED (403)';
            if (error.status === 404 || error.message?.includes("404")) status = 'MODEL NOT FOUND (404)';

            console.error(`❌ [${type} #${index}] Status: ${status} | Msg: ${error.message.substring(0, 100)}...`);
            return false;
        }
    };

    console.log("\n--- Testing FAST Pool ---");
    for (let i = 0; i < fastKeys.length; i++) {
        await checkKey(fastKeys[i], i, 'FAST');
        await new Promise(r => setTimeout(r, 200));
    }

    console.log("\n--- Testing HEAVY Pool ---");
    for (let i = 0; i < heavyKeys.length; i++) {
        await checkKey(heavyKeys[i], i, 'HEAVY');
        await new Promise(r => setTimeout(r, 200));
    }

    console.log("\nDone.");
};

testKeys();
