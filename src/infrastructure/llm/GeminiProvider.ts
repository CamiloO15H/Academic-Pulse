import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMProvider, LLMResponse } from "@/application/agents/llmProvider";

export class GeminiProvider implements LLMProvider {
    private models: any[] = [];
    private currentKeyIndex: number = 0;

    constructor() {
        const apiKeys = (process.env.GOOGLE_API_KEY || "").split(',').map(k => k.trim()).filter(Boolean);

        if (apiKeys.length === 0) {
            throw new Error("GOOGLE_API_KEY is not defined in the environment variables.");
        }

        console.log(`[GeminiProvider] Initialized with ${apiKeys.length} API keys for rotation.`);

        this.models = apiKeys.map(key => {
            const genAI = new GoogleGenerativeAI(key);
            return genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        });
    }

    private getNextModel(): any {
        const model = this.models[this.currentKeyIndex];
        console.log(`[GeminiProvider] Using API Key at index ${this.currentKeyIndex}`);
        return model;
    }

    private rotateKey() {
        this.currentKeyIndex = (this.currentKeyIndex + 1) % this.models.length;
        console.log(`[GeminiProvider] Rotated to API Key index ${this.currentKeyIndex}`);
    }

    async generate(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const maxRetriesPerKey = 1;
        const totalMaxRetries = this.models.length * (maxRetriesPerKey + 1);
        let lastError: any;

        for (let i = 0; i < totalMaxRetries; i++) {
            const currentModel = this.getNextModel();
            try {
                const result = await currentModel.generateContent(fullPrompt);
                const response = await result.response;
                const text = response.text();

                // Robust JSON Extraction
                let cleanText = text.replace(/```json\n?|```/g, '').trim();
                const firstBrace = cleanText.indexOf('{');
                const lastBrace = cleanText.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1) {
                    cleanText = cleanText.substring(firstBrace, lastBrace + 1);
                }

                const sanitizedText = cleanText.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match: string) => {
                    if (match === '\n') return '\\n';
                    if (match === '\r') return '\\r';
                    if (match === '\t') return '\\t';
                    return '';
                });

                // Success! Optional: move to next key for the *next* request to balance load
                this.rotateKey();
                return { content: sanitizedText };
            } catch (error: any) {
                lastError = error;
                if (error.message?.includes("429")) {
                    console.warn(`[GeminiProvider] Quota 429 hit for key at index ${this.currentKeyIndex}. Rotating...`);
                    this.rotateKey();
                    // Short wait before retry with next key
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }
                break;
            }
        }

        console.error("Gemini API Final Error after rotation exhaustion:", lastError);
        throw new Error(`Failed to generate content: ${lastError.message}`);
    }
}
