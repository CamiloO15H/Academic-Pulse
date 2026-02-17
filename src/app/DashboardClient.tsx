'use client';

import {
    syncCalendarNow as apiSyncCalendarNow,
    migrateIntelligence as apiMigrateIntelligence,
    getCalendarEvents
} from './actions';
import { Toaster, toast } from 'sonner';
import { createClient } from '@/infrastructure/database/supabaseClient';

// Hooks
import { useDashboard } from '@/hooks/useDashboard';
import { useSubjects } from '@/hooks/useSubjects';
import { useContents } from '@/hooks/useContents';
import { useEvents } from '@/hooks/useEvents';

// Components
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import SubjectGrid from '@/components/dashboard/SubjectGrid';
import SubjectDetailView from '@/components/dashboard/SubjectDetailView';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import IntegrationsSection from '@/components/dashboard/IntegrationsSection';
import SubjectModals from '@/components/dashboard/SubjectModals';
import EventModals from '@/components/dashboard/EventModals';
import MobileFAB from '@/components/dashboard/MobileFAB';
import { ChatSidebar } from '@/components/dashboard/ChatSidebar';
import EventDetailModal from '@/components/dashboard/EventDetailModal';
import SyllabusScanner from '@/components/dashboard/SyllabusScanner';

// Types
import { AcademicContent } from '@/domain/entities/AcademicContent';
import { Subject } from '@/domain/entities/Subject';

interface DashboardClientProps {
    initialSubjects: Subject[];
    initialContents: AcademicContent[];
    initialEvents: any[];
    initialSettings: any;
}

/**
 * Orquestador Principal del Dashboard (Clean Architecture).
 * Centraliza la composición de componentes atómicos y hooks de lógica.
 */
export default function DashboardClient({
    initialSubjects,
    initialContents,
    initialEvents,
    initialSettings
}: DashboardClientProps) {
    // 1. Logic Hooks
    const dashboard = useDashboard();
    const subjects = useSubjects(initialSubjects);
    const contents = useContents(initialContents, subjects.selectedSubjectId);
    const events = useEvents(initialEvents, initialSettings, subjects.subjects);

    // 2. Actions
    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const handleSyncNow = async () => {
        dashboard.setIsLoading(true);
        const res = await apiSyncCalendarNow();
        if (res.status === 'SUCCESS') {
            toast.success('Sincronización completada');
            const eventRes = await getCalendarEvents();
            if (eventRes.status === 'SUCCESS') events.setEvents(eventRes.data || []);
        } else {
            toast.error('Error en la sincronización');
        }
        dashboard.setIsLoading(false);
    };

    const handleMigrate = async () => {
        if (!confirm('Esto analizará tus contenidos antiguos con la nueva IA. ¿Continuar?')) return;
        dashboard.setIsMigrating(true);
        const res = await apiMigrateIntelligence();
        if (res.status === 'SUCCESS') {
            toast.success('Migración exitosa');
            await contents.refreshContent();
        } else {
            toast.error('Error en la migración');
        }
        dashboard.setIsMigrating(false);
    };

    // 3. Render Views
    if (subjects.selectedSubject) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-4 md:p-8">
                <SubjectDetailView
                    subject={subjects.selectedSubject}
                    contents={contents.contents}
                    onBack={() => subjects.setSelectedSubjectId(null)}
                    onAskAI={(content) => {
                        dashboard.setActiveChatContent(content);
                        dashboard.setIsChatOpen(true);
                    }}
                    onDayClick={(date, dayContents, dayEvents) => {
                        events.setSelectedDayContent({ date, contents: dayContents, events: dayEvents });
                        events.setIsDayDetailModalOpen(true);
                    }}
                    onDeleteContent={contents.handleDeleteContent}
                    onRefresh={contents.refreshContent}
                />

                <ChatSidebar isOpen={dashboard.isChatOpen} onClose={() => dashboard.setIsChatOpen(false)} content={dashboard.activeChatContent} />
                <EventModals
                    {...events}
                    subjects={subjects.subjects}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-4 md:p-8 pb-24 md:pb-8">
            <DashboardNavbar onLogout={handleLogout} />

            <div className="space-y-10">
                <DashboardSummary
                    subjectsCount={subjects.subjects.length}
                    contentsCount={contents.contents.length}
                    eventsCount={events.events.length}
                />

                <SubjectGrid
                    subjects={subjects.subjects}
                    onSelectSubject={subjects.setSelectedSubjectId}
                    onAddSubject={() => subjects.setIsAddSubjectModalOpen(true)}
                    onEditSubject={subjects.openEditModal}
                    onDeleteSubject={subjects.handleDeleteSubject}
                />

                <DashboardGrid
                    subjects={subjects.subjects}
                    contents={contents.contents}
                    events={events.events}
                    onAskAI={(c) => { dashboard.setActiveChatContent(c); dashboard.setIsChatOpen(true); }}
                    onDayClick={(date, dayContents, dayEvents) => {
                        events.setSelectedDayContent({ date, contents: dayContents, events: dayEvents });
                        events.setIsDayDetailModalOpen(true);
                    }}
                    onDeleteContent={contents.handleDeleteContent}
                    onRefresh={contents.refreshContent}
                />

                <IntegrationsSection
                    googleSyncEnabled={events.settings?.googleSyncEnabled}
                    onToggleSync={events.handleToggleSync}
                    onSyncNow={handleSyncNow}
                    onMigrate={handleMigrate}
                    isMigrating={dashboard.isMigrating}
                    isSyncing={dashboard.isLoading}
                />
            </div>

            {/* Modals & Overlays */}
            <SubjectModals {...subjects} />
            <EventModals {...events} subjects={subjects.subjects} />

            <EventDetailModal
                item={events.selectedCalendarItem}
                subjects={subjects.subjects}
                isOpen={!!events.selectedCalendarItem}
                onClose={() => events.setSelectedCalendarItem(null)}
                onSave={async (id, updates, type) => {
                    const success = await events.handleUpdateCalendarItem(id, updates, type);
                    if (success) await contents.refreshContent();
                }}
                onDelete={async (id, type) => {
                    toast.info('Funcionalidad de borrado en desarrollo');
                }}
            />

            {dashboard.isSyllabusScannerOpen && subjects.selectedSubjectId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-md p-4" onClick={() => dashboard.setIsSyllabusScannerOpen(false)}>
                    <div className="bg-card rounded-[3rem] shadow-2xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <SyllabusScanner
                            subjectId={subjects.selectedSubjectId}
                            subjectColor={(subjects.selectedSubject as any)?.color || '#3B82F6'}
                            onClose={() => dashboard.setIsSyllabusScannerOpen(false)}
                            onComplete={() => {
                                dashboard.setIsSyllabusScannerOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            <ChatSidebar isOpen={dashboard.isChatOpen} onClose={() => dashboard.setIsChatOpen(false)} content={dashboard.activeChatContent} />
            <MobileFAB onAddSubject={() => subjects.setIsAddSubjectModalOpen(true)} onAddEvent={() => { events.setQuickAddDate(new Date().toISOString().split('T')[0]); events.setIsAddEventModalOpen(true); }} />
            <Toaster position="top-right" theme="light" richColors closeButton />

            {dashboard.isProcessing && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-gray-900 text-white px-8 py-4 rounded-3xl flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-10">
                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-black uppercase tracking-widest">IA Analizando Contenido...</span>
                </div>
            )}
        </div>
    );
}
