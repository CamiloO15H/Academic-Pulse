'use server'

import { createClient } from '@/infrastructure/database/supabaseServer';
import { SupabaseRepository } from '@/infrastructure/repositories/SupabaseRepository';
import { ProcessTranscription } from '@/application/use-cases/ProcessTranscription';
import { GeminiProvider } from '@/infrastructure/llm/GeminiProvider';
import { revalidatePath } from 'next/cache';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import { CalendarEvent } from '@/domain/entities/CalendarEvent';
import { ACADEMIC_TUTOR_PROMPT, SYLLABUS_SCANNER_PROMPT } from '@/application/agents/prompts';
import { GoogleCalendarService } from '@/infrastructure/services/GoogleCalendarService';
import { SmartScheduler } from '@/application/services/SmartScheduler';
import { IntelligenceMigrator } from '@/application/services/IntelligenceMigrator';

// ... Dependency Injection Helper ...

// --- Dependency Injection Helper ---
const getAuthenticatedRepository = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Unauthorized: Please login first.');
    }
    return new SupabaseRepository(supabase);
};

const getGoogleSyncService = async () => {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Note: provider_token is only available if the user recently logged in with Google
    // and correctly configured in Supabase. For this MVP, we try to get it.
    const token = session?.provider_token;

    if (!token) {
        console.warn('Google provider token not found in session.');
        return null;
    }

    return new GoogleCalendarService(token);
};

// --- Actions ---

export const processAcademicTranscription = async (formData: FormData) => {
    const transcription = formData.get('transcription') as string;
    const subjectId = formData.get('subjectId') as string;
    const confirmedSubject = formData.get('confirmedSubject') as string;
    const classDateStr = formData.get('classDate') as string;
    const classDate = classDateStr ? new Date(classDateStr) : undefined;

    if (!transcription) {
        return { status: 'ERROR', message: 'La transcripción está vacía.' };
    }

    try {
        const repo = await getAuthenticatedRepository();
        const gemini = new GeminiProvider('heavy');
        const processUseCase = new ProcessTranscription(gemini, repo);
        const databaseId = process.env.NOTION_DATABASE_ID || '';
        const result = await processUseCase.execute(transcription, databaseId, confirmedSubject, undefined, subjectId, classDate);

        if (result.status === 'SUCCESS' && result.data) {
            const savedContent = result.data;
            const settings = await repo.getUserSettings();

            if (settings?.googleSyncEnabled) {
                const googleService = await getGoogleSyncService();
                if (googleService) {
                    const googleEventId = await googleService.upsertEvent(savedContent, 'academic');
                    if (googleEventId) {
                        await repo.updateContent(savedContent.id!, { googleEventId });
                    }
                }
            }
        }

        revalidatePath('/');
        return result;
    } catch (error: any) {
        console.error('Action Error:', error);
        return { status: 'ERROR', message: error.message };
    }
};

export const createSubject = async (name: string, color: string, icon?: string) => {
    try {
        const repo = await getAuthenticatedRepository();
        await repo.createSubject(name, color, icon || 'book');
        revalidatePath('/');
        return { status: 'SUCCESS' };
    } catch (error: any) {
        return { status: 'ERROR', message: error.message };
    }
};

export const updateSubject = async (id: string, name: string, color: string, icon?: string) => {
    try {
        const repo = await getAuthenticatedRepository();
        await repo.updateSubject(id, { name, color, icon });
        revalidatePath('/');
        return { status: 'SUCCESS' };
    } catch (error: any) {
        return { status: 'ERROR', message: error.message };
    }
};

export const deleteSubject = async (id: string) => {
    try {
        const repo = await getAuthenticatedRepository();
        await repo.deleteSubject(id);
        revalidatePath('/');
        return { status: 'SUCCESS' };
    } catch (error: any) {
        return { status: 'ERROR', message: error.message };
    }
};

export const getContentBySubject = async (subjectId: string) => {
    try {
        const repo = await getAuthenticatedRepository();
        const content = await repo.getContentBySubject(subjectId);
        return { status: 'SUCCESS', data: content };
    } catch (error: any) {
        return { status: 'ERROR', message: error.message };
    }
};

export const getSubjects = async () => {
    try {
        const repo = await getAuthenticatedRepository();
        const subjects = await repo.getSubjects();
        return subjects;
    } catch (error) {
        console.error('Failed to get subjects:', error);
        return [];
    }
};

export const getRecentActivity = async (subjectId?: string) => {
    try {
        const repo = await getAuthenticatedRepository();
        if (subjectId) {
            return await repo.getContentBySubject(subjectId);
        }
        return await repo.getRecentContent();
    } catch (error) {
        console.error('Failed to get activity:', error);
        return [];
    }
};

export const updateAcademicContent = async (id: string, updates: Partial<AcademicContent>) => {
    try {
        const repo = await getAuthenticatedRepository();
        const updated = await repo.updateContent(id, updates);

        // Handle Google Calendar Sync if enabled
        const syncData = updated as any;
        if (syncData.google_event_id) {
            const settings = await repo.getUserSettings();
            if (settings?.googleSyncEnabled) {
                const googleService = await getGoogleSyncService();
                if (googleService) {
                    // Map back to AcademicContent domain entity for sync service
                    const content = {
                        ...syncData,
                        googleEventId: syncData.google_event_id,
                        classDate: syncData.class_date ? new Date(syncData.class_date) : undefined,
                        deadline: syncData.deadline ? new Date(syncData.deadline) : undefined
                    };
                    await googleService.upsertEvent(content as any, 'academic');
                }
            }
        }

        revalidatePath('/');
        return { status: 'SUCCESS', data: updated };
    } catch (error: any) {
        console.error('Update Action Error:', error);
        return { status: 'ERROR', message: error.message };
    }
};

export const deleteAcademicContent = async (id: string) => {
    try {
        const repo = await getAuthenticatedRepository();

        // Handle Google Calendar Deletion if exists
        const contents = await repo.getRecentContent();
        const content = contents.find(c => c.id === id);
        if (content?.googleEventId) {
            const googleService = await getGoogleSyncService();
            if (googleService) {
                await googleService.deleteEvent(content.googleEventId);
            }
        }

        await repo.deleteContent(id);
        revalidatePath('/');
        return { status: 'SUCCESS' };
    } catch (error: any) {
        console.error('Delete Action Error:', error);
        return { status: 'ERROR', message: error.message };
    }
};

// --- Calendar Event Actions ---

export const getCalendarEvents = async () => {
    try {
        const repo = await getAuthenticatedRepository();
        const events = await repo.getCalendarEvents();
        const contents = await repo.getRecentContent();

        // Map Academic Content to Event format for the calendar
        const academicEvents = contents.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            eventDate: c.classDate?.toISOString() || c.created_at,
            isAllDay: true,
            color: c.subjects?.color || '#3B82F6',
            type: 'academic' as const
        }));

        const manualEvents = events.map(e => ({
            ...e,
            type: 'manual' as const
        }));

        return { status: 'SUCCESS', data: [...academicEvents, ...manualEvents] };
    } catch (error: any) {
        return { status: 'ERROR', message: error.message };
    }
};

export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'userId'>) => {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const repo = new SupabaseRepository(supabase);

        let googleEventId = undefined;
        const settings = await repo.getUserSettings();

        if (settings?.googleSyncEnabled) {
            const googleService = await getGoogleSyncService();
            if (googleService) {
                googleEventId = await googleService.upsertEvent(event as CalendarEvent, 'manual') || undefined;
            }
        }

        await repo.createCalendarEvent({ ...event, userId: user.id, googleEventId });
        revalidatePath('/');
        return { status: 'SUCCESS' };
    } catch (error: any) {
        return { status: 'ERROR', message: error.message };
    }
};

export const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
        const repo = await getAuthenticatedRepository();
        const updated = await repo.updateCalendarEvent(id, updates);

        // Handle Google Calendar Sync if enabled
        const syncData = updated as any;
        if (syncData.google_event_id) {
            const settings = await repo.getUserSettings();
            if (settings?.googleSyncEnabled) {
                const googleService = await getGoogleSyncService();
                if (googleService) {
                    const event = {
                        ...syncData,
                        eventDate: syncData.event_date,
                        isAllDay: syncData.is_all_day,
                        googleEventId: syncData.google_event_id
                    };
                    await googleService.upsertEvent(event as any, 'manual');
                }
            }
        }

        revalidatePath('/');
        return { status: 'SUCCESS', data: updated };
    } catch (error: any) {
        console.error('Update Event Action Error:', error);
        return { status: 'ERROR', message: error.message };
    }
};

export const deleteCalendarEvent = async (id: string) => {
    try {
        const repo = await getAuthenticatedRepository();

        // Handle Google Deletion
        const events = await repo.getCalendarEvents();
        const event = events.find(e => e.id === id);
        if (event?.googleEventId) {
            const googleService = await getGoogleSyncService();
            if (googleService) {
                await googleService.deleteEvent(event.googleEventId);
            }
        }

        await repo.deleteCalendarEvent(id);
        revalidatePath('/');
        return { status: 'SUCCESS' };
    } catch (error: any) {
        return { status: 'ERROR', message: error.message };
    }
};

// --- Settings Actions ---

export const getUserSettings = async () => {
    try {
        const repo = await getAuthenticatedRepository();
        const settings = await repo.getUserSettings();
        return { status: 'SUCCESS', data: settings };
    } catch (error: any) {
        return { status: 'ERROR', message: error.message };
    }
};

export const toggleGoogleSync = async (enabled: boolean) => {
    try {
        const repo = await getAuthenticatedRepository();
        await repo.updateUserSettings(enabled);
        revalidatePath('/');
        return { status: 'SUCCESS' };
    } catch (error: any) {
        return { status: 'ERROR', message: error.message };
    }
};

export const askQuestionToClass = async (contentId: string, question: string) => {
    try {
        const repo = await getAuthenticatedRepository();
        const gemini = new GeminiProvider();

        // 1. Get context
        // Use a direct fetch by ID to ensure we have the transcription (which is excluded from listings)
        const { data: content, error: fetchError } = await (await createClient())
            .from('academic_content')
            .select('*')
            .eq('id', contentId)
            .single();

        if (fetchError || !content) {
            throw new Error('Contenido no encontrado o error al recuperar la transcripción.');
        }

        // 2. Prepare context string
        const contextStr = `
Título: ${content.title}
Descripción: ${content.description}
Transcripción: ${content.transcription || 'No disponible'}
Plan de Estudio: ${content.studySteps?.join(', ')}
        `.trim();

        const systemPrompt = ACADEMIC_TUTOR_PROMPT.replace('{{CONTEXT}}', contextStr);

        // 3. Generate response (raw text, non-JSON)
        const response = await gemini.generate(question, systemPrompt, false);

        return { status: 'SUCCESS', data: response.content };
    } catch (error: any) {
        console.error('Chat Action Error:', error);
        return { status: 'ERROR', message: error.message };
    }
};

/**
 * Manually trigger a full synchronization of all recent content and events to Google Calendar.
 */
export const syncCalendarNow = async () => {
    try {
        const repo = await getAuthenticatedRepository();
        const settings = await repo.getUserSettings();

        if (!settings?.googleSyncEnabled) {
            return { status: 'ERROR', message: 'La sincronización con Google Calendar no está habilitada.' };
        }

        const googleService = await getGoogleSyncService();
        if (!googleService) {
            return { status: 'ERROR', message: 'No se pudo inicializar el servicio de Google.' };
        }

        // Fetch all events and content
        const events = await repo.getCalendarEvents();
        const contents = await repo.getRecentContent();

        let syncedCount = 0;

        // Sync academic contents
        for (const content of contents) {
            const googleId = await googleService.upsertEvent(content as any, 'academic');
            if (googleId && googleId !== content.googleEventId) {
                await repo.updateContent(content.id, { googleEventId: googleId });
            }
            syncedCount++;
        }

        // Sync manual events
        for (const event of events) {
            const googleId = await googleService.upsertEvent(event, 'manual');
            if (googleId && googleId !== event.googleEventId) {
                await repo.updateCalendarEvent(event.id!, { googleEventId: googleId });
            }
            syncedCount++;
        }

        revalidatePath('/');
        return { status: 'SUCCESS', data: { syncedCount } };
    } catch (error: any) {
        console.error('Manual Sync Error:', error);
        return { status: 'ERROR', message: error.message };
    }
};

export const scanSyllabus = async (text: string, subjectId: string, files?: { data: string, mimeType: string }[]) => {
    try {
        console.log('[DEBUG] scanSyllabus started for subject:', subjectId, files?.length ? '(with files)' : '(text only)');
        const gemini = new GeminiProvider('heavy');
        const currentYear = new Date().getFullYear().toString();
        const semesterStartDate = '03 de febrero de 2026';
        const prompt = SYLLABUS_SCANNER_PROMPT
            .replace('{{YEAR}}', currentYear)
            .replace('{{START_DATE}}', semesterStartDate);

        const response = await gemini.generate(text, prompt, true, files?.map(f => ({
            inlineData: f
        })));
        console.log('[DEBUG] AI Generation finished');

        let events: any[] = [];
        if (Array.isArray(response.content)) {
            events = response.content;
        } else if (typeof response.content === 'object' && response.content !== null) {
            // If it's an object with an 'events' property
            events = (response.content as any).events || [];
            if (!Array.isArray(events)) events = [];
        } else if (typeof response.content === 'string') {
            try {
                const parsed = JSON.parse(response.content);
                events = Array.isArray(parsed) ? parsed : (parsed.events || []);
            } catch (e) {
                console.error('[DEBUG] Failed to parse response.content string');
            }
        }

        console.log(`[DEBUG] Returning ${events.length} events to client`);
        return { status: 'SUCCESS', data: events };
    } catch (error: any) {
        console.error('Scan Syllabus Error:', error);
        return { status: 'ERROR', message: error.message };
    }
};

export const bulkCreateEvents = async (events: Omit<CalendarEvent, 'id' | 'userId'>[]) => {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const repo = new SupabaseRepository(supabase);
        const settings = await repo.getUserSettings();
        const googleService = settings?.googleSyncEnabled ? await getGoogleSyncService() : null;

        const createdEvents = [];
        for (const event of events) {
            let googleEventId = undefined;
            if (googleService) {
                googleEventId = await googleService.upsertEvent(event as CalendarEvent, 'manual') || undefined;
            }

            const result = await repo.createCalendarEvent({ ...event, userId: user.id, googleEventId });
            createdEvents.push(result);
        }

        revalidatePath('/');
        return { status: 'SUCCESS', data: createdEvents };
    } catch (error: any) {
        console.error('Bulk Create Error:', error);
        return { status: 'ERROR', message: error.message };
    }
};

export const suggestStudyBlocks = async () => {
    try {
        const repo = await getAuthenticatedRepository();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + 14); // 2 week window

        const startDateStr = now.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const events = await repo.getEventsByDateRange(user.id, startDateStr, endDateStr);

        const scheduler = new SmartScheduler();
        const criticalEvents = scheduler.analyzeLoad(events);
        const gaps = scheduler.findGaps(events, now, 14);

        console.log(`[Action] Strategizing study for ${criticalEvents.length} critical events and ${gaps.length} gaps.`);
        const plans = await scheduler.strategizeStudy(criticalEvents, gaps);

        return { status: 'SUCCESS', data: plans };
    } catch (error: any) {
        console.error('[Action Error] suggestStudyBlocks:', error);
        return { status: 'ERROR', message: error.message };
    }
};

export const bulkCreateCalendarEvents = async (events: Partial<CalendarEvent>[]) => {
    try {
        const repo = await getAuthenticatedRepository();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        for (const event of events) {
            await repo.createCalendarEvent({
                ...event as any,
                userId: user.id
            });
        }

        revalidatePath('/');
        return { status: 'SUCCESS' };
    } catch (error: any) {
        console.error('[Action Error] bulkCreateCalendarEvents:', error);
        return { status: 'ERROR', message: error.message };
    }
};

export const migrateIntelligence = async () => {
    try {
        const repo = await getAuthenticatedRepository();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const migrator = new IntelligenceMigrator(repo);
        const results = await migrator.migrate(user.id);

        revalidatePath('/');
        return { status: 'SUCCESS', data: results };
    } catch (error: any) {
        console.error('[Action Error] migrateIntelligence:', error);
        return { status: 'ERROR', message: error.message };
    }
};

export const uploadAttachment = async (contentId: string, fileName: string, fileData: string, mimeType: string) => {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        // Convert base64 to Buffer
        const buffer = Buffer.from(fileData, 'base64');

        // 10MB Limit check
        if (buffer.length > 10 * 1024 * 1024) throw new Error('El archivo excede el límite de 10MB.');

        const filePath = `${user.id}/${contentId}/${Date.now()}-${fileName}`;

        console.log('--- STORAGE DEBUG ---');
        console.log('User ID:', user.id);
        console.log('Target Bucket:', 'academic-files');
        console.log('File Path:', filePath);

        const { data, error } = await supabase.storage
            .from('academic-files')
            .upload(filePath, buffer, {
                contentType: mimeType,
                upsert: true
            });

        if (error) {
            console.error('Upload Failed Details:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('academic-files')
            .getPublicUrl(filePath);

        // Update content entry
        const { data: record, error: fetchError } = await supabase
            .from('academic_content')
            .select('attachments')
            .eq('id', contentId)
            .single();

        if (fetchError) throw fetchError;

        const currentAttachments = record?.attachments || [];
        const newAttachment = {
            name: fileName,
            url: publicUrl,
            type: mimeType,
            size: buffer.length
        };

        const { error: updateError } = await supabase
            .from('academic_content')
            .update({
                attachments: [...currentAttachments, newAttachment]
            })
            .eq('id', contentId);

        if (updateError) {
            console.error('DB Update Failed:', updateError);
            throw updateError;
        }

        console.log('--- DB UPDATE SUCCESS ---');
        console.log('New Attachment Added:', fileName);

        revalidatePath('/');
        return { status: 'SUCCESS', data: newAttachment };
    } catch (error: any) {
        console.error('Upload Error:', error);
        return { status: 'ERROR', message: error.message };
    }
};
