import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMResponse } from '@/application/agents/llmProvider';

export class GeminiProvider implements LLMProvider {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error('CRITICAL: GOOGLE_API_KEY is missing from environment variables');
            throw new Error('GOOGLE_API_KEY is not defined in the environment.');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    }

    async generate(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
        try {
            const chat = this.model.startChat({
                history: systemPrompt ? [
                    {
                        role: 'user',
                        parts: [{ text: systemPrompt }],
                    },
                    {
                        role: 'model',
                        parts: [{ text: 'Entiendo mis instrucciones del sistema. Estoy listo para procesar la información académica con alta precisión.' }],
                    }
                ] : [],
                generationConfig: {
                    responseMimeType: 'application/json',
                },
            });

            const result = await chat.sendMessage(prompt);
            const responseText = result.response.text();

            return {
                content: responseText
            };
        } catch (error: any) {
            console.error('Error calling Gemini API:', error);
            throw new Error(`Gemini API failed: ${error.message}`);
        }
    }
}
