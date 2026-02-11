'use client';

import React, { useState } from 'react';
import { AcademicContent } from '../../domain/entities/AcademicContent';
import { Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';

interface ContentCardProps {
    content: AcademicContent;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getImportanceColor = (level?: number) => {
        if (!level) return 'bg-gray-400';
        if (level >= 5) return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
        if (level >= 3) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    const getSourceIcon = (type: string) => {
        switch (type) {
            case 'transcription': return '🎤';
            case 'video': return '🎥';
            case 'web': return '🌐';
            default: return '📄';
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-3xl bg-white/70 dark:bg-gray-800/70 p-1 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="flex flex-col h-full rounded-[22px] bg-white dark:bg-gray-900 p-6 shadow-sm">

                {/* Header: Importance & Type */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${getImportanceColor(content.importanceLevel)}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Impacto Nivel {content.importanceLevel || 1}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/50">
                        {getSourceIcon(content.sourceType)} {content.contentType || 'Apunte'}
                    </div>
                </div>

                {/* Title & Date */}
                <div className="space-y-2 mb-4">
                    <h3 className="text-2xl font-black leading-tight text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {content.title}
                    </h3>
                    {content.classDate && (
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">
                                {new Date(content.classDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400 font-medium italic">
                    "{content.description}"
                </p>

                {/* Key Insights Section */}
                {content.keyInsights && content.keyInsights.length > 0 && (
                    <div className="mb-6 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Key Insights</span>
                            <div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800" />
                        </div>
                        <ul className="space-y-2">
                            {content.keyInsights.map((insight, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{insight}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action / Collapsible Section */}
                <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-4">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex w-full items-center justify-between group-hover:translate-x-1 transition-transform"
                    >
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            Plan de Estudio Express
                        </span>
                        <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {isExpanded && content.studySteps && (
                        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            {content.studySteps.map((step, idx) => (
                                <div key={idx} className="flex gap-4 items-start p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-800/50">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-lg shadow-blue-500/20">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-snug">
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentCard;
