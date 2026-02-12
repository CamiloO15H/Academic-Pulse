import { CalendarEvent } from '@/domain/entities/CalendarEvent';
import { GeminiProvider } from '@/infrastructure/llm/GeminiProvider';
import { ACADEMIC_STUDY_SUGGESTION_PROMPT, ACADEMIC_STUDY_BATCH_PROMPT } from '@/application/agents/prompts';

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

        const assignments: any[] = [];
        const blocksPerDay: Record<string, number> = {};
        const MAX_BLOCKS_PER_DAY = 2; // Limit per day
        let assignmentIdCounter = 1;

        // 1. Phase: Allocation (Deterministic)
        // Prioritize: High weight and close dates come first (already sorted in analyzeLoad)
        for (const exam of criticalEvents) {
            // Find gaps BEFORE the exam date
            const validGaps = availableGaps.filter(g => g.date <= exam.eventDate);

            if (validGaps.length === 0) continue;

            const examAssignments = assignments.filter(a => a.exam.id === exam.id).length;
            if (examAssignments >= 4) continue; // Hard limit: max 4 blocks per exam total

            // Pick up to 2 gaps for this exam (or shared with others)
            let assignedCount = 0;
            for (const gap of validGaps) {
                if ((blocksPerDay[gap.date] || 0) >= MAX_BLOCKS_PER_DAY) continue;

                // Assign this gap
                blocksPerDay[gap.date] = (blocksPerDay[gap.date] || 0) + 1;

                // Remove gap from available list so it's not reused
                const gapIndex = availableGaps.indexOf(gap);
                if (gapIndex > -1) availableGaps.splice(gapIndex, 1);

                assignments.push({
                    id: assignmentIdCounter++,
                    exam: {
                        title: exam.title,
                        weight: exam.weight,
                        date: exam.eventDate,
                        subjectId: exam.subjectId,
                        color: exam.color
                    },
                    gap: {
                        date: gap.date,
                        start: gap.start,
                        end: gap.end
                    }
                });

                assignedCount++;
                if (assignedCount >= 2) break; // Max 2 blocks per exam
            }
        }

        if (assignments.length === 0) return [];

        console.log(`[SmartScheduler] Batched ${assignments.length} study blocks. Requesting AI strategy...`);

        // 2. Phase: Generation (Batch AI Call)
        try {
            // Chunking if too many assignments (though 10-20 should fit in context window)
            // For now, single batch
            const prompt = `Planifica los siguientes bloques de estudio:\n${JSON.stringify(assignments, null, 2)}`;

            const response = await this.gemini.generate(
                prompt,
                ACADEMIC_STUDY_BATCH_PROMPT,
                true
            );

            if (Array.isArray(response.content)) {
                return response.content.map((suggestion: any) => {
                    const original = assignments.find(a => a.id === suggestion.id);
                    if (!original) return null;

                    return {
                        title: suggestion.title,
                        description: suggestion.description,
                        startTime: original.gap.start,
                        endTime: original.gap.end,
                        date: original.gap.date,
                        subjectId: original.exam.subjectId,
                        color: original.exam.color || '#3b82f6'
                    };
                }).filter(Boolean);
            }
        } catch (error) {
            console.error("[SmartScheduler] Batch AI Strategy failed.", error);
            // Fallback: Return generic blocks if AI fails
            return assignments.map(a => ({
                title: `Estudiar: ${a.exam.title}`,
                description: `Bloque reservado para ${a.exam.title}.`,
                startTime: a.gap.start,
                endTime: a.gap.end,
                date: a.gap.date,
                subjectId: a.exam.subjectId,
                color: a.exam.color || '#3b82f6'
            }));
        }

        return [];
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
