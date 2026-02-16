'use client';

import React, { useState } from 'react';
import { AcademicContent } from '../../domain/entities/AcademicContent';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Sparkles, Loader2 } from 'lucide-react';
import { suggestStudyBlocks } from '@/app/actions';
import { StudySuggestionSection } from './StudySuggestionSection';

interface StudyCalendarProps {
    contents: AcademicContent[];
    events?: any[];
    onItemClick?: (item: any) => void;
    onAddEvent?: (date: string) => void;
    onDayClick?: (date: string, contents: AcademicContent[], events: any[]) => void;
}

const StudyCalendar: React.FC<StudyCalendarProps> = ({ contents, events = [], onItemClick, onAddEvent, onDayClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
        return d.getUTCFullYear() === year && d.getUTCMonth() === month;
    });

    // Filter manual events for this month
    const eventsThisMonth = events.filter(e => {
        if (e.type !== 'manual') return false;
        const d = new Date(e.eventDate);
        return d.getUTCFullYear() === year && d.getUTCMonth() === month;
    });

    // Filter deadlines
    const deadlinesThisMonth = contents.filter(c => {
        if (!c.deadline) return false;
        const d = new Date(c.deadline);
        return d.getUTCFullYear() === year && d.getUTCMonth() === month;
    });

    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-border/40 bg-secondary/5" />);
    }

    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayContents = contentsThisMonth.filter(c => new Date(c.classDate!).getUTCDate() === d);
        const dayManualEvents = eventsThisMonth.filter(e => new Date(e.eventDate).getUTCDate() === d);
        const dayDeadlines = deadlinesThisMonth.filter(c => new Date(c.deadline!).getUTCDate() === d);

        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
        const isSelected = selectedDate === dateStr;

        days.push(
            <div
                key={d}
                onClick={() => {
                    setSelectedDate(dateStr);
                    onDayClick?.(dateStr, [...dayContents, ...dayDeadlines], dayManualEvents);
                }}
                className={`
                    h-24 md:h-32 border border-border/40 p-2 relative group transition-all duration-300 cursor-pointer 
                    hover:bg-primary/[0.03] 
                    ${isToday ? 'bg-primary/5 ring-1 ring-primary/30' : 'bg-card'}
                    ${isSelected ? 'ring-2 ring-primary bg-primary/[0.05]' : ''}
                `}
            >
                <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black p-1 rounded-md ${isToday ? 'bg-primary text-primary-foreground px-2' : 'text-muted-foreground'}`}>
                        {d}
                        {isToday && <span className="ml-1 uppercase text-[7px] animate-pulse">Hoy</span>}
                    </span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddEvent?.(dateStr);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all scale-75 shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="mt-1 space-y-1 overflow-y-auto max-h-[80%] hide-scrollbar">
                    {dayContents.map(c => (
                        <div
                            key={c.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onItemClick?.(c);
                            }}
                            className="w-full text-left text-[9px] p-1 rounded-md bg-background border border-border shadow-sm flex items-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-all active:scale-95"
                        >
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            <span className="truncate font-bold text-foreground">{c.title}</span>
                        </div>
                    ))}
                    {dayDeadlines.map(c => (
                        <div
                            key={`dl-${c.id}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onItemClick?.(c);
                            }}
                            className="w-full text-left text-[9px] p-1 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 shadow-sm flex items-center gap-1 cursor-pointer hover:scale-[1.02] transition-all active:scale-95"
                        >
                            <Clock className="w-2 h-2 text-red-500" />
                            <span className="truncate font-black text-red-600 dark:text-red-400">Meta: {c.title}</span>
                        </div>
                    ))}
                    {dayManualEvents.map(e => (
                        <div
                            key={e.id}
                            onClick={(ev) => {
                                ev.stopPropagation();
                                onItemClick?.(e);
                            }}
                            style={{ borderLeftColor: e.color }}
                            className="w-full text-left text-[9px] p-1 rounded-md bg-background border border-border shadow-sm flex items-center gap-1 border-l-2 cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-all active:scale-95"
                        >
                            <span className="truncate font-bold text-foreground">{e.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }


    return (
        <div className="rounded-3xl bg-card overflow-hidden shadow-sm border border-border relative">
            {showSuggestions && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
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
            <div className="p-8 bg-card border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground font-display">
                        <CalendarIcon className="text-primary w-6 h-6" />
                        Estudio Agendado
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">
                        {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleGetSuggestions}
                        disabled={isSuggesting}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2 disabled:opacity-50"
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
                        className="px-4 py-2 rounded-xl bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest border border-border hover:bg-secondary/80 transition-colors"
                    >
                        Hoy
                    </button>
                    <button onClick={prevMonth} className="p-3 rounded-xl hover:bg-secondary text-foreground transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextMonth} className="p-3 rounded-xl hover:bg-secondary text-foreground transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-collapse bg-card">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                        {day}
                    </div>
                ))}
                {days}
            </div>

            <div className="p-6 bg-secondary/30 flex justify-center gap-8 border-t border-border">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clases / Apuntes</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Metas de Estudio</span>
                </div>
            </div>
        </div>
    );
};

export default StudyCalendar;
