import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMProvider, LLMResponse } from "@/application/agents/llmProvider";

export class GeminiProvider implements LLMProvider {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY is not defined in the environment variables.");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-flash-latest as verified in previous sessions
        this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    }

    async generate(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

        try {
            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            // Clean up JSON if necessary
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const content = jsonMatch ? jsonMatch[0] : text;

            return {
                content: content
            };
        } catch (error: any) {
            console.error("Gemini API Error:", error);
            throw new Error(`Failed to generate content: ${error.message}`);
        }
    }
}
