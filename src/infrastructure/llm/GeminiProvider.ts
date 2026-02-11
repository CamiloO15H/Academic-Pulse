import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMProvider, LLMResponse } from "@/application/agents/llmProvider";

export class GeminiProvider implements LLMProvider {
    private currentKeyIndex: number = 0;

    constructor() {
        const apiKeys = (process.env.GOOGLE_API_KEY || "").split(',').map(k => k.trim()).filter(Boolean);

        if (apiKeys.length === 0) {
            throw new Error("GOOGLE_API_KEY is not defined in the environment variables.");
        }

        console.log(`[GeminiProvider] Initialized with ${apiKeys.length} API keys for rotation.`);
    }

    private rotateKey() {
        const apiKeys = (process.env.GOOGLE_API_KEY || "").split(',').map(k => k.trim()).filter(Boolean);
        this.currentKeyIndex = (this.currentKeyIndex + 1) % apiKeys.length;
        console.log(`[GeminiProvider] Rotated to API Key index ${this.currentKeyIndex}`);
    }

    async generate(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const apiKeys = (process.env.GOOGLE_API_KEY || "").split(',').map(k => k.trim()).filter(Boolean);

        let lastError: any;
        const modelsToTry = ["gemini-flash-latest", "gemini-1.5-flash"];

        for (const modelName of modelsToTry) {
            console.log(`[GeminiProvider] Attempting with model: ${modelName}`);

            for (let keyAttempt = 0; keyAttempt < apiKeys.length; keyAttempt++) {
                const currentKey = apiKeys[this.currentKeyIndex];
                const genAI = new GoogleGenerativeAI(currentKey);
                const model = genAI.getGenerativeModel({ model: modelName });

                console.log(`[GeminiProvider] Using Key Index ${this.currentKeyIndex} for model ${modelName}`);

                const max503Retries = 3;
                for (let retry503 = 0; retry503 <= max503Retries; retry503++) {
                    try {
                        const result = await model.generateContent(fullPrompt);
                        const response = await result.response;
                        const text = response.text();

                        // Robust JSON Extraction & Cleaning
                        let sanitizedText = this.sanitizeResponse(text);

                        // Success!
                        return { content: sanitizedText };
                    } catch (error: any) {
                        lastError = error;
                        const status = error.status || (error.message?.includes("503") ? 503 : 0);

                        if (status === 503) {
                            if (retry503 < max503Retries) {
                                const delay = Math.pow(2, retry503) * 1000;
                                console.warn(`[GeminiProvider] 503 Service Unavailable. Model likely overloaded. Retrying in ${delay}ms... (Attempt ${retry503 + 1}/${max503Retries})`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                                continue; // Retry with the SAME key and SAME model
                            } else {
                                console.error(`[GeminiProvider] Exhausted 503 retries for model ${modelName} with current key.`);
                                // Fall through to rotate key
                            }
                        } else if (error.message?.includes("429")) {
                            console.warn(`[GeminiProvider] Quota 429 hit. Rotating key...`);
                            break; // Exit 503 loop to rotate key
                        } else {
                            // Other errors (e.g. 400, auth) - move to next key
                            console.error(`[GeminiProvider] Unexpected error: ${error.message}`);
                            break;
                        }
                    }
                }
                this.rotateKey(); // Rotate key after 503 exhaustion or 429
            }
            console.warn(`[GeminiProvider] All keys exhausted for model ${modelName}. Falling back to next model if available.`);
        }

        console.error("Gemini API Resilience Exhausted. Final Error:", lastError);
        throw new Error(`Failed to generate content after all resilience measures: ${lastError?.message || 'Unknown Error'}`);
    }

    private sanitizeResponse(text: string): string {
        let cleanText = text.replace(/```json\n?|```/g, '').trim();
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }

        return cleanText.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match: string) => {
            if (match === '\n') return '\\n';
            if (match === '\r') return '\\r';
            if (match === '\t') return '\\t';
            return '';
        });
    }
}
