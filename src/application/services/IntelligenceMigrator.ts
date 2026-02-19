import { SupabaseRepository } from '@/infrastructure/repositories/SupabaseRepository';
import { GeminiProvider } from '@/infrastructure/llm/GeminiProvider';
import { INTELLIGENCE_MIGRATION_PROMPT } from '@/application/agents/prompts';
import { CalendarEvent } from '@/domain/entities/CalendarEvent';
import { getColombiaNow } from '@/application/utils/date';

export class IntelligenceMigrator {
    private repo: SupabaseRepository;
    private gemini: GeminiProvider;

    constructor(repo: SupabaseRepository) {
        this.repo = repo;
        this.gemini = new GeminiProvider('heavy');
    }

    async migrate(userId: string): Promise<{ contentUpdated: number, eventsUpdated: number }> {
        // Migration started

        // 1. Audit Academic Content
        const incompleteContent = await this.repo.getIncompleteAcademicContent();
        // Incomplete content found

        let contentUpdated = 0;
        let eventsUpdatedCount = 0;
        const semesterStartDate = '03 de febrero de 2026';
        const currentYear = new Date().getFullYear().toString();

        for (const content of incompleteContent) {
            if (!content.transcription) continue;

            try {
                const prompt = INTELLIGENCE_MIGRATION_PROMPT
                    .replace('{{YEAR}}', currentYear)
                    .replace('{{START_DATE}}', semesterStartDate);

                const response = await this.gemini.generate(content.transcription, prompt, true);
                const result = typeof response.content === 'string' ? JSON.parse(response.content) : response.content;

                // Update the original content - prioritizing AI results for gaps
                await this.repo.updateContent(content.id!, {
                    summary: result.summary || content.summary,
                    keyInsights: (result.key_insights && result.key_insights.length > 0) ? result.key_insights : content.keyInsights,
                    studySteps: (result.study_steps && result.study_steps.length > 0) ? result.study_steps : content.studySteps
                });

                // Check for associated events to enrich weights
                const subjectEvents = await this.repo.getIncompleteCalendarEvents(userId);
                const relatedEvents = subjectEvents.filter(e => e.subjectId === content.subjectId);

                for (const event of relatedEvents) {
                    // Refined Fuzzy match: check overlap, substring, or if it's the only exam-like thing
                    const aiMatch = result.events?.find((ae: any) => {
                        const aiTitle = ae.title.toLowerCase();
                        const evtTitle = event.title.toLowerCase();

                        // Overlap or inclusion
                        if (aiTitle.includes(evtTitle) || evtTitle.includes(aiTitle)) return true;

                        // Jaccard-ish simple word overlap
                        const aiWords = aiTitle.split(/\s+/).filter((w: string) => w.length > 3);
                        const evtWords = evtTitle.split(/\s+/).filter((w: string) => w.length > 3);
                        const intersection = aiWords.filter((w: string) => evtWords.includes(w));
                        if (intersection.length > 0) return true;

                        // Typo handling (first 3 chars + same subject is usually enough)
                        return aiTitle.substring(0, 3) === evtTitle.substring(0, 3);
                    });

                    if (aiMatch) {
                        await this.repo.updateCalendarEvent(event.id!, {
                            weight: aiMatch.weight || event.weight,
                            description: aiMatch.description || ((event.description?.length ?? 0) < 10 ? aiMatch.description : event.description)
                        });
                        eventsUpdatedCount++;
                    }
                }

                contentUpdated++;
            } catch (err) {
                console.error(`[IntelligenceMigrator] Failed to process content ${content.id}:`, err);
            }
        }

        // 2. Audit Calendar Events (General cleanup for events without weights)
        const remainingIncompleteEvents = await this.repo.getIncompleteCalendarEvents(userId);

        // Note: For events without a direct syllabus source, we might just leave them 
        // or do a lighter AI call. For now, focusing on syllabus-driven enrichment.

        return { contentUpdated, eventsUpdated: eventsUpdatedCount };
    }
}
