'use client';

import { useState, useEffect } from 'react';
import {
    processAcademicTranscription,
    getRecentActivity,
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    deleteAcademicContent,
    getContentBySubject,
    getCalendarEvents,
    createCalendarEvent,
    deleteCalendarEvent,
    updateAcademicContent,
    updateCalendarEvent,
    getUserSettings,
    toggleGoogleSync,
    syncCalendarNow,
    migrateIntelligence
} from './actions';
import { Plus, X, Search, Settings, Calendar, LogOut, ArrowLeft, Send, Sparkles, MessageSquare, Trash2, FileText, Brain, Clock, ChevronRight, User, BookOpen, Layers, Activity, Smartphone } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { createClient } from '@/infrastructure/database/supabaseClient';
import EventDetailModal from '@/components/dashboard/EventDetailModal';
import SyllabusScanner from '@/components/dashboard/SyllabusScanner';

// Types
import { AcademicContent } from '@/domain/entities/AcademicContent';
import { Subject } from '@/domain/entities/Subject';

// Components
import { SubjectSkeleton, ContentSkeleton } from '@/components/dashboard/SkeletonCards';
import SubjectGrid from '@/components/dashboard/SubjectGrid';
import ContentCard from '@/components/dashboard/ContentCard';
import { StudySuggestionSection } from '@/components/dashboard/StudySuggestionSection';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import { suggestStudyBlocks } from '@/app/actions';
import StudyCalendar from '@/components/dashboard/StudyCalendar';
import { ChatSidebar } from '@/components/dashboard/ChatSidebar';
import SubjectDetailView from '@/components/dashboard/SubjectDetailView';
import BlogcitoForm from '@/components/dashboard/BlogcitoForm';

export default function Dashboard() {
    // State
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [contents, setContents] = useState<AcademicContent[]>([]);
    const [viewMode, setViewMode] = useState<'feed' | 'calendar'>('feed');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
    const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeChatContent, setActiveChatContent] = useState<AcademicContent | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
    const [isSyllabusScannerOpen, setIsSyllabusScannerOpen] = useState(false);
    const [quickAddDate, setQuickAddDate] = useState('');
    const [newEventTitle, setNewEventTitle] = useState('');
    const [selectedCalendarItem, setSelectedCalendarItem] = useState<any | null>(null);
    const [selectedSubjectForEvent, setSelectedSubjectForEvent] = useState<string>('');
    const [isMigrating, setIsMigrating] = useState(false);
    const [isAddingBlogcito, setIsAddingBlogcito] = useState(false);
    const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
    const [selectedDayContent, setSelectedDayContent] = useState<{ date: string; contents: AcademicContent[]; events: any[] } | null>(null);


    // Derived
    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

    // New Subject Form
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectColor, setNewSubjectColor] = useState('#3B82F6');

    const supabase = createClient();

    // Toast Timer is now handled by sonner

    // Initial Load
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                // Parallel Loading of initial data
                const [subjData, contentData, eventData, settingsData] = await Promise.all([
                    getSubjects(),
                    getRecentActivity(),
                    getCalendarEvents(),
                    getUserSettings()
                ]);

                setSubjects(subjData);
                setContents(contentData);

                if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
                if (settingsData.status === 'SUCCESS') setSettings(settingsData.data);
            } catch (error) {
                console.error("[Dashboard] Initial load error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // Load content for selected subject
    useEffect(() => {
        const fetchContent = async () => {
            if (selectedSubjectId) {
                setIsLoading(true);
                const result = await getContentBySubject(selectedSubjectId);
                if (result.status === 'SUCCESS') setContents(result.data || []);
                setIsLoading(false);
            } else {
                // Show recent activity if no subject selected
                const contentData = await getRecentActivity();
                setContents(contentData);
            }
        };
        fetchContent();
    }, [selectedSubjectId]);

    // Content Refresh Helper
    const refreshContent = async () => {
        if (selectedSubjectId) {
            const res = await getContentBySubject(selectedSubjectId);
            setContents(res.data || []);
        } else {
            const res = await getRecentActivity();
            setContents(res);
        }
    };

    // Actions
    // Blogcito Handlers
    const handleBlogcitoSuccess = async () => {
        setIsAddingBlogcito(false);
        await refreshContent();
    };

    const handleCreateSubject = async () => {
        if (!newSubjectName) return;
        const res = await createSubject(newSubjectName, newSubjectColor, 'book');
        if (res.status === 'SUCCESS') {
            const subj = await getSubjects();
            setSubjects(subj);

            // Auto-select the newly created subject if we're in the middle of a flow
            // Note: In a real app we'd get the ID from the response, but createSubject action currently returns SUCCESS
            // We'll find the one that matches the name we just created
            const newSubj = subj.find(s => s.name === newSubjectName);
            if (newSubj) setSelectedSubjectId(newSubj.id!);

            setIsAddSubjectModalOpen(false);
            setNewSubjectName('');
        }
    };

    const handleUpdateSubject = async () => {
        if (!subjectToEdit || !newSubjectName) return;
        const res = await updateSubject(subjectToEdit.id!, newSubjectName, newSubjectColor);
        if (res.status === 'SUCCESS') {
            const subj = await getSubjects();
            setSubjects(subj);
            setIsEditModalOpen(false);
            setNewSubjectName('');
            toast.success('Materia actualizada con éxito');
        } else {
            toast.error('Error al actualizar materia');
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta materia? Esto borrará todos sus blogcitos asociados.')) return;
        const res = await deleteSubject(id);
        if (res.status === 'SUCCESS') {
            const subj = await getSubjects();
            setSubjects(subj);
            if (selectedSubjectId === id) setSelectedSubjectId(null);
            toast.success('Materia eliminada');
        } else {
            toast.error('Error al eliminar');
        }
    };

    const handleDeleteContent = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este blogcito?')) return;
        const res = await deleteAcademicContent(id);
        if (res.status === 'SUCCESS') {
            await refreshContent();
            toast.success('Blogcito eliminado');
        } else {
            toast.error('Error al eliminar');
        }
    };

    const handleToggleSync = async () => {
        const newStatus = !settings?.googleSyncEnabled;
        const result = await toggleGoogleSync(newStatus);
        if (result.status === 'SUCCESS') {
            setSettings({ ...settings, googleSyncEnabled: newStatus });
            toast.success(`Google Calendar ${newStatus ? 'activado' : 'desactivado'}`);
        } else {
            toast.error(result.message || 'Error al cambiar sync');
        }
    };

    const handleManualSync = async () => {
        setIsProcessing(true);
        const result = await syncCalendarNow();
        if (result.status === 'SUCCESS') {
            toast.success('Sincronización completada con éxito');
            // Refresh events to show any updates
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
        } else {
            toast.error(result.message || 'Error en la sincronización');
        }
        setIsProcessing(false);
    };

    const handleQuickAddEvent = async () => {
        if (!newEventTitle.trim()) return;

        const sub = subjects.find(s => s.id === selectedSubjectForEvent);
        const color = sub?.color || '#F59E0B'; // Default Yellow

        const tempId = 'temp-' + Date.now();
        const optimisticEvent = {
            id: tempId,
            title: newEventTitle,
            eventDate: quickAddDate,
            isAllDay: true,
            color: color,
            subjectId: selectedSubjectForEvent || undefined,
            type: 'manual' as const
        };

        // Optimistic Update
        setEvents(prev => [...prev, optimisticEvent]);
        setIsAddEventModalOpen(false);
        setNewEventTitle('');
        setSelectedSubjectForEvent('');
        const toastId = toast.loading('Agendando evento...');

        const result = await createCalendarEvent({
            title: newEventTitle,
            eventDate: quickAddDate,
            isAllDay: true,
            color: color,
            subjectId: selectedSubjectForEvent || undefined
        });

        if (result.status === 'SUCCESS') {
            toast.success('Evento agendado', { id: toastId });
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
        } else {
            // Rollback
            setEvents(prev => prev.filter(e => e.id !== tempId));
            toast.error(result.message || 'Error al agendar', { id: toastId });
        }
    };

    const handleUpdateCalendarItem = async (id: string, updates: any, type: 'academic' | 'manual') => {
        // Optimistic Update
        const previousEvents = [...events];
        const previousContents = [...contents];

        if (type === 'manual') {
            setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
        } else {
            setContents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        }
        setSelectedCalendarItem(null);

        let result;
        if (type === 'academic') {
            result = await updateAcademicContent(id, updates);
        } else {
            result = await updateCalendarEvent(id, updates);
        }

        if (result.status === 'SUCCESS') {
            toast.success('Actualizado correctamente');
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
            await refreshContent();
        } else {
            // Rollback
            setEvents(previousEvents);
            setContents(previousContents);
            toast.error(result.message || 'Error al actualizar');
        }
    };

    const handleDeleteCalendarItem = async (id: string, type: 'academic' | 'manual') => {
        // Optimistic Update
        const previousEvents = [...events];
        const previousContents = [...contents];

        if (type === 'manual') {
            setEvents(prev => prev.filter(e => e.id !== id));
        } else {
            setContents(prev => prev.filter(c => c.id !== id));
        }
        setSelectedCalendarItem(null);

        let result;
        if (type === 'academic') {
            result = await deleteAcademicContent(id);
        } else {
            result = await deleteCalendarEvent(id);
        }

        if (result.status === 'SUCCESS') {
            toast.success('Eliminado correctamente');
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
            await refreshContent();
        } else {
            // Rollback
            setEvents(previousEvents);
            setContents(previousContents);
            toast.error(result.message || 'Error al eliminar');
        }
    };

    const handleMigrateIntelligence = async () => {
        setIsMigrating(true);
        const toastId = toast.loading('Actualizando inteligencia de tus materias...');
        const result = await migrateIntelligence();
        if (result.status === 'SUCCESS' && result.data) {
            toast.success(`¡Evolución completada! ${result.data.contentUpdated} blogcitos enriquecidos.`, { id: toastId });
            // Refresh everything
            const subjData = await getSubjects();
            setSubjects(subjData);
            await refreshContent();
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
        } else {
            toast.error(result.message || 'Error en la migración', { id: toastId });
        }
        setIsMigrating(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };


    return (
        <div className="min-h-screen bg-background text-foreground antialiased selection:bg-blue-100 selection:text-blue-900">
            {/* Premium Navbar */}
            <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/60 px-8 py-4 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setSelectedSubjectId(null)}>
                    <div className="bg-primary hover:bg-primary/90 p-2.5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-2xl font-black tracking-tight text-foreground">
                            Academic Pulse
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live AI Dashboard
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6 text-sm font-bold text-muted-foreground">
                        <span className="hover:text-primary cursor-pointer transition-colors relative group">
                            Documentación
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                        </span>
                        <span className="hover:text-primary cursor-pointer transition-colors relative group">
                            Soporte
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group flex h-11 w-11 items-center justify-center rounded-lg bg-secondary hover:bg-destructive/10 transition-all active:scale-95 border border-border"
                    >
                        <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                    </button>
                </div>
            </nav>

            <main className="w-full px-6 lg:px-8 py-12 space-y-20 relative">
                {selectedSubjectId && selectedSubject && !isAddingBlogcito ? (
                    <SubjectDetailView
                        subject={selectedSubject}
                        contents={contents}
                        onBack={() => setSelectedSubjectId(null)}
                        onAskAI={(content) => {
                            setActiveChatContent(content);
                            setIsChatOpen(true);
                        }}
                        onDayClick={(date, contents, events) => {
                            setSelectedDayContent({ date, contents, events });
                            setIsDayDetailModalOpen(true);
                        }}
                        onDeleteContent={handleDeleteContent}
                        onRefresh={refreshContent}
                    />
                ) : (
                    <>
                        {/* Summary & Analytics - Minimalist Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-in slide-in-from-top-4 duration-500">
                            <div className="p-8 rounded-xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                                <BookOpen className="w-8 h-8 text-primary mb-4" />
                                <h4 className="text-4xl font-black text-foreground">{subjects.length}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Materias Activas</p>
                            </div>
                            <div className="p-8 rounded-xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                                <FileText className="w-8 h-8 text-purple-600 mb-4" />
                                <h4 className="text-4xl font-black text-foreground">{contents.length}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Blogcitos Totales</p>
                            </div>
                            <div className="p-8 rounded-xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                                <Activity className="w-8 h-8 text-orange-500 mb-4" />
                                <h4 className="text-4xl font-black text-foreground">{events.length}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Eventos en Agenda</p>
                            </div>
                        </div>

                        {/* Subjects Grid Selection */}
                        <section className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                                <div className="space-y-2">
                                    <h2 className="text-5xl font-black tracking-tighter text-foreground font-display">Explorar Materias</h2>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Tu cerebro digital organizado</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsAddSubjectModalOpen(true)}
                                        className="flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-lg font-black text-xs uppercase tracking-widest hover:bg-foreground/90 active:scale-95 transition-all shadow-xl shadow-black/5"
                                    >
                                        <Plus className="w-4 h-4" /> Nueva Materia
                                    </button>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                                    {[1, 2, 3, 4].map(i => <SubjectSkeleton key={i} />)}
                                </div>
                            ) : subjects.length === 0 ? (
                                <div className="py-20 text-center bg-card rounded-2xl border border-dashed border-border">
                                    <div className="bg-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <BookOpen className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">¡Tu mochila está vacía!</h3>
                                    <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                                        Empieza creando una materia como "Algoritmos" o "Física" para comenzar a potenciar tu estudio.
                                    </p>
                                    <button
                                        onClick={() => setIsAddSubjectModalOpen(true)}
                                        className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-lg shadow-blue-500/10"
                                    >
                                        Crear mi Primera Materia
                                    </button>
                                </div>
                            ) : (
                                <SubjectGrid
                                    subjects={subjects}
                                    selectedSubjectId={selectedSubjectId || undefined}
                                    onSelectSubject={setSelectedSubjectId}
                                    onEditSubject={(s) => {
                                        setSubjectToEdit(s);
                                        setNewSubjectName(s.name);
                                        setNewSubjectColor(s.color);
                                        setIsEditModalOpen(true);
                                    }}
                                    onDeleteSubject={handleDeleteSubject}
                                />
                            )}
                        </section>

                        <div className="space-y-16">
                            {/* Draggable Dashboard Grid */}
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <DashboardGrid
                                    subjects={subjects}
                                    contents={contents}
                                    events={events}
                                    onEditEvent={setSelectedCalendarItem}
                                    onDayClick={(date, contents, events) => {
                                        setSelectedDayContent({ date, contents, events });
                                        setIsDayDetailModalOpen(true);
                                    }}
                                    onAskAI={(content) => {
                                        setActiveChatContent(content);
                                        setIsChatOpen(true);
                                    }}
                                    onDeleteContent={handleDeleteContent}
                                    onRefresh={refreshContent}
                                />
                            </div>

                            {/* Bottom Section: Integrations & Utilities */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-border">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center border border-border">
                                            <Settings className="text-primary w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight text-foreground font-display">Integraciones</h3>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Conectividad</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center border border-border shadow-sm">
                                                <Smartphone className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <span className="block text-md font-bold text-foreground">Google Calendar</span>
                                                <span className="block text-xs text-muted-foreground font-bold">Auto-Sync Blogcitos</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleToggleSync}
                                            className={`w-14 h-7 rounded-full transition-all relative ${settings?.googleSyncEnabled ? 'bg-primary' : 'bg-secondary'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-background shadow-md transition-all ${settings?.googleSyncEnabled ? 'left-8' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-end">
                                    <button
                                        onClick={handleMigrateIntelligence}
                                        disabled={isMigrating}
                                        className="w-full h-24 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-transparent hover:from-purple-100 hover:via-white border border-purple-200 text-purple-600 text-xs font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 group disabled:opacity-50 shadow-sm hover:shadow-md"
                                    >
                                        <Activity className={`w-6 h-6 ${isMigrating ? 'animate-spin' : 'group-hover:scale-125 transition-transform'}`} />
                                        {isMigrating ? 'Evolucionando Datos...' : 'Enriquecer Inteligencia Artificial'}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </>
                )}
            </main>

            {/* Premium Modal for New Subject */}
            {
                isAddSubjectModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                        <div className="bg-card rounded-3xl shadow-2xl border border-border max-w-md w-full p-10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

                            <h3 className="text-3xl font-extrabold mb-2 text-foreground font-display">Nueva Materia</h3>
                            <p className="text-muted-foreground text-sm mb-8">Personaliza tu entorno de estudio.</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Asignatura</label>
                                    <input
                                        type="text"
                                        value={newSubjectName}
                                        onChange={e => setNewSubjectName(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:bg-card outline-none transition-all font-bold text-foreground"
                                        placeholder="Ej. Macroeconomía"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Identidad Visual</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setNewSubjectColor(color)}
                                                className={`w-10 h-10 rounded-lg transition-all hover:scale-110 active:scale-90 ${newSubjectColor === color ? 'ring-4 ring-offset-4 ring-foreground' : 'opacity-60 hover:opacity-100'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12">
                                <button
                                    onClick={() => setIsAddSubjectModalOpen(false)}
                                    className="flex-1 py-4 text-muted-foreground font-bold hover:bg-secondary rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreateSubject}
                                    className="flex-1 py-4 bg-foreground text-background rounded-xl font-bold shadow-xl hover:shadow-black/20 active:scale-95 transition-all"
                                >
                                    Crear
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Premium Modal for Editing Subject */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                        <div className="bg-card rounded-3xl shadow-2xl border border-border max-w-md w-full p-10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

                            <h3 className="text-3xl font-extrabold mb-2 text-foreground font-display">Editar Materia</h3>
                            <p className="text-muted-foreground text-sm mb-8">Personaliza tu entorno de estudio.</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Asignatura</label>
                                    <input
                                        type="text"
                                        value={newSubjectName}
                                        onChange={e => setNewSubjectName(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:bg-card outline-none transition-all font-bold text-foreground"
                                        placeholder="Ej. Macroeconomía"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Identidad Visual</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setNewSubjectColor(color)}
                                                className={`w-10 h-10 rounded-lg transition-all hover:scale-110 active:scale-90 ${newSubjectColor === color ? 'ring-4 ring-offset-4 ring-foreground' : 'opacity-60 hover:opacity-100'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 text-muted-foreground font-bold hover:bg-secondary rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdateSubject}
                                    className="flex-1 py-4 bg-foreground text-background rounded-xl font-bold shadow-xl hover:shadow-black/20 active:scale-95 transition-all"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Quick Add Event Modal */}
            {
                isAddEventModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                        <div className="bg-card rounded-3xl shadow-2xl border border-border max-w-md w-full p-10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-blue-50">
                                    <Plus className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-extrabold tracking-tight text-foreground font-display">Agendar Evento</h3>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{quickAddDate}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Título del Evento</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newEventTitle}
                                        onChange={e => setNewEventTitle(e.target.value)}
                                        // Submit on Enter
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleQuickAddEvent();
                                        }}
                                        className="w-full p-4 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:bg-card outline-none transition-all font-bold text-foreground"
                                        placeholder="Ej. Examen de Cálculo"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Vincular a Materia</label>
                                    <select
                                        value={selectedSubjectForEvent}
                                        onChange={e => setSelectedSubjectForEvent(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-secondary border-2 border-transparent focus:border-primary focus:bg-card outline-none transition-all font-bold appearance-none cursor-pointer text-foreground"
                                    >
                                        <option value="">General (Ninguna)</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12">
                                <button
                                    onClick={() => {
                                        setIsAddEventModalOpen(false);
                                        setSelectedSubjectForEvent('');
                                    }}
                                    className="flex-1 py-4 text-muted-foreground font-bold hover:bg-secondary rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleQuickAddEvent}
                                    disabled={isProcessing || !newEventTitle.trim()}
                                    className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isProcessing ? 'Agendando...' : 'Agendar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Event Detail Modal */}
            {
                selectedCalendarItem && (
                    <EventDetailModal
                        item={selectedCalendarItem}
                        subjects={subjects}
                        onClose={() => setSelectedCalendarItem(null)}
                        onSave={handleUpdateCalendarItem}
                        onDelete={handleDeleteCalendarItem}
                    />
                )
            }

            <Toaster position="top-right" theme="light" richColors closeButton />
            <footer className="py-12 mt-20 border-t border-border text-center">
                <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
                    © 2026 Academic Pulse • Premium Neutral v3.0
                </p>
            </footer>

            {/* Loading / Processing Overlay for UX */}
            {
                isProcessing && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-foreground text-background px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
                        <div className="h-4 w-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                        <span className="text-sm font-bold tracking-tight">IA ANALIZANDO CONTENIDO...</span>
                    </div>
                )
            }

            {/* Syllabus Scanner Modal */}
            {
                isSyllabusScannerOpen && selectedSubjectId && (
                    <div
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300"
                        onClick={() => setIsSyllabusScannerOpen(false)}
                    >
                        <div
                            className="bg-card rounded-[3rem] shadow-2xl border border-border max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
                            onClick={e => e.stopPropagation()}
                        >
                            <SyllabusScanner
                                subjectId={selectedSubjectId}
                                subjectColor={selectedSubject?.color || '#3B82F6'}
                                onClose={() => setIsSyllabusScannerOpen(false)}
                                onComplete={() => {
                                    setIsSyllabusScannerOpen(false);
                                    // Refresh calendar events after scan
                                    getCalendarEvents().then(res => {
                                        if (res.status === 'SUCCESS') setEvents(res.data || []);
                                    });
                                    toast.success('Syllabus procesado con éxito');
                                }}
                            />
                        </div>
                    </div>
                )
            }


            {isDayDetailModalOpen && selectedDayContent && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <div className="bg-card rounded-[3rem] border border-border shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative">
                        {/* Header */}
                        <div className="p-8 border-b border-border flex justify-between items-center bg-card/50 sticky top-0 z-10">
                            <div>
                                <h3 className="text-3xl font-black text-foreground font-display">{new Date(selectedDayContent.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Snapshot del día</p>
                            </div>
                            <button
                                onClick={() => setIsDayDetailModalOpen(false)}
                                className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all hover:scale-110 active:scale-95"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                            {selectedDayContent.contents.length === 0 && selectedDayContent.events.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <div className="text-6xl opacity-20 grayscale">📭</div>
                                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Sin actividades para este día</p>
                                </div>
                            ) : (
                                <>
                                    {selectedDayContent.contents.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4">Clases y Apuntes</h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                {selectedDayContent.contents.map(content => (
                                                    <div key={content.id} className="group glass-morphism p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-300" onClick={() => {
                                                        setSelectedCalendarItem(content);
                                                        setIsDayDetailModalOpen(false);
                                                    }}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{content.title}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                                        {(content as any).subject_name || 'Sin materia'}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                                                        {(content as any).type || 'Nota'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {content.summary && (
                                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 bg-white/5 p-2 rounded-lg italic border-l-2 border-primary/40">
                                                                "{content.summary}"
                                                            </p>
                                                        )}

                                                        <div className="flex items-center gap-2 mt-2">
                                                            {(content as any).transcription && (
                                                                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md border border-emerald-500/20">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                    Transcripción lista
                                                                </span>
                                                            )}
                                                            {(content as any).processed_summary && (
                                                                <span className="flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md border border-blue-500/20">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                    Resumen IA
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedDayContent.events.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4">Eventos Manuales</h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                {selectedDayContent.events.map(e => (
                                                    <div key={e.id} className="group p-6 rounded-[2rem] bg-secondary/30 border border-border hover:border-border/80 transition-all cursor-pointer" onClick={() => {
                                                        setSelectedCalendarItem(e);
                                                        setIsDayDetailModalOpen(false);
                                                    }}>
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: e.color || '#3B82F6' }} />
                                                                <h5 className="text-lg font-black text-foreground">{e.title}</h5>
                                                            </div>
                                                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border border-border">
                                                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-border bg-card/50">
                            <button
                                onClick={() => {
                                    setQuickAddDate(selectedDayContent.date);
                                    setIsAddEventModalOpen(true);
                                    setIsDayDetailModalOpen(false);
                                }}
                                className="w-full py-5 rounded-xl bg-foreground text-background font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
                            >
                                <Plus className="w-4 h-4" /> Agregar Evento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ChatSidebar
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                content={activeChatContent}
            />

            <MobileFAB
                onAddSubject={() => setIsAddSubjectModalOpen(true)}
                onAddEvent={() => {
                    setSelectedCalendarItem({ date: new Date().toISOString().split('T')[0] });
                    setIsAddEventModalOpen(true);
                }}
            />
        </div>
    );
}

const MobileFAB: React.FC<{
    onAddSubject: () => void;
    onAddEvent: () => void;
}> = ({ onAddSubject, onAddEvent }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-[60] md:hidden">
            {isOpen && (
                <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <button
                        onClick={() => { onAddEvent(); setIsOpen(false); }}
                        className="flex items-center gap-2 bg-secondary/90 backdrop-blur-md border border-border/50 text-foreground px-4 py-3 rounded-full shadow-lg hover:scale-105 transition-all"
                    >
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Nuevo Evento</span>
                    </button>
                    <button
                        onClick={() => { onAddSubject(); setIsOpen(false); }}
                        className="flex items-center gap-2 bg-secondary/90 backdrop-blur-md border border-border/50 text-foreground px-4 py-3 rounded-full shadow-lg hover:scale-105 transition-all"
                    >
                        <Plus className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Nueva Materia</span>
                    </button>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-destructive rotate-45' : 'bg-primary hover:scale-110'}`}
            >
                <Plus className={`w-8 h-8 ${isOpen ? 'text-white' : 'text-primary-foreground'}`} />
            </button>
        </div>
    );
};
