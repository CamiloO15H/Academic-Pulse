
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const testKeys = async () => {
    const fastKeys = (process.env.GOOGLE_API_KEY || "").split(',').map(k => k.trim()).filter(Boolean);
    const heavyKeys = (process.env.GOOGLE_API_KEY_HEAVY || "").split(',').map(k => k.trim()).filter(Boolean);

    console.log(`\n🔍 Found ${fastKeys.length} FAST keys and ${heavyKeys.length} HEAVY keys.\n`);

    const modelsToTest = [
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash-8b-latest",
        "gemini-2.0-flash-lite-preview-02-05",
        "gemini-2.0-flash-lite-001",
        "gemini-2.0-flash",
        "gemini-3-flash-preview"
    ];

    const checkKey = async (key: string, index: number, type: string, modelName: string) => {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });

        try {
            const result = await model.generateContent("Test connection. Reply with 'OK'.");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ [${type} #${index}] ${modelName}: ACTIVE | Response: ${text.trim().substring(0, 10)}...`);
            return true;
        } catch (error: any) {
            let status = 'UNKNOWN ERROR';
            if (error.status === 429) status = 'QUOTA EXHAUSTED (429)';
            if (error.status === 400 || error.message?.includes("400")) status = 'INVALID KEY (400) / BAD REQUEST';
            if (error.status === 403 || error.message?.includes("403")) status = 'PERMISSION DENIED (403)';
            if (error.status === 404 || error.message?.includes("404")) status = 'MODEL NOT FOUND (404)';

            console.error(`❌ [${type} #${index}] ${modelName}: ${status}`);
            return false;
        }
    };

    console.log("\n--- Testing Specific Models ---");

    if (heavyKeys.length > 0) {
        console.log("Testing HEAVY Key #0:");
        for (const m of modelsToTest) {
            await checkKey(heavyKeys[0], 0, 'HEAVY', m);
        }
    }

    if (fastKeys.length > 0) {
        console.log("Testing FAST Key #0:");
        for (const m of modelsToTest) {
            await checkKey(fastKeys[0], 0, 'FAST', m);
        }
    }

    console.log("\nDone.");
};

testKeys();
