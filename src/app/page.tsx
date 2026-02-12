'use client';

import { useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
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
import { LogOut, BookOpen, Plus, Activity, Calendar, FileText, Video, Globe, CheckCircle2, AlertCircle, Trash2, Settings, Smartphone } from 'lucide-react';
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
import StudyCalendar from '@/components/dashboard/StudyCalendar';
import { ChatSidebar } from '@/components/dashboard/ChatSidebar';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
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

    // New Subject Form
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectColor, setNewSubjectColor] = useState('#3B82F6');

    const supabase = createClient();

    // Toast Timer
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            const subjData = await getSubjects();
            setSubjects(subjData);
            const contentData = await getRecentActivity();
            setContents(contentData);

            // Phase 9: Load Calendar Events and Settings
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);

            const settingsData = await getUserSettings();
            if (settingsData.status === 'SUCCESS') setSettings(settingsData.data);

            setIsLoading(false);
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

    // Actions
    const handleProcess = async () => {
        if (!transcription.trim()) return;
        setIsProcessing(true);

        const formData = new FormData();
        formData.append('transcription', transcription);
        formData.append('classDate', classDate);
        if (selectedSubjectId) formData.append('subjectId', selectedSubjectId);

        const result = await processAcademicTranscription(formData);

        if (result.status === 'SUCCESS') {
            setTranscription('');
            // Refresh content
            if (selectedSubjectId) {
                const res = await getContentBySubject(selectedSubjectId);
                setContents(res.data || []);
            } else {
                const res = await getRecentActivity();
                setContents(res);
            }
        } else {
            alert('Error: ' + result.message);
        }
        setIsProcessing(false);
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

            setIsModalOpen(false);
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
            setToast({ message: 'Materia actualizada con éxito', type: 'success' });
        } else {
            setToast({ message: 'Error al actualizar materia', type: 'error' });
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta materia? Esto borrará todos sus blogcitos asociados.')) return;
        const res = await deleteSubject(id);
        if (res.status === 'SUCCESS') {
            const subj = await getSubjects();
            setSubjects(subj);
            if (selectedSubjectId === id) setSelectedSubjectId(null);
            setToast({ message: 'Materia eliminada', type: 'success' });
        } else {
            setToast({ message: 'Error al eliminar', type: 'error' });
        }
    };

    const handleDeleteContent = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este blogcito?')) return;
        const res = await deleteAcademicContent(id);
        if (res.status === 'SUCCESS') {
            // Refresh content
            if (selectedSubjectId) {
                const r = await getContentBySubject(selectedSubjectId);
                setContents(r.data || []);
            } else {
                const r = await getRecentActivity();
                setContents(r);
            }
            setToast({ message: 'Blogcito eliminado', type: 'success' });
        } else {
            setToast({ message: 'Error al eliminar', type: 'error' });
        }
    };

    const handleToggleSync = async () => {
        const newStatus = !settings?.googleSyncEnabled;
        const result = await toggleGoogleSync(newStatus);
        if (result.status === 'SUCCESS') {
            setSettings({ ...settings, googleSyncEnabled: newStatus });
            setToast({ message: `Google Calendar ${newStatus ? 'activado' : 'desactivado'}`, type: 'success' });
        } else {
            setToast({ message: result.message || 'Error al cambiar sync', type: 'error' });
        }
    };

    const handleManualSync = async () => {
        setIsProcessing(true);
        const result = await syncCalendarNow();
        if (result.status === 'SUCCESS') {
            setToast({ message: 'Sincronización completada con éxito', type: 'success' });
            // Refresh events to show any updates
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
        } else {
            setToast({ message: result.message || 'Error en la sincronización', type: 'error' });
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
        setIsQuickAddModalOpen(false);
        setNewEventTitle('');
        setSelectedSubjectForEvent('');
        setToast({ message: 'Agendando evento...', type: 'success' });

        const result = await createCalendarEvent({
            title: newEventTitle,
            eventDate: quickAddDate,
            isAllDay: true,
            color: color,
            subjectId: selectedSubjectForEvent || undefined
        });

        if (result.status === 'SUCCESS') {
            setToast({ message: 'Evento agendado', type: 'success' });
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
        } else {
            // Rollback
            setEvents(prev => prev.filter(e => e.id !== tempId));
            setToast({ message: result.message || 'Error al agendar', type: 'error' });
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
            setToast({ message: 'Actualizado correctamente', type: 'success' });
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);

            if (selectedSubjectId) {
                const contentData = await getContentBySubject(selectedSubjectId);
                if (contentData.status === 'SUCCESS') setContents(contentData.data || []);
            } else {
                const contentData = await getRecentActivity();
                setContents(contentData);
            }
        } else {
            // Rollback
            setEvents(previousEvents);
            setContents(previousContents);
            setToast({ message: result.message || 'Error al actualizar', type: 'error' });
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
            setToast({ message: 'Eliminado correctamente', type: 'success' });
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);

            if (selectedSubjectId) {
                const contentData = await getContentBySubject(selectedSubjectId);
                if (contentData.status === 'SUCCESS') setContents(contentData.data || []);
            } else {
                const contentData = await getRecentActivity();
                setContents(contentData);
            }
        } else {
            // Rollback
            setEvents(previousEvents);
            setContents(previousContents);
            setToast({ message: result.message || 'Error al eliminar', type: 'error' });
        }
    };

    const handleMigrateIntelligence = async () => {
        setIsMigrating(true);
        setToast({ message: 'Actualizando inteligencia de tus materias...', type: 'success' });
        const result = await migrateIntelligence();
        if (result.status === 'SUCCESS' && result.data) {
            setToast({
                message: `¡Evolución completada! ${result.data.contentUpdated} blogcitos enriquecidos.`,
                type: 'success'
            });
            // Refresh everything
            const subjData = await getSubjects();
            setSubjects(subjData);
            const contentData = await getRecentActivity();
            setContents(contentData);
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
        } else {
            setToast({ message: result.message || 'Error en la migración', type: 'error' });
        }
        setIsMigrating(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

    return (
        <div className="min-h-screen">
            {/* Ultra-Modern Navbar */}
            <nav className="sticky top-0 z-50 glass-morphism border-b border-gray-200/50 dark:border-gray-800/50 px-8 py-4 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all duration-500 group-hover:rotate-[360deg] group-hover:scale-110">
                        <Activity className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-300">
                            Academic Pulse
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live AI Dashboard
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-400">
                        <span className="hover:text-blue-600 cursor-pointer transition-colors relative group">
                            Documentation
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                        </span>
                        <span className="hover:text-blue-600 cursor-pointer transition-colors relative group">
                            Support
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="group flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 hover:bg-red-50 dark:bg-gray-800/50 dark:hover:bg-red-900/20 transition-all active:scale-90 border border-gray-200/50 dark:border-gray-700/50"
                    >
                        <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                </div>
            </nav>

            <main className="max-w-[1600px] mx-auto p-8 space-y-12">

                {/* Hero / Subject Explorer */}
                <section className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                                {selectedSubjectId ? `Explorando: ${selectedSubject?.name}` : 'Tus Materias'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-lg">
                                Selecciona una materia para ver tus apuntes, resúmenes y planes de estudio generados por IA.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedSubjectId(null)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${!selectedSubjectId
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-500'
                                    }`}
                            >
                                Ver Todas
                            </button>
                            {selectedSubjectId && (
                                <button
                                    onClick={() => setIsSyllabusScannerOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold border border-blue-100 dark:border-blue-800/50 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                >
                                    <FileText className="w-4 h-4" /> Escanear Syllabus
                                </button>
                            )}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                <Plus className="w-4 h-4" /> Agregar Materia
                            </button>
                        </div>
                    </div>

                    <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900/50 dark:to-gray-800/50">
                        {isLoading ? (
                            <SubjectSkeleton />
                        ) : subjects.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-10 h-10 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">¡Tu mochila está vacía!</h3>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                    Empieza creando una materia como "Algoritmos" o "Física" para comenzar a potenciar tu estudio.
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25"
                                >
                                    Crear mi Primera Materia
                                </button>
                            </div>
                        ) : (
                            <SubjectGrid
                                subjects={subjects}
                                onSelectSubject={setSelectedSubjectId}
                                onEditSubject={(s) => {
                                    setSubjectToEdit(s);
                                    setNewSubjectName(s.name);
                                    setNewSubjectColor(s.color);
                                    setIsEditModalOpen(true);
                                }}
                                onDeleteSubject={handleDeleteSubject}
                                selectedSubjectId={selectedSubjectId || undefined}
                            />
                        )}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: AI Input */}
                    <div className="lg:col-span-12 xl:col-span-5">
                        <div className="sticky top-24 space-y-6">
                            <div className="p-8 rounded-[3rem] glass-morphism shadow-2xl shadow-blue-500/5 space-y-8 animate-in slide-in-from-left-4 duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Plus className="text-white w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">Nuevo Blogcito</h3>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Captura Inteligente</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* 1. Materia Selector */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">1. Selecciona la Materia</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={selectedSubjectId || ''}
                                                onChange={(e) => setSelectedSubjectId(e.target.value || null)}
                                                className="flex-1 p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                                            >
                                                <option value="">-- Elige una materia --</option>
                                                {subjects.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="p-4 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                                title="Nueva Materia"
                                            >
                                                <Plus className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. Fecha Selector */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">2. Fecha de la Clase</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={classDate}
                                                onChange={(e) => setClassDate(e.target.value)}
                                                className="w-full p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/80 border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold cursor-pointer"
                                            />
                                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* 3. Transcripción */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">3. Transcripción / Notas</label>
                                        <div className="group relative">
                                            <textarea
                                                value={transcription}
                                                onChange={(e) => setTranscription(e.target.value)}
                                                placeholder="¿Qué aprendiste hoy? Pega tu resumen, transcripción o notas para que la IA genere el blogcito..."
                                                className="w-full h-64 p-6 rounded-[2rem] bg-gray-50/80 dark:bg-gray-800/80 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none text-gray-700 dark:text-gray-200 resize-none font-medium leading-relaxed"
                                            />
                                            <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500 group-focus-within:animate-ping" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleProcess}
                                    disabled={isProcessing || !transcription || !selectedSubjectId}
                                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-lg shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-30 disabled:hover:translate-y-0"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="h-5 w-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                            <span>DESTILANDO CONOCIMIENTO...</span>
                                        </div>
                                    ) : (
                                        'GENERAR BLOGCITO'
                                    )}
                                </button>

                                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    impulsado por gemini flash 1.5
                                </p>
                            </div>

                            {/* Integrations Card */}
                            <div className="p-8 rounded-[3rem] glass-morphism shadow-2xl shadow-blue-500/5 space-y-6 animate-in slide-in-from-left-4 duration-700 delay-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                        <Settings className="text-blue-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight">Integraciones</h3>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Conectividad</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 group hover:border-blue-500/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                                            <Smartphone className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">Google Calendar</span>
                                            <span className="block text-[10px] text-gray-400 font-bold">Auto-Sync Blogcitos</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleToggleSync}
                                        className={`w-12 h-6 rounded-full transition-all relative ${settings?.googleSyncEnabled ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${settings?.googleSyncEnabled ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <p className="text-[10px] text-gray-400 font-medium px-2 leading-relaxed">
                                    Al activar el sync, tus blogcitos se agendarán automáticamente como eventos de todo el día.
                                </p>

                                {settings?.googleSyncEnabled && (
                                    <button
                                        onClick={handleManualSync}
                                        disabled={isProcessing}
                                        className="mt-2 w-full py-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        <Smartphone className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                                        {isProcessing ? 'Sincronizando...' : 'Sincronizar ahora'}
                                    </button>
                                )}

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={handleMigrateIntelligence}
                                        disabled={isMigrating}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 hover:from-purple-600/20 hover:to-blue-600/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] border border-purple-200/50 dark:border-purple-800/50 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                                    >
                                        <Activity className={`w-4 h-4 ${isMigrating ? 'animate-spin' : 'group-hover:scale-125 transition-transform'}`} />
                                        {isMigrating ? 'Evolucionando Datos...' : 'Enriquecer Inteligencia'}
                                    </button>
                                    <p className="mt-3 text-[9px] text-gray-400 text-center font-medium leading-relaxed">
                                        Analiza registros antiguos para extraer pesos de evaluación y temas de estudio faltantes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Insights Display (Blogcito Feed) */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-12">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                    <Activity className="text-blue-600 w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">
                                        {selectedSubjectId ? `${viewMode === 'feed' ? 'Blog' : 'Agenda'} de ${selectedSubject?.name}` : viewMode === 'feed' ? 'Feed Académico' : 'Agenda Académica'}
                                    </h2>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                        {viewMode === 'feed' ? 'Últimos Conocimientos Destilados' : 'Planificación Estratégica'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setViewMode('feed')}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${viewMode === 'feed' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Feed
                                </button>
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Agenda
                                </button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="max-w-3xl mx-auto space-y-8">
                                <ContentSkeleton />
                                <ContentSkeleton />
                            </div>
                        ) : viewMode === 'calendar' ? (
                            <div className="animate-in fade-in zoom-in-95 duration-700">
                                <StudyCalendar
                                    contents={contents}
                                    events={events}
                                    onItemClick={(item) => setSelectedCalendarItem(item)}
                                    onAddEvent={(date) => {
                                        setQuickAddDate(date);
                                        setIsQuickAddModalOpen(true);
                                    }}
                                />
                            </div>
                        ) : contents.length === 0 ? (
                            <div className="py-32 rounded-[3.5rem] border-4 border-dashed border-gray-50 dark:border-gray-800/50 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto">
                                <div className="text-8xl mb-8 grayscale opacity-20 filter blur-[1px]">📚</div>
                                <h3 className="text-2xl font-black text-gray-300 dark:text-gray-700">El feed está en silencio</h3>
                                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-[280px] mt-2 font-medium">
                                    Tu viaje de aprendizaje comienza con tu primera transcripción.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-12 max-w-3xl mx-auto pb-20">
                                {contents.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        id={`content-${item.id}`}
                                        className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both"
                                        style={{ animationDelay: `${idx * 150}ms` }}
                                    >
                                        <ContentCard
                                            content={item}
                                            onAskAI={(content) => {
                                                setActiveChatContent(content);
                                                setIsChatOpen(true);
                                            }}
                                            onDelete={handleDeleteContent}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Premium Modal for New Subject */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-3xl max-w-md w-full p-10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

                        <h3 className="text-3xl font-extrabold mb-2">Nueva Materia</h3>
                        <p className="text-gray-500 text-sm mb-8">Personaliza tu entorno de estudio.</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Asignatura</label>
                                <input
                                    type="text"
                                    value={newSubjectName}
                                    onChange={e => setNewSubjectName(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
                                    placeholder="Ej. Macroeconomía"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Identidad Visual</label>
                                <div className="flex flex-wrap gap-3">
                                    {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setNewSubjectColor(color)}
                                            className={`w-10 h-10 rounded-2xl transition-all hover:scale-110 active:scale-90 ${newSubjectColor === color ? 'ring-4 ring-offset-4 ring-gray-900 dark:ring-white' : 'opacity-60 hover:opacity-100'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-12">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateSubject}
                                className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-xl hover:shadow-gray-500/20 active:scale-95 transition-all"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Modal for Editing Subject */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-3xl max-w-md w-full p-10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

                        <h3 className="text-3xl font-extrabold mb-2">Editar Materia</h3>
                        <p className="text-gray-500 text-sm mb-8">Personaliza tu entorno de estudio.</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Asignatura</label>
                                <input
                                    type="text"
                                    value={newSubjectName}
                                    onChange={e => setNewSubjectName(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
                                    placeholder="Ej. Macroeconomía"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Identidad Visual</label>
                                <div className="flex flex-wrap gap-3">
                                    {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setNewSubjectColor(color)}
                                            className={`w-10 h-10 rounded-2xl transition-all hover:scale-110 active:scale-90 ${newSubjectColor === color ? 'ring-4 ring-offset-4 ring-gray-900 dark:ring-white' : 'opacity-60 hover:opacity-100'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-12">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateSubject}
                                className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-xl hover:shadow-gray-500/20 active:scale-95 transition-all"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Event Modal */}
            {isQuickAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-3xl max-w-md w-full p-10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30">
                                <Plus className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold tracking-tight">Agendar Evento</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{quickAddDate}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Título del Evento</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newEventTitle}
                                    onChange={e => setNewEventTitle(e.target.value)}
                                    // Submit on Enter
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleQuickAddEvent();
                                    }}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-bold"
                                    placeholder="Ej. Examen de Cálculo"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Vincular a Materia</label>
                                <select
                                    value={selectedSubjectForEvent}
                                    onChange={e => setSelectedSubjectForEvent(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-bold appearance-none cursor-pointer"
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
                                    setIsQuickAddModalOpen(false);
                                    setSelectedSubjectForEvent('');
                                }}
                                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleQuickAddEvent}
                                disabled={isProcessing || !newEventTitle.trim()}
                                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isProcessing ? 'Agendando...' : 'Agendar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Premium Toast Notification */}
            {
                toast && (
                    <div className={`fixed top-24 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-500 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-bold tracking-tight">{toast.message}</span>
                    </div>
                )
            }
            <footer className="py-12 mt-20 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                    © 2026 Academic Pulse • Dashboard Premium v2.0
                </p>
            </footer>

            {/* Loading / Processing Overlay for UX */}
            {
                isProcessing && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span className="text-sm font-bold tracking-tight">IA ANALIZANDO CONTENIDO...</span>
                    </div>
                )
            }

            {/* Syllabus Scanner Modal */}
            {isSyllabusScannerOpen && selectedSubjectId && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300"
                    onClick={() => setIsSyllabusScannerOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
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
                                setToast({ message: 'Syllabus procesado con éxito', type: 'success' });
                            }}
                        />
                    </div>
                </div>
            )}

            <ChatSidebar
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                content={activeChatContent}
            />
        </div>
    );
}

