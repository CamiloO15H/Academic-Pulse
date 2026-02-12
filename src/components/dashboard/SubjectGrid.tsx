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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-6">
            {subjects.map((subject) => (
                <div
                    key={subject.id}
                    onClick={() => onSelectSubject(subject.id!)}
                    className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 cursor-pointer ${selectedSubjectId === subject.id
                        ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20'
                        : 'hover:shadow-xl shadow-sm'
                        }`}
                    style={{
                        background: `linear-gradient(145deg, ${subject.color}15 0%, ${subject.color}35 100%)`,
                        backdropFilter: 'blur(20px)',
                        border: `1px solid ${subject.color}25`,
                    }}
                >
                    {/* Dynamic Ambient Light */}
                    <div
                        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-[60px] transition-all duration-700 group-hover:scale-150 group-hover:opacity-60"
                        style={{ backgroundColor: subject.color }}
                    />

                    <div className="relative flex flex-col items-center gap-6">
                        <div
                            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/50 dark:bg-gray-800/50 text-4xl shadow-inner backdrop-blur-xl transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 group-hover:shadow-lg"
                            style={{ border: `1px solid ${subject.color}30` }}
                        >
                            <span className="drop-shadow-md">{renderIcon(subject.icon)}</span>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white transition-colors group-hover:text-blue-600">
                                {subject.name}
                            </h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                                    Ver Contenido
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Border Glow */}
                    <div
                        className={`absolute inset-0 border-2 rounded-3xl transition-opacity duration-300 ${selectedSubjectId === subject.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        style={{ borderColor: `${subject.color}60` }}
                    />

                    {/* Actions Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditSubject(subject);
                            }}
                            className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-600 hover:text-blue-600 shadow-sm backdrop-blur-md transition-all"
                            title="Editar Materia"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSubject(subject.id!);
                            }}
                            className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-600 hover:text-red-600 shadow-sm backdrop-blur-md transition-all"
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
