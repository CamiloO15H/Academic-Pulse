import type { LLMProvider, LLMResponse } from '@/application/agents/llmProvider';

export class MockLLMProvider implements LLMProvider {
    async generate(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
        const mockData = {
            subject: "Arquitectura de Software",
            title: "Entrega de Proyecto Clean Architecture",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            summary: [
                "Implementar los 3 casos de uso principales",
                "Asegurar independencia de la base de datos",
                "Documentar el flujo de datos en un diagrama"
            ],
            description: "El profesor mencionó que la entrega final debe seguir el esquema de capas definido hoy. No se aceptarán entregas fuera de plazo."
        };

        return {
            content: JSON.stringify(mockData)
        };
    }
}
