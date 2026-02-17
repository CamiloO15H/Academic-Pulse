'use client';

import React from 'react';
import { Subject } from '../../domain/entities/Subject';
import { AcademicContent } from '../../domain/entities/AcademicContent';

// Hooks
import { useSubjectDetail } from '../../hooks/useSubjectDetail';

// Components
import SubjectDetailHeader from './SubjectDetailHeader';
import SubjectVault from './SubjectVault';
import BlogcitoForm from './BlogcitoForm';
import DashboardGrid from './DashboardGrid';
import { FileText, Package2, Sparkles, Plus, Terminal, LayoutGrid } from 'lucide-react';

interface SubjectDetailViewProps {
    subject: Subject;
    contents: AcademicContent[];
    onBack: () => void;
    onAskAI?: (content: AcademicContent) => void;
    onDayClick?: (date: string, contents: AcademicContent[], events: any[]) => void;
    onDeleteContent?: (id: string) => void;
    onRefresh: () => Promise<void>;
}

/**
 * Refactored SubjectDetailView using Clean Code principles.
 * Decoupled logic into useSubjectDetail hook and atomic components.
 */
const SubjectDetailView: React.FC<SubjectDetailViewProps> = ({
    subject,
    contents,
    onBack,
    onAskAI,
    onDayClick,
    onDeleteContent,
    onRefresh
}) => {
    const {
        subView,
        setSubView,
        isAddingNote,
        setIsAddingNote,
        isMosaicMode,
        setIsMosaicMode,
        handleSuccess
    } = useSubjectDetail(onRefresh);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col gap-8 md:flex-row md:items-end justify-between">
                <SubjectDetailHeader
                    subject={subject}
                    contentsCount={contents.length}
                    onBack={onBack}
                />

                {!isAddingNote && (
                    <div className="flex items-center gap-6">
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
                                Apuntes
                            </button>
                            <button
                                onClick={() => setSubView('vault')}
                                className={`group flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-500 ${subView === 'vault' ? 'bg-purple-600 text-white shadow-2xl shadow-purple-600/40 translate-y-[-2px]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                            >
                                <Package2 className={`w-4 h-4 transition-transform group-hover:scale-120 ${subView === 'vault' ? 'animate-pulse' : ''}`} />
                                Baúl
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-zinc-500">
                                <Terminal className="w-4 h-4 text-blue-500" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Stream de Conocimiento</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {/* Trigger Scanner Modal via parent if needed */ }}
                                    className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/30 text-blue-400 hover:from-blue-600/20 hover:to-indigo-600/20 hover:text-white transition-all font-black text-[10px] uppercase tracking-wider shadow-lg shadow-blue-500/5"
                                >
                                    <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform" />
                                    Scanner
                                </button>
                                <button
                                    onClick={() => setIsAddingNote(true)}
                                    className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-blue-500/50 transition-all font-black text-[10px] uppercase tracking-wider"
                                >
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                    Nuevo
                                </button>
                            </div>
                        </div>

                        {contents.length > 0 ? (
                            <DashboardGrid
                                contextId={`subject-${subject.id}${isMosaicMode ? '-mosaic' : ''}`}
                                subjects={[subject]}
                                contents={contents}
                                events={[]}
                                isMosaicMode={isMosaicMode}
                                onAskAI={onAskAI!}
                                onDeleteContent={async (id) => onDeleteContent?.(id)}
                                onRefresh={onRefresh}
                            />
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                ) : (
                    <SubjectVault subjectId={subject.id!} />
                )}
            </div>
        </div>
    );
};

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-40 rounded-[3rem] border-2 border-dashed border-zinc-900 bg-zinc-900/10">
        <div className="p-8 rounded-full bg-zinc-900 border border-zinc-800 mb-6 group hover:border-blue-500/50 transition-all duration-500">
            <Sparkles className="w-12 h-12 text-zinc-700 group-hover:text-blue-500 group-hover:scale-125 transition-all" />
        </div>
        <h3 className="text-2xl font-black text-zinc-400 uppercase tracking-tighter">Sin Blogcitos aún</h3>
        <p className="text-zinc-600 text-sm mt-2 font-medium max-w-sm text-center">
            Esta materia está lista para ser procesada. Suelta una transcripción o graba una clase ahora.
        </p>
    </div>
);

export default SubjectDetailView;
