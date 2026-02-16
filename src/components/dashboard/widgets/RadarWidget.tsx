'use client';

import React from 'react';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import ContentCard from '@/components/dashboard/ContentCard';
import { Sparkles, Brain, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RadarWidgetProps {
    subjects: any[];
    contents: AcademicContent[];
    subjectId?: string;
    onAskAI: (content: AcademicContent) => void;
    onDeleteContent: (id: string, path: string) => Promise<void>;
    onRefresh: () => void;
}

const RadarWidget: React.FC<RadarWidgetProps> = ({
    subjects,
    contents,
    subjectId,
    onAskAI,
    onDeleteContent,
    onRefresh
}) => {
    // Filter logic for the Radar
    const prioritizedContent = React.useMemo(() => {
        const now = new Date();
        const eightDaysLater = new Date();
        eightDaysLater.setDate(now.getDate() + 8);

        const fifteenDaysLater = new Date();
        fifteenDaysLater.setDate(now.getDate() + 15);

        return contents.filter(item => {
            // Apply subject filter if provided
            if (subjectId && String(item.subjectId) !== String(subjectId)) return false;

            // Only show pending items
            if (item.status === 'completed' || item.status === 'archived') return false;

            const deadline = item.deadline ? new Date(item.deadline) : null;
            if (!deadline) {
                // If no deadline, show if it's high importance or a 'noticia'
                return item.importanceLevel && item.importanceLevel >= 4 || item.contentType === 'noticia';
            }

            // Window logic
            const isExamOrNoticia = item.contentType === 'parcial' || item.contentType === 'noticia';
            const isHighImportance = item.importanceLevel && item.importanceLevel >= 4;

            if (isExamOrNoticia || isHighImportance) {
                return deadline <= fifteenDaysLater;
            }

            return deadline <= eightDaysLater;
        }).sort((a, b) => {
            // Sort by proximity, then importance
            const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;

            if (dateA !== dateB) return dateA - dateB;
            return (b.importanceLevel || 0) - (a.importanceLevel || 0);
        });
    }, [contents, subjectId]);

    if (prioritizedContent.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <div className="relative mb-4">
                    <Sparkles className="w-12 h-12 opacity-20" />
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                </div>
                <p className="text-sm font-medium">No hay prioridades críticas detectadas</p>
                <p className="text-[10px] opacity-60 mt-2 max-w-[200px]">
                    El radar está escaneando tus entregas y noticias. Todo bajo control.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            {/* Header / Actions */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Escaneo en Tiempo Real</span>
                </div>

                <button
                    onClick={() => {
                        // This would trigger a global suggest study blocks or similar
                        // Future: trigger suggestStudyBlocks with the IDs of prioritizedContent
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all text-[10px] font-bold"
                >
                    <Brain className="w-3 h-3" />
                    Smart Suggest
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {prioritizedContent.map((item) => {
                    const isUrgent = item.deadline && (new Date(item.deadline).getTime() - new Date().getTime()) < 48 * 60 * 60 * 1000;
                    const isCritical = isUrgent || (item.importanceLevel && item.importanceLevel >= 5);

                    return (
                        <div key={item.id} className="relative group">
                            {isCritical && (
                                <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500/50 to-orange-500/50 rounded-[2rem] blur-[2px] opacity-30 group-hover:opacity-60 transition-opacity" />
                            )}
                            <ContentCard
                                content={item}
                                onAskAI={onAskAI}
                                onDelete={(id) => onDeleteContent(id, '')}
                                onUpdate={onRefresh}
                                className={isCritical ? 'border-red-500/30' : ''}
                            />
                            {isCritical && (
                                <div className="absolute top-4 right-12 z-10 pointer-events-none">
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-[8px] font-black text-white uppercase tracking-tighter shadow-lg">
                                        <AlertCircle className="w-2 h-2" />
                                        Crítico
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Summary */}
            <div className="p-3 border-t border-white/5 bg-zinc-900/30">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {prioritizedContent.length} Pendientes
                        </span>
                        <span className="flex items-center gap-1 text-red-400/80">
                            <AlertCircle className="w-3 h-3" />
                            {prioritizedContent.filter(c => (c.importanceLevel || 0) >= 4).length} Críticos
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RadarWidget;
