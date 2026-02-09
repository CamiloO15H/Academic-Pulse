import { SupabaseClient } from '@supabase/supabase-js';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import { Subject } from '@/domain/entities/Subject';

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
        // user_id is handled automatically by Supabase Auth default & RLS
        const { data, error } = await this.supabase
            .from('subjects')
            .insert([{ name, color, icon }])
            .select()
            .single();

        if (error) throw new Error(`Failed to create subject: ${error.message}`);
        return data;
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
                study_steps: content.studySteps
            }])
            .select()
            .single();

        if (error) throw new Error(`Failed to save content: ${error.message}`);
        return data;
    }

    async getContentBySubject(subjectId: string): Promise<AcademicContent[]> {
        const { data, error } = await this.supabase
            .from('academic_content')
            .select('*')
            .eq('subject_id', subjectId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch content: ${error.message}`);
        return data || [];
    }

    async getRecentContent(): Promise<any[]> {
        const { data, error } = await this.supabase
            .from('academic_content')
            .select('*, subjects(name, color, icon)')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw new Error(`Failed to fetch recent content: ${error.message}`);
        return data || [];
    }
}
