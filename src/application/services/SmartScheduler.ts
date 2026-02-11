import { CalendarEvent } from '@/domain/entities/CalendarEvent';
import { GeminiProvider } from '@/infrastructure/llm/GeminiProvider';
import { ACADEMIC_STUDY_SUGGESTION_PROMPT } from '@/application/agents/prompts';

export class SmartScheduler {
    private gemini: GeminiProvider;

    constructor() {
        this.gemini = new GeminiProvider('heavy');
    }

    /**
     * Identify high-weight (>15%) or "Exam" events.
     */
    analyzeLoad(events: CalendarEvent[]): CalendarEvent[] {
        return events.filter(e => {
            const isHighWeight = (e.weight || 0) >= 5;
            const isExam = e.title.toLowerCase().includes('examen') ||
                e.title.toLowerCase().includes('parcial') ||
                e.title.toLowerCase().includes('taller') ||
                e.title.toLowerCase().includes('tarea') ||
                e.title.toLowerCase().includes('entrega') ||
                e.description?.toLowerCase().includes('examen') ||
                e.description?.toLowerCase().includes('parcial');
            return isHighWeight || isExam;
        }).sort((a, b) => {
            // Priority: Date first, then weight
            if (a.eventDate !== b.eventDate) return a.eventDate.localeCompare(b.eventDate);
            return (b.weight || 0) - (a.weight || 0);
        });
    }

    /**
     * Find free time blocks of 1.5 - 2 hours between 08:00 and 22:00.
     */
    findGaps(events: CalendarEvent[], startDate: Date, days: number = 14): { date: string, start: string, end: string }[] {
        const gaps: { date: string, start: string, end: string }[] = [];
        const businessStart = "08:00";
        const businessEnd = "22:00";
        const minGapMinutes = 90; // 1.5h
        const maxGapMinutes = 120; // 2h

        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            const dayEvents = events
                .filter(e => e.eventDate === dateStr && !e.isAllDay && e.startTime && e.endTime)
                .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

            let lastTime = businessStart;

            for (const event of dayEvents) {
                const eventStart = event.startTime!.substring(0, 5);
                const diff = this.getMinutesDiff(lastTime, eventStart);

                if (diff >= minGapMinutes) {
                    const gapEnd = this.addMinutes(lastTime, Math.min(diff, maxGapMinutes));
                    gaps.push({ date: dateStr, start: lastTime, end: gapEnd });
                }
                lastTime = event.endTime!.substring(0, 5) > lastTime ? event.endTime!.substring(0, 5) : lastTime;
            }

            // Check until end of day
            const finalDiff = this.getMinutesDiff(lastTime, businessEnd);
            if (finalDiff >= minGapMinutes) {
                const gapEnd = this.addMinutes(lastTime, Math.min(finalDiff, maxGapMinutes));
                gaps.push({ date: dateStr, start: lastTime, end: gapEnd });
            }
        }

        return gaps;
    }

    /**
     * Use AI to map exam topics to available gaps, adhering to daily limits and prioritization.
     */
    async strategizeStudy(criticalEvents: CalendarEvent[], availableGaps: { date: string, start: string, end: string }[]): Promise<any[]> {
        if (criticalEvents.length === 0 || availableGaps.length === 0) return [];

        const suggestedBlocks: any[] = [];
        const blocksPerDay: Record<string, number> = {};

        // Prioritize: High weight and close dates come first
        for (const exam of criticalEvents) {
            // Find gaps BEFORE the exam date
            const validGaps = availableGaps.filter(g => g.date <= exam.eventDate);

            if (validGaps.length === 0) continue;

            // Pick up to 2 gaps for this exam (or shared with others)
            for (const gap of validGaps) {
                if ((blocksPerDay[gap.date] || 0) >= 2) continue; // Max 2 blocks per day limit

                // Remove gap from available list so it's not reused identically
                const gapIndex = availableGaps.indexOf(gap);
                if (gapIndex > -1) availableGaps.splice(gapIndex, 1);

                // Call Gemini with rotation/resilience
                try {
                    const response = await this.gemini.generate(
                        `Evento: ${exam.title} (${exam.weight}%). Bloque: ${gap.date} de ${gap.start} a ${gap.end}.`,
                        ACADEMIC_STUDY_SUGGESTION_PROMPT.replace('{{EXAM_DETAILS}}', JSON.stringify(exam)).replace('{{TIME_BLOCKS}}', JSON.stringify(gap)),
                        true
                    );

                    if (Array.isArray(response.content)) {
                        const suggestion = response.content[0];
                        if (suggestion) {
                            suggestedBlocks.push({
                                ...suggestion,
                                subjectId: exam.subjectId,
                                color: exam.color || '#3b82f6'
                            });
                            blocksPerDay[gap.date] = (blocksPerDay[gap.date] || 0) + 1;
                        }
                    }
                } catch (error) {
                    console.error("[SmartScheduler] AI Strategy failed for a block, skipping...", error);
                }

                if (suggestedBlocks.filter(b => b.date === gap.date).length >= 2) break;
            }
        }

        return suggestedBlocks;
    }

    private getMinutesDiff(start: string, end: string): number {
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        return (h2 * 60 + m2) - (h1 * 60 + m1);
    }

    private addMinutes(time: string, mins: number): string {
        const [h, m] = time.split(':').map(Number);
        const total = h * 60 + m + mins;
        const newH = Math.floor(total / 60).toString().padStart(2, '0');
        const newM = (total % 60).toString().padStart(2, '0');
        return `${newH}:${newM}`;
    }
}
