export interface CalendarEvent {
    id?: string;
    userId?: string;
    subjectId?: string;
    title: string;
    description?: string;
    eventDate: string; // Used for the date part (e.g. 2026-02-14)
    startTime?: string; // HH:mm:ss
    endTime?: string;   // HH:mm:ss
    isAllDay: boolean;
    color: string;
    weight?: number;
    grade?: number;
    googleEventId?: string;
    createdAt?: string;
}
