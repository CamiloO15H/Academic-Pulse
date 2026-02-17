'use client';

import React from 'react';
import { BookOpen, FileText, Calendar } from 'lucide-react';

interface DashboardSummaryProps {
    subjectsCount: number;
    contentsCount: number;
    eventsCount: number;
}

/**
 * Sección de resumen con tarjetas de estadísticas.
 */
const DashboardSummary: React.FC<DashboardSummaryProps> = ({
    subjectsCount,
    contentsCount,
    eventsCount
}) => {
    const stats = [
        { label: 'Materias', value: subjectsCount, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Blogcitos', value: contentsCount, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { label: 'Eventos', value: eventsCount, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map((stat) => (
                <div key={stat.label} className="p-6 rounded-[2rem] bg-white/50 dark:bg-gray-800/40 border border-white/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-5 group">
                    <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardSummary;
