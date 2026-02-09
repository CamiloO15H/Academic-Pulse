'use client';

import React, { useState } from 'react';
import { AcademicContent } from '../../domain/entities/AcademicContent';

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
                    <div className="flex gap-2">
                        <span className={`flex h-2.5 w-2.5 rounded-full mt-1 ${getImportanceColor(content.importanceLevel)}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Lv. {content.importanceLevel || 1} Importance
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {getSourceIcon(content.sourceType)} {content.contentType || 'Apunte'}
                    </div>
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-bold leading-tight text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
                    {content.title}
                </h3>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
                    {content.description}
                </p>

                {/* Summary Chips */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {content.summary.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="rounded-lg bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-[11px] text-gray-500 dark:text-gray-400">
                            {item.length > 30 ? item.substring(0, 30) + '...' : item}
                        </span>
                    ))}
                </div>

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
                        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            {content.studySteps.map((step, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600 dark:bg-blue-900/50">
                                        {idx + 1}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
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
