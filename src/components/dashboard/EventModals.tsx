'use client';

import React from 'react';
import { X, Plus, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import { Subject } from '@/domain/entities/Subject';

interface EventModalsProps {
    isAddEventModalOpen: boolean;
    setIsAddEventModalOpen: (open: boolean) => void;
    newEventTitle: string;
    setNewEventTitle: (title: string) => void;
    quickAddDate: string;
    setQuickAddDate: (date: string) => void;
    selectedSubjectForEvent: string;
    setSelectedSubjectForEvent: (id: string) => void;
    subjects: Subject[];
    handleQuickAddEvent: () => void;
    isDayDetailModalOpen: boolean;
    setIsDayDetailModalOpen: (open: boolean) => void;
    selectedDayContent: { date: string; contents: AcademicContent[]; events: any[] } | null;
    setSelectedCalendarItem: (item: any) => void;
}

/**
 * Modales relacionados con eventos y vistas de detalle por día.
 */
const EventModals: React.FC<EventModalsProps> = ({
    isAddEventModalOpen,
    setIsAddEventModalOpen,
    newEventTitle,
    setNewEventTitle,
    quickAddDate,
    setQuickAddDate,
    selectedSubjectForEvent,
    setSelectedSubjectForEvent,
    subjects,
    handleQuickAddEvent,
    isDayDetailModalOpen,
    setIsDayDetailModalOpen,
    selectedDayContent,
    setSelectedCalendarItem
}) => {
    return (
        <>
            {/* Modal: Agregar Evento Rápido */}
            {isAddEventModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsAddEventModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Agendar Sesión</h3>
                                <p className="text-sm font-medium text-gray-500">Bloquea tiempo para tu éxito</p>
                            </div>
                            <button onClick={() => setIsAddEventModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">¿Qué vas a estudiar?</label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    placeholder="Ej: Repaso de Álgebra Lineal"
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-none ring-1 ring-gray-200 dark:ring-gray-700/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
                                    <input
                                        type="date"
                                        value={quickAddDate}
                                        onChange={(e) => setQuickAddDate(e.target.value)}
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-none ring-1 ring-gray-200 dark:ring-gray-700/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Materia</label>
                                    <select
                                        value={selectedSubjectForEvent}
                                        onChange={(e) => setSelectedSubjectForEvent(e.target.value)}
                                        className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-none ring-1 ring-gray-200 dark:ring-gray-700/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white text-sm appearance-none"
                                    >
                                        <option value="">Ninguna</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleQuickAddEvent}
                                className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                            >
                                <CalendarIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span className="uppercase tracking-widest text-xs">Confirmar Evento</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Detalle del Día */}
            {isDayDetailModalOpen && selectedDayContent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsDayDetailModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="relative h-32 bg-indigo-600 p-8 flex items-end justify-between overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black text-white capitalize">{new Date(selectedDayContent.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                                <p className="text-indigo-100 font-bold uppercase tracking-widest text-[10px] mt-1 opacity-80">Actividades Programadas</p>
                            </div>
                            <button onClick={() => setIsDayDetailModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8 custom-scrollbar">
                            {selectedDayContent.contents.length === 0 && selectedDayContent.events.length === 0 ? (
                                <div className="py-12 flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <CalendarIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Sin actividades para este día</p>
                                </div>
                            ) : (
                                <>
                                    {selectedDayContent.contents.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Clases y Apuntes</h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                {selectedDayContent.contents.map(content => (
                                                    <div key={content.id} className="group bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-transparent hover:border-indigo-500/30 transition-all duration-300 cursor-pointer" onClick={() => {
                                                        setSelectedCalendarItem(content);
                                                        setIsDayDetailModalOpen(false);
                                                    }}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{content.title}</h4>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="text-[10px] px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-black uppercase tracking-wider">
                                                                        {(content as any).subject_name || 'Sin materia'}
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                                        <FileText className="w-3 h-3" />
                                                                        <span className="text-[10px] uppercase tracking-widest font-black">
                                                                            {(content as any).type || 'Nota'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {content.summary && (
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-4 bg-white dark:bg-gray-900/50 p-4 rounded-2xl italic border-l-4 border-indigo-500/40 leading-relaxed shadow-sm">
                                                                "{content.summary}"
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedDayContent.events.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Eventos Manuales</h4>
                                            <div className="grid grid-cols-1 gap-4">
                                                {selectedDayContent.events.map(e => (
                                                    <div key={e.id} className="group p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-indigo-500/30 transition-all cursor-pointer" onClick={() => {
                                                        setSelectedCalendarItem(e);
                                                        setIsDayDetailModalOpen(false);
                                                    }}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: e.color || '#3B82F6' }} />
                                                            <h5 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{e.title}</h5>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => {
                                    setQuickAddDate(selectedDayContent.date);
                                    setIsAddEventModalOpen(true);
                                    setIsDayDetailModalOpen(false);
                                }}
                                className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20"
                            >
                                <Plus className="w-4 h-4" /> Agregar Evento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EventModals;
