import { SupabaseClient } from '@supabase/supabase-js';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import { Subject } from '@/domain/entities/Subject';
import { CalendarEvent } from '@/domain/entities/CalendarEvent';
import { UserSettings } from '@/domain/entities/UserSettings';
import { SubjectResource } from '@/domain/entities/SubjectResource';
import { getColombiaNow } from '@/application/utils/date';

export class SupabaseRepository {
    private supabase: SupabaseClient;

    constructor(client: SupabaseClient) {
        this.supabase = client;
    }

    // --- Subjects ---
    async getSubjects(): Promise<Subject[]> {
        const { data, error } = await this.supabase
            .from('subjects')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw new Error(`Failed to fetch subjects: ${error.message}`);
        return data || [];
    }

    async createSubject(name: string, color: string, icon?: string): Promise<Subject> {
        const { data, error } = await this.supabase
            .from('subjects')
            .insert([{ name, color, icon }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create subject: ${error.message}`);
        return data;
    }

    async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
        const { data, error } = await this.supabase
            .from('subjects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update subject: ${error.message}`);
        return data;
    }

    async deleteSubject(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('subjects')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete subject: ${error.message}`);
    }

    // --- Subject Resources (Baúl) ---
    async getSubjectResources(subjectId: string): Promise<SubjectResource[]> {
        const { data, error } = await this.supabase
            .from('subject_resources')
            .select('*')
            .eq('subject_id', subjectId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch subject resources: ${error.message}`);
        return (data || []).map(item => ({
            id: item.id,
            userId: item.user_id,
            subjectId: item.subject_id,
            name: item.name,
            url: item.url,
            type: item.type,
            size: item.size,
            createdAt: item.created_at
        }));
    }

    async createSubjectResource(resource: SubjectResource): Promise<SubjectResource> {
        const { data, error } = await this.supabase
            .from('subject_resources')
            .insert([{
                subject_id: resource.subjectId,
                name: resource.name,
                url: resource.url,
                type: resource.type,
                size: resource.size
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create subject resource: ${error.message}`);
        return data;
    }

    async deleteSubjectResource(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('subject_resources')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete subject resource: ${error.message}`);
    }

    // --- Academic Content ---
    async createContent(content: AcademicContent): Promise<AcademicContent> {
        const { data, error } = await this.supabase
            .from('academic_content')
            .insert([{
                subject_id: content.subjectId,
                title: content.title,
                source_type: content.sourceType,
                content_type: content.contentType ?? 'apunte', // Default if undefined
                importance_level: content.importanceLevel,
                deadline: content.deadline,
                status: content.status,
                description: content.description,
                summary: content.summary,
                key_insights: content.keyInsights,
                study_steps: content.studySteps,
                class_date: content.classDate, // Feature 7
                attachments: content.attachments || [], // Phase 6
                notes: content.notes,
                transcription: content.transcription, // Phase 7
                google_event_id: content.googleEventId // Phase 9
            }])
            .select('id')
            .single();

        if (error || !data) throw new Error(`Failed to save content: ${error?.message || 'Data is null'}`);

        const { data: savedData, error: fetchError } = await this.supabase
            .from('academic_content')
            .select(`
                id, 
                subjectId:subject_id, 
                title, 
                sourceType:source_type, 
                contentType:content_type, 
                importanceLevel:importance_level, 
                deadline, 
                status, 
                description, 
                summary, 
                keyInsights:key_insights, 
                studySteps:study_steps, 
                classDate:class_date, 
                attachments, 
                notes,
                googleEventId:google_event_id,
                created_at
            `)
            .eq('id', data.id)
            .single();

        if (fetchError || !savedData) {
            throw new Error(`Failed to retrieve saved content: ${fetchError?.message || 'Data is null'}`);
        }

        return savedData as any;
    }

    async updateContent(id: string, updates: Partial<AcademicContent>): Promise<AcademicContent> {
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.classDate !== undefined) payload.class_date = updates.classDate;
        if (updates.deadline !== undefined) payload.deadline = updates.deadline;
        if (updates.attachments !== undefined) payload.attachments = updates.attachments;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.notes !== undefined) payload.notes = updates.notes;
        if (updates.transcription !== undefined) payload.transcription = updates.transcription;

        const { data, error } = await this.supabase
            .from('academic_content')
            .update(payload)
            .eq('id', id)
            .select(`
                id, 
                subjectId:subject_id, 
                title, 
                sourceType:source_type, 
                contentType:content_type, 
                importanceLevel:importance_level, 
                deadline, 
                status, 
                description, 
                summary, 
                keyInsights:key_insights, 
                studySteps:study_steps, 
                classDate:class_date, 
                attachments, 
                notes,
                googleEventId:google_event_id,
                created_at
            `)
            .single();

        if (error || !data) throw new Error(`Failed to update content: ${error?.message || 'Data is null'}`);
        return {
            ...data as any,
            classDate: (data as any).classDate ? new Date((data as any).classDate) : undefined,
            deadline: (data as any).deadline ? new Date((data as any).deadline) : undefined
        } as AcademicContent;
    }

    async deleteContent(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('academic_content')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete content: ${error.message}`);
    }

    async getContentBySubject(subjectId: string): Promise<AcademicContent[]> {
        const { data, error } = await this.supabase
            .from('academic_content')
            .select(`
                id, 
                subjectId:subject_id, 
                title, 
                sourceType:source_type, 
                contentType:content_type, 
                importanceLevel:importance_level, 
                deadline, 
                status, 
                description, 
                classDate:class_date, 
                attachments, 
                googleEventId:google_event_id,
                created_at
            `)
            .eq('subject_id', subjectId)
            .order('class_date', { ascending: false }); // Sort by class date first for better flow

        if (error) throw new Error(`Failed to fetch content: ${error.message}`);
        return (data || []).map(item => ({
            ...item,
            classDate: item.classDate ? new Date(item.classDate as any) : undefined,
            deadline: item.deadline ? new Date(item.deadline as any) : undefined
        } as any));
    }


    async getRecentContent(): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('academic_content')
            .select(`
                id, 
                subjectId:subject_id, 
                title, 
                sourceType:source_type, 
                contentType:content_type, 
                importanceLevel:importance_level, 
                deadline, 
                status, 
                description, 
                classDate:class_date, 
                attachments, 
                googleEventId:google_event_id,
                created_at,
                subjects(name, color, icon)
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw new Error(`Failed to fetch recent content: ${error.message}`);
        return (data || []).map(item => ({
            ...item,
            classDate: item.classDate ? new Date(item.classDate as any) : undefined,
            deadline: item.deadline ? new Date(item.deadline as any) : undefined
        }));
    }

    // --- Calendar Events ---
    async getCalendarEvents(): Promise<CalendarEvent[]> {
        const { data, error } = await this.supabase
            .from('calendar_events')
            .select('*')
            .order('event_date', { ascending: true });

        if (error) throw new Error(`Failed to fetch events: ${error.message}`);
        return (data || []).map(item => ({
            id: item.id,
            userId: item.user_id,
            subjectId: item.subject_id,
            title: item.title,
            description: item.description,
            eventDate: item.event_date,
            startTime: item.start_time,
            endTime: item.end_time,
            isAllDay: item.is_all_day,
            color: item.color,
            weight: item.weight,
            grade: item.grade,
            googleEventId: item.google_event_id,
            createdAt: item.created_at
        }));
    }

    async createCalendarEvent(event: CalendarEvent): Promise<CalendarEvent> {
        // Default to a 1-hour session if no times provided
        const startTime = event.startTime || '09:00:00';
        const endTime = event.endTime || '10:00:00';

        const { data, error } = await this.supabase
            .from('calendar_events')
            .insert([{
                user_id: event.userId,
                subject_id: event.subjectId,
                title: event.title,
                description: event.description,
                event_date: event.eventDate,
                start_time: startTime,
                end_time: endTime,
                is_all_day: event.isAllDay,
                color: event.color,
                weight: event.weight,
                grade: event.grade,
                google_event_id: event.googleEventId
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create event: ${error.message}`);
        return data;
    }

    async getEventsByDateRange(userId: string, startDate: string, endDate: string): Promise<CalendarEvent[]> {
        const { data, error } = await this.supabase
            .from('calendar_events')
            .select('*')
            .eq('user_id', userId)
            .gte('event_date', startDate)
            .lte('event_date', endDate)
            .order('event_date', { ascending: true })
            .order('start_time', { ascending: true });

        if (error) throw new Error(`Failed to fetch events by range: ${error.message}`);

        // Map DB fields to camelCase matches the interface
        return (data || []).map(item => ({
            id: item.id,
            userId: item.user_id,
            subjectId: item.subject_id,
            title: item.title,
            description: item.description,
            eventDate: item.event_date,
            startTime: item.start_time,
            endTime: item.end_time,
            isAllDay: item.is_all_day,
            color: item.color,
            weight: item.weight,
            grade: item.grade,
            googleEventId: item.google_event_id,
            createdAt: item.created_at
        }));
    }

    async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
        const payload: any = {};
        if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId;
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.eventDate !== undefined) payload.event_date = updates.eventDate;
        if (updates.startTime !== undefined) payload.start_time = updates.startTime;
        if (updates.endTime !== undefined) payload.end_time = updates.endTime;
        if (updates.isAllDay !== undefined) payload.is_all_day = updates.isAllDay;
        if (updates.color !== undefined) payload.color = updates.color;
        if (updates.weight !== undefined) payload.weight = updates.weight;
        if (updates.grade !== undefined) payload.grade = updates.grade;
        if (updates.googleEventId !== undefined) payload.google_event_id = updates.googleEventId;

        const { data, error } = await this.supabase
            .from('calendar_events')
            .update(payload)
            .eq('id', id)
            .select();

        if (error) throw new Error(`Failed to update event: ${error.message}`);
        if (!data || data.length === 0) throw new Error('Evento no encontrado o sin permisos para editar.');

        return data[0];
    }

    async deleteCalendarEvent(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('calendar_events')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete event: ${error.message}`);
    }

    // --- User Settings ---
    async getUserSettings(): Promise<UserSettings | null> {
        const { data, error } = await this.supabase
            .from('user_settings')
            .select('*')
            .maybeSingle();

        if (error) throw new Error(`Failed to fetch settings: ${error.message}`);
        if (!data) return null;

        return {
            userId: data.user_id,
            googleSyncEnabled: data.google_sync_enabled,
            updatedAt: data.updated_at
        };
    }

    async updateUserSettings(enabled: boolean): Promise<void> {
        const { error } = await this.supabase
            .from('user_settings')
            .upsert({
                google_sync_enabled: enabled,
                updated_at: getColombiaNow().toISOString()
            }, { onConflict: 'user_id' });

        if (error) throw new Error(`Failed to update settings: ${error.message}`);
    }

    // --- Intelligence Migration Audit ---
    async getIncompleteAcademicContent(): Promise<AcademicContent[]> {
        // Records that have transcription but lack high-quality summary or insights
        const { data, error } = await this.supabase
            .from('academic_content')
            .select('*')
            .not('transcription', 'is', null)
            .or('summary.is.null,key_insights.is.null,study_steps.is.null')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Audit failed for content: ${error.message}`);

        return (data || []).map(item => ({
            ...item,
            classDate: item.class_date ? new Date(item.class_date) : undefined,
            deadline: item.deadline ? new Date(item.deadline) : undefined,
            googleEventId: item.google_event_id
        }));
    }

    async getIncompleteCalendarEvents(userId: string): Promise<CalendarEvent[]> {
        // Events that have no weight or description context
        const { data, error } = await this.supabase
            .from('calendar_events')
            .select('*')
            .eq('user_id', userId)
            .or('weight.is.null,weight.eq.0,description.is.null')
            .order('event_date', { ascending: false });

        if (error) throw new Error(`Audit failed for events: ${error.message}`);

        return (data || []).map(item => ({
            id: item.id,
            userId: item.user_id,
            subjectId: item.subject_id,
            title: item.title,
            description: item.description,
            eventDate: item.event_date,
            startTime: item.start_time,
            endTime: item.end_time,
            isAllDay: item.is_all_day,
            color: item.color,
            weight: item.weight,
            grade: item.grade,
            googleEventId: item.google_event_id,
            createdAt: item.created_at
        }));
    }
}
