'use client';

import React from 'react';
import { Subject } from '../../domain/entities/Subject';

interface SubjectGridProps {
    subjects: Subject[];
    onSelectSubject: (subjectId: string) => void;
    onEditSubject: (subject: Subject) => void;
    onDeleteSubject: (subjectId: string) => void;
    selectedSubjectId?: string;
}

import { Edit2, Trash2 } from 'lucide-react';

const SubjectGrid: React.FC<SubjectGridProps> = ({ subjects, onSelectSubject, onEditSubject, onDeleteSubject, selectedSubjectId }) => {
    // Helper to render icon or emoji
    const renderIcon = (iconStr?: string) => {
        if (!iconStr) return '📚';
        // Map common strings to emojis for now, or just return the string
        const mapping: Record<string, string> = {
            'book': '📖',
            'grade': '🎓',
            'activity': '⚡',
            'file': '📝',
            'video': '🎥',
            'globe': '🌐'
        };
        return mapping[iconStr.toLowerCase()] || iconStr;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 p-6">
            {subjects.map((subject) => (
                <div
                    key={subject.id}
                    onClick={() => onSelectSubject(subject.id!)}
                    className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 cursor-pointer ${selectedSubjectId === subject.id
                        ? 'ring-2 ring-primary shadow-2xl shadow-primary/20'
                        : 'hover:shadow-xl shadow-sm bg-card border border-border'
                        }`}
                    style={{
                        background: selectedSubjectId === subject.id
                            ? `linear-gradient(145deg, ${subject.color}15 0%, ${subject.color}35 100%)`
                            : undefined,
                    }}
                >
                    {/* Dynamic Ambient Light - Only visible on hover or selection */}
                    <div
                        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-[60px] transition-all duration-700 group-hover:opacity-40"
                        style={{ backgroundColor: subject.color }}
                    />
                    {selectedSubjectId === subject.id && (
                        <div
                            className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-[60px]"
                            style={{ backgroundColor: subject.color }}
                        />
                    )}

                    <div className="relative flex flex-col items-center gap-6">
                        <div
                            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/50 text-4xl shadow-sm backdrop-blur-xl transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 group-hover:shadow-lg"
                            style={{ border: `1px solid ${subject.color}30` }}
                        >
                            <span className="drop-shadow-sm filter saturate-150">{renderIcon(subject.icon)}</span>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-foreground transition-colors group-hover:text-primary">
                                {subject.name}
                            </h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                                    Ver Contenido
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Border Glow */}
                    <div
                        className={`absolute inset-0 border-2 rounded-3xl transition-opacity duration-300 ${selectedSubjectId === subject.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        style={{ borderColor: `${subject.color}40` }}
                    />

                    {/* Actions Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditSubject(subject);
                            }}
                            className="p-2 rounded-xl bg-background/80 text-muted-foreground hover:text-primary shadow-sm backdrop-blur-md transition-all border border-border"
                            title="Editar Materia"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSubject(subject.id!);
                            }}
                            className="p-2 rounded-xl bg-background/80 text-muted-foreground hover:text-destructive shadow-sm backdrop-blur-md transition-all border border-border"
                            title="Eliminar Materia"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SubjectGrid;
