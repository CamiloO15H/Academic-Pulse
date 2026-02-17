'use client';

import React from 'react';
import { ChevronLeft, Package2 } from 'lucide-react';
import { Subject } from '@/domain/entities/Subject';

interface SubjectDetailHeaderProps {
    subject: Subject;
    contentsCount: number;
    onBack: () => void;
}

/**
 * Encabezado contextual para la vista de detalle de materia.
 */
const SubjectDetailHeader: React.FC<SubjectDetailHeaderProps> = ({
    subject,
    contentsCount,
    onBack
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-800 pb-10">
            <div className="flex items-start gap-6">
                <button
                    onClick={onBack}
                    className="group p-4 rounded-[1.5rem] bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-xl hover:border-zinc-700"
                >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border-2 text-3xl shadow-2xl overflow-hidden"
                            style={{ borderColor: `${subject.color}40` }}
                        >
                            <span className="drop-shadow-lg flex items-center justify-center">
                                {subject.icon?.toLowerCase() === 'book' ? (
                                    <Package2 className="w-8 h-8 text-white" />
                                ) : (
                                    subject.icon || '📚'
                                )}
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
                            {subject.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: subject.color }} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Terminal de Materia v2.0</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{contentsCount} Entradas Activas</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubjectDetailHeader;
