'use client';

import React, { useState } from 'react';
import { Subject } from '../../domain/entities/Subject';
import { AcademicContent } from '../../domain/entities/AcademicContent';
import ContentCard from './ContentCard';
import SubjectVault from './SubjectVault';
import BlogcitoForm from './BlogcitoForm';
import DashboardGrid from './DashboardGrid';
import { FileText, Package2, Sparkles, ChevronLeft, Plus, Terminal, LayoutGrid } from 'lucide-react';

interface SubjectDetailViewProps {
    subject: Subject;
    contents: AcademicContent[];
    onBack: () => void;
    onAskAI?: (content: AcademicContent) => void;
    onDayClick?: (date: string, contents: AcademicContent[], events: any[]) => void;
    onDeleteContent?: (id: string) => void;
    onRefresh: () => Promise<void>;
}

const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({
    subject,
    contents,
    onBack,
    onAskAI,
    onDayClick,
    onDeleteContent,
    onRefresh
}) => {
    const [subView, setSubView] = useState<'notes' | 'vault'>('notes');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isMosaicMode, setIsMosaicMode] = useState(true);

    const handleSuccess = async () => {
        await onRefresh();
        setIsAddingNote(false);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Context Header */}
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
                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{contents.length} Entradas Activas</span>
                        </div>
                    </div>
                </div>

                {/* Mode Selector (The "Toggles") */}
                {!isAddingNote && (
                    <div className="flex items-center gap-6">
                        {/* Mosaic Toggle */}
                        {subView === 'notes' && (
                            <button
                                onClick={() => setIsMosaicMode(!isMosaicMode)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-wider ${isMosaicMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                {isMosaicMode ? 'Vista Mosaico' : 'Vista Bitácora'}
                            </button>
                        )}

                        <div className="flex p-2 rounded-[2rem] bg-zinc-900/80 border border-zinc-800 backdrop-blur-2xl shadow-2xl">
                            <button
                                onClick={() => setSubView('notes')}
                                className={`group flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-500 ${subView === 'notes' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 translate-y-[-2px]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                            >
                                <FileText className={`w-4 h-4 transition-transform group-hover:scale-120 ${subView === 'notes' ? 'animate-pulse' : ''}`} />
                                Apuntes Diarios
                            </button>
                            <button
                                onClick={() => setSubView('vault')}
                                className={`group flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-500 ${subView === 'vault' ? 'bg-purple-600 text-white shadow-2xl shadow-purple-600/40 translate-y-[-2px]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                            >
                                <Package2 className={`w-4 h-4 transition-transform group-hover:scale-120 ${subView === 'vault' ? 'animate-pulse' : ''}`} />
                                Baúl de Materia
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dynamic Viewport */}
            <div className="min-h-[60vh]">
                {isAddingNote ? (
                    <div className="max-w-5xl mx-auto">
                        <BlogcitoForm
                            subjects={[subject]}
                            selectedSubjectId={subject.id!}
                            onSubjectChange={() => { }}
                            onSuccess={handleSuccess}
                            onCancel={() => setIsAddingNote(false)}
                            isInternal={true}
                        />
                    </div>
                ) : subView === 'notes' ? (
                    <div className="space-y-8">
                        {/* Quick Actions for Notes */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-zinc-500">
                                <Terminal className="w-4 h-4 text-blue-500" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Stream de Conocimiento</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {/* TODO: Implement Syllabus Scanner Modal */ }}
                                    className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/30 text-blue-400 hover:from-blue-600/20 hover:to-indigo-600/20 hover:text-white transition-all font-black text-[10px] uppercase tracking-wider shadow-lg shadow-blue-500/5"
                                >
                                    <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform" />
                                    Syllabus Scanner
                                </button>
                                <button
                                    onClick={() => setIsAddingNote(true)}
                                    className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-blue-500/50 transition-all font-black text-[10px] uppercase tracking-wider"
                                >
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                    Nuevo Apunte
                                </button>
                            </div>
                        </div>

                        {contents.length >= 0 ? (
                            <DashboardGrid
                                contextId={`subject-${subject.id}${isMosaicMode ? '-mosaic' : ''}`}
                                subjects={[subject]}
                                contents={contents}
                                events={[]} // Subject specific events could be added later
                                isMosaicMode={isMosaicMode}
                                onAskAI={onAskAI!}
                                onDeleteContent={async (id: string, path?: string) => onDeleteContent?.(id)}
                                onRefresh={onRefresh}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 rounded-[3rem] border-2 border-dashed border-zinc-900 bg-zinc-900/10">
                                <div className="p-8 rounded-full bg-zinc-900 border border-zinc-800 mb-6 group hover:border-blue-500/50 transition-all duration-500">
                                    <Sparkles className="w-12 h-12 text-zinc-700 group-hover:text-blue-500 group-hover:scale-125 transition-all" />
                                </div>
                                <h3 className="text-2xl font-black text-zinc-400">Sin Blogcitos aún</h3>
                                <p className="text-zinc-600 text-sm mt-2 font-medium max-w-sm text-center">
                                    Esta materia está lista para ser procesada. Suelta una transcripción o graba una clase ahora.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <SubjectVault subjectId={subject.id!} />
                )}
            </div>
        </div>
    );
};

export default SubjectDetailView;
