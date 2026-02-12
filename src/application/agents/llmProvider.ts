export interface LLMResponse {
    content: string | object | any[];
}

export interface FilePart {
    inlineData: {
        data: string; // base64
        mimeType: string;
    };
}

export interface LLMProvider {
    generate(prompt: string, systemPrompt?: string, isJson?: boolean, files?: FilePart[]): Promise<LLMResponse>;
}
