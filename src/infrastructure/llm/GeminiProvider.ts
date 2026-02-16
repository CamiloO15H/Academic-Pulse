
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMProvider, LLMResponse, FilePart } from "@/application/agents/llmProvider";

export class GeminiProvider implements LLMProvider {
    private currentKeyIndex: number = 0;
    private pool: 'fast' | 'heavy' = 'fast';

    constructor(pool: 'fast' | 'heavy' = 'fast') {
        this.pool = pool;
        const keysVar = pool === 'heavy' ? (process.env.GOOGLE_API_KEY_HEAVY || process.env.GOOGLE_API_KEY) : process.env.GOOGLE_API_KEY;
        const apiKeys = (keysVar || "").split(',').map(k => k.trim()).filter(Boolean);

        if (apiKeys.length === 0) {
            console.warn(`[GeminiProvider] No keys found for pool ${pool}. Fallback might fail.`);
        }

        // Randomize start index to ensure distribution across stateless Server Action calls
        this.currentKeyIndex = Math.floor(Math.random() * apiKeys.length);
        // pool initialized
    }

    private rotateKey() {
        const keysVar = this.pool === 'heavy' ? (process.env.GOOGLE_API_KEY_HEAVY || process.env.GOOGLE_API_KEY) : process.env.GOOGLE_API_KEY;
        const apiKeys = (keysVar || "").split(',').map(k => k.trim()).filter(Boolean);
        this.currentKeyIndex = (this.currentKeyIndex + 1) % apiKeys.length;
        // key rotated
    }

    async generate(prompt: string, systemPrompt?: string, isJson = true, files?: FilePart[]): Promise<LLMResponse> {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

        const getApiKeys = () => {
            const keysVar = this.pool === 'heavy' ? (process.env.GOOGLE_API_KEY_HEAVY || process.env.GOOGLE_API_KEY) : process.env.GOOGLE_API_KEY;
            return (keysVar || "").split(',').map(k => k.trim()).filter(Boolean);
        };
        let apiKeys = getApiKeys();

        let lastError: any;
        // Priority: Experimental (3.0 - Verified Active) -> Cost/Quota (Lite) -> Stability (2.0)
        const modelsToTry = [
            "gemini-3-flash-preview",
            "gemini-2.0-flash-lite-preview-02-05", // Try specific preview if available
            "gemini-2.0-flash-lite-001",
            "gemini-2.0-flash"
        ];

        for (const modelName of modelsToTry) {
            // attempting with model
            let hardLimitCount = 0;

            // Try all keys in a cycle for this model
            for (let keyAttempt = 0; keyAttempt < apiKeys.length; keyAttempt++) {
                // If this specific model has hit hard limits on 2 different keys, skip this model entirely
                if (hardLimitCount >= 2) {
                    console.warn(`[GeminiProvider] ⏩ Model ${modelName} seems exhausted globally (hard limit hit on ${hardLimitCount} keys). Skipping model.`);
                    break;
                }

                // FORCE ROTATION on every keyAttempt to distribute load early
                this.rotateKey();

                const currentKey = apiKeys[this.currentKeyIndex];
                const genAI = new GoogleGenerativeAI(currentKey);
                const model = genAI.getGenerativeModel({ model: modelName });

                // using key index

                const maxRetries = 3;
                const baseRetryDelay = 3000; // 3s base for 429/quota issues

                for (let attempt = 0; attempt <= maxRetries; attempt++) {
                    try {
                        const contentParts: any[] = [fullPrompt];
                        if (files && files.length > 0) {
                            files.forEach(file => contentParts.push(file));
                        }

                        const result = await model.generateContent(contentParts);
                        const response = await result.response;
                        const text = response.text();

                        // MANDATORY RATE LIMITER DELAY (1s) to respect free tier RPM
                        // success
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        if (!isJson) return { content: text };

                        let sanitizedText = this.sanitizeResponse(text);
                        try {
                            const parsed = JSON.parse(sanitizedText);
                            return { content: parsed };
                        } catch (e) {
                            console.warn(`[GeminiProvider] JSON parse failed for ${modelName}, returning sanitized string`);
                            return { content: sanitizedText };
                        }
                    } catch (error: any) {
                        lastError = error;
                        const errorMessage = error.message || "";
                        const status = error.status || (errorMessage.includes("503") ? 503 : (errorMessage.includes("429") ? 429 : 0));

                        // DETECT HARD LIMITS (Daily / Project Limit / Restriction)
                        const isHardLimit = errorMessage.includes("limit: 0") ||
                            errorMessage.includes("Daily Limit") ||
                            errorMessage.includes("Quota exceeded for metric") ||
                            errorMessage.includes("User rate limit exceeded");

                        if (status === 429) {
                            console.warn(`[GeminiProvider] ⚠️ 429 Detail for Key ${this.currentKeyIndex} on ${modelName}: ${errorMessage}`);
                        }

                        if (status === 404) {
                            console.warn(`[GeminiProvider] ❓ 404 Detail for Key ${this.currentKeyIndex} on ${modelName}: ${errorMessage}`);
                        }

                        if (status === 429 && isHardLimit) {
                            hardLimitCount++;
                            console.error(`[GeminiProvider] 🛑 HARD LIMIT hit for Key index ${this.currentKeyIndex} on ${modelName}. (Count: ${hardLimitCount}/2)`);
                            break; // Move to next KEY immediately
                        }

                        // If it's a transient error (503, 429 RPM, or network), retry with substantial delay
                        if ((status === 503 || status === 429 || status === 0) && attempt < maxRetries) {
                            const currentDelay = baseRetryDelay * (attempt + 1);
                            console.warn(`[GeminiProvider] ⚠️ Error ${status || 'Network'} (RPM/Transient) on attempt ${attempt + 1}. Retrying in ${currentDelay}ms...`);
                            await new Promise(resolve => setTimeout(resolve, currentDelay));
                            continue;
                        }

                        // If retries exhausted or non-transient error, move to NEXT KEY
                        console.error(`[GeminiProvider] ❌ Key index ${this.currentKeyIndex} failed for ${modelName}: ${errorMessage.substring(0, 100)}...`);
                        break;
                    }
                }
            }
        }

        console.error("[GeminiProvider] 💀 Total Resilience Exhausted.");
        throw new Error(`AI Pulse Error: No se pudo procesar la solicitud tras agotar todas las llaves y modelos. Detalle: ${lastError?.message}`);
    }

    private sanitizeResponse(text: string): string {
        let cleanText = text.replace(/```json\n?|```/g, '').trim();

        const firstBrace = cleanText.indexOf('{');
        const firstBracket = cleanText.indexOf('[');
        const lastBrace = cleanText.lastIndexOf('}');
        const lastBracket = cleanText.lastIndexOf(']');

        // Find the earliest starting marker
        let start = -1;
        if (firstBrace !== -1 && firstBracket !== -1) start = Math.min(firstBrace, firstBracket);
        else if (firstBrace !== -1) start = firstBrace;
        else if (firstBracket !== -1) start = firstBracket;

        // Find the latest ending marker
        let end = -1;
        if (lastBrace !== -1 && lastBracket !== -1) end = Math.max(lastBrace, lastBracket);
        else if (lastBrace !== -1) end = lastBrace;
        else if (lastBracket !== -1) end = lastBracket;

        if (start !== -1 && end !== -1 && end > start) {
            cleanText = cleanText.substring(start, end + 1);
        }

        return cleanText.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');
    }
}
