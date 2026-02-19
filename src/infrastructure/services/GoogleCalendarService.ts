import { google } from 'googleapis';
import { AcademicContent } from '../../domain/entities/AcademicContent';
import { CalendarEvent } from '../../domain/entities/CalendarEvent';
import { getColombiaNow } from '@/application/utils/date';

export class GoogleCalendarService {
    private oauth2Client;

    constructor(accessToken: string) {
        this.oauth2Client = new google.auth.OAuth2();
        this.oauth2Client.setCredentials({ access_token: accessToken });
    }

    private get calendar() {
        return google.calendar({ version: 'v3', auth: this.oauth2Client });
    }

    async upsertEvent(
        event: AcademicContent | CalendarEvent,
        type: 'academic' | 'manual'
    ): Promise<string | null> {
        const titlePrefix = '[Academic Pulse] ';
        const title = event.title.startsWith(titlePrefix) ? event.title : `${titlePrefix}${event.title}`;

        let start: any = {};
        let end: any = {};
        let summary = title;
        let description = 'description' in event ? event.description : '';
        let googleEventId = event.googleEventId;

        if (type === 'academic') {
            const content = event as AcademicContent;
            const date = content.classDate || getColombiaNow();
            // Default Academic items to All-Day if no specific time logic yet
            const dateStr = date.toISOString().split('T')[0];
            start = { date: dateStr };
            end = { date: dateStr };
        } else {
            const manual = event as CalendarEvent;
            if (manual.isAllDay) {
                const dateStr = manual.eventDate.split('T')[0];
                start = { date: dateStr };
                end = { date: dateStr };
            } else {
                start = { dateTime: manual.eventDate };
                // Default to 1 hour duration
                const endDate = new Date(new Date(manual.eventDate).getTime() + 60 * 60 * 1000);
                end = { dateTime: endDate.toISOString() };
            }
        }

        try {
            if (googleEventId) {
                const res = await this.calendar.events.patch({
                    calendarId: 'primary',
                    eventId: googleEventId,
                    requestBody: {
                        summary,
                        description,
                        start,
                        end,
                    },
                });
                return res.data.id || null;
            } else {
                const res = await this.calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: {
                        summary,
                        description,
                        start,
                        end,
                    },
                });
                return res.data.id || null;
            }
        } catch (error: any) {
            console.error('Google Calendar Sync Error:', error.message);
            // If event not found (deleted manually in Google), try inserting fresh
            if (error.code === 404 && googleEventId) {
                const res = await this.calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: {
                        summary,
                        description,
                        start,
                        end,
                    },
                });
                return res.data.id || null;
            }
            throw error;
        }
    }

    async deleteEvent(googleEventId: string): Promise<void> {
        try {
            await this.calendar.events.delete({
                calendarId: 'primary',
                eventId: googleEventId,
            });
        } catch (error: any) {
            // Ignore if already deleted
            if (error.code !== 404) {
                console.error('Google Calendar Delete Error:', error.message);
                throw error;
            }
        }
    }
}
