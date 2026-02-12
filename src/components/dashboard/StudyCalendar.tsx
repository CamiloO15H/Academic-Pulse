'use client';

import React, { useState } from 'react';
import { AcademicContent } from '../../domain/entities/AcademicContent';
import { CalendarEvent } from '../../domain/entities/CalendarEvent';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { suggestStudyBlocks } from '@/app/actions';
import { StudySuggestionSection } from './StudySuggestionSection';

interface StudyCalendarProps {
    contents: AcademicContent[];
    events?: any[];
    onItemClick?: (item: any) => void;
    onAddEvent?: (date: string) => void;
}

const StudyCalendar: React.FC<StudyCalendarProps> = ({ contents, events = [], onItemClick, onAddEvent }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleGetSuggestions = async () => {
        setIsSuggesting(true);
        const result = await suggestStudyBlocks();
        if (result.status === 'SUCCESS' && result.data) {
            setSuggestions(result.data);
            setShowSuggestions(true);
        }
        setIsSuggesting(false);
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Filter contents that have a classDate in this month
    const contentsThisMonth = contents.filter(c => {
        if (!c.classDate) return false;
        const d = new Date(c.classDate);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    // Filter manual events for this month
    const eventsThisMonth = events.filter(e => {
        if (e.type !== 'manual') return false;
        const d = new Date(e.eventDate);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    // Also include study goals based on deadlines
    const deadlinesThisMonth = contents.filter(c => {
        if (!c.deadline) return false;
        const d = new Date(c.deadline);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-gray-100/50 dark:border-gray-800/50 bg-gray-50/20 dark:bg-gray-900/10" />);
    }

    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayContents = contentsThisMonth.filter(c => new Date(c.classDate!).getDate() === d);
        const dayManualEvents = eventsThisMonth.filter(e => new Date(e.eventDate).getDate() === d);
        const dayDeadlines = deadlinesThisMonth.filter(c => new Date(c.deadline!).getDate() === d);

        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

        days.push(
            <div
                key={d}
                className={`h-24 md:h-32 border border-gray-100/50 dark:border-gray-800/50 p-2 relative group transition-all duration-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 ${isToday ? 'bg-blue-50/80 dark:bg-blue-500/10 ring-2 ring-blue-500 ring-inset ring-opacity-50 z-10' : ''}`}
            >
                <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black p-1 rounded-md ${isToday ? 'bg-blue-600 text-white px-2' : 'text-gray-400'}`}>
                        {d}
                        {isToday && <span className="ml-1 uppercase text-[7px] animate-pulse">Hoy</span>}
                    </span>

                    <button
                        onClick={() => onAddEvent?.(dateStr)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-all scale-75"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>

                <div className="mt-1 space-y-1 overflow-y-auto max-h-[80%] hide-scrollbar">
                    {dayContents.map(c => (
                        <button
                            key={c.id}
                            onClick={() => onItemClick?.(c)}
                            className="w-full text-left text-[9px] p-1 rounded-md bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 shadow-sm flex items-center gap-1 hover:border-blue-500 transition-colors group/item"
                        >
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            <span className="truncate font-bold text-gray-700 dark:text-gray-200 group-hover/item:text-blue-600 transition-colors">{c.title}</span>
                        </button>
                    ))}
                    {dayDeadlines.map(c => (
                        <button
                            key={`dl-${c.id}`}
                            onClick={() => onItemClick?.(c)}
                            className="w-full text-left text-[9px] p-1 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 shadow-sm flex items-center gap-1 hover:border-red-500 transition-colors group/item"
                        >
                            <Clock className="w-2 h-2 text-red-500" />
                            <span className="truncate font-black text-red-600 dark:text-red-400 group-hover/item:text-red-800">Meta: {c.title}</span>
                        </button>
                    ))}
                    {dayManualEvents.map(e => (
                        <div
                            key={e.id}
                            onClick={() => onItemClick?.(e)}
                            style={{ borderLeftColor: e.color }}
                            className="w-full text-left text-[9px] p-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-1 border-l-2 cursor-pointer hover:border-gray-400 transition-colors"
                        >
                            <span className="truncate font-bold text-gray-700 dark:text-gray-200">{e.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[3rem] glass-morphism overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-800/50 relative">
            {showSuggestions && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl transform transition-all animate-in zoom-in-95 duration-300">
                        <StudySuggestionSection
                            suggestions={suggestions}
                            onComplete={() => {
                                setShowSuggestions(false);
                                window.location.reload();
                            }}
                            onCancel={() => setShowSuggestions(false)}
                        />
                    </div>
                </div>
            )}

            {/* Calendar Header */}
            <div className="p-8 bg-white/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <CalendarIcon className="text-blue-600 w-6 h-6" />
                        Estudio Agendado
                    </h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">
                        {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleGetSuggestions}
                        disabled={isSuggesting}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSuggesting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Sparkles className="w-3 h-3" />
                        )}
                        Smart Suggest
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-100/50 dark:border-blue-800/50 hover:bg-blue-100 transition-colors"
                    >
                        Hoy
                    </button>
                    <button onClick={prevMonth} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextMonth} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-collapse">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-gray-800">
                        {day}
                    </div>
                ))}
                {days}
            </div>

            <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 flex justify-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clases / Apuntes</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metas de Estudio</span>
                </div>
            </div>
        </div>
    );
};

export default StudyCalendar;
