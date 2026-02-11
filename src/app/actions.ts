'use server'

import { createClient } from '@/infrastructure/database/supabaseServer';
import { SupabaseRepository } from '@/infrastructure/repositories/SupabaseRepository';
import { ProcessTranscription } from '@/application/use-cases/ProcessTranscription';
import { NotionClient } from '@/infrastructure/mcp/notionClient';
import { GeminiProvider } from '@/infrastructure/llm/GeminiProvider';
import { revalidatePath } from 'next/cache';

// --- Dependency Injection Helper ---
const getAuthenticatedRepository = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Unauthorized: Please login first.');
    }
    return new SupabaseRepository(supabase);
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
        const gemini = new GeminiProvider();
        const notion = new NotionClient();

        const processUseCase = new ProcessTranscription(gemini, notion, repo);
        const databaseId = process.env.NOTION_DATABASE_ID || '';
        const result = await processUseCase.execute(transcription, databaseId, confirmedSubject, undefined, subjectId, classDate);

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
