'use client';

import React, { useState } from 'react';
import { AcademicContent } from '../../domain/entities/AcademicContent';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface StudyCalendarProps {
    contents: AcademicContent[];
}

const StudyCalendar: React.FC<StudyCalendarProps> = ({ contents }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

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
        const dayDeadlines = deadlinesThisMonth.filter(c => new Date(c.deadline!).getDate() === d);

        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

        days.push(
            <div key={d} className={`h-24 md:h-32 border border-gray-100/50 dark:border-gray-800/50 p-2 relative group transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-900/10 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                <span className={`text-xs font-black ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                    {d}
                    {isToday && <span className="ml-1 uppercase text-[8px] animate-pulse">Hoy</span>}
                </span>

                <div className="mt-1 space-y-1 overflow-y-auto max-h-[80%] hide-scrollbar">
                    {dayContents.map(c => (
                        <div key={c.id} className="text-[9px] p-1 rounded-md bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 shadow-sm flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            <span className="truncate font-bold text-gray-700 dark:text-gray-200">{c.title}</span>
                        </div>
                    ))}
                    {dayDeadlines.map(c => (
                        <div key={`dl-${c.id}`} className="text-[9px] p-1 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 shadow-sm flex items-center gap-1">
                            <Clock className="w-2 h-2 text-red-500" />
                            <span className="truncate font-black text-red-600 dark:text-red-400">Meta: {c.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[3rem] glass-morphism overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-800/50">
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
