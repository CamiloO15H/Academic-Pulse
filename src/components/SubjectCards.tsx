import React from 'react';
import { Card, CardContent } from './ui/card';
import { Plus } from 'lucide-react';

interface Subject {
    id: string;
    name: string;
    color: string;
}

interface SubjectCardsProps {
    subjects: Subject[];
    selectedId: string;
    onSelect: (id: string) => void;
    onCreateClick: () => void;
}

export const SubjectCards: React.FC<SubjectCardsProps> = ({
    subjects,
    selectedId,
    onSelect,
    onCreateClick
}) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((subject) => (
                <Card
                    key={subject.id}
                    onClick={() => onSelect(subject.id)}
                    className={`relative cursor-pointer transition-all duration-300 overflow-hidden border-2 group shadow-lg ${selectedId === subject.id
                            ? 'border-indigo-500 bg-indigo-500/10 scale-105 shadow-indigo-500/20'
                            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
                        }`}
                >
                    {/* Accent Color bar */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
                        style={{ backgroundColor: subject.color }}
                    />

                    <CardContent className="p-6 pt-8 flex flex-col items-center text-center gap-3">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-black/20"
                            style={{ backgroundColor: subject.color }}
                        >
                            {subject.name.charAt(0)}
                        </div>
                        <h3 className={`font-bold tracking-tight text-sm md:text-base ${selectedId === subject.id ? 'text-indigo-300' : 'text-zinc-300'
                            }`}>
                            {subject.name}
                        </h3>

                        {selectedId === subject.id && (
                            <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-0.5 animate-in zoom-in-50">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </CardContent>

                    {/* Subtle glow on hover */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                        style={{ backgroundImage: `radial-gradient(circle at center, ${subject.color}, transparent)` }}
                    />
                </Card>
            ))}

            {/* "Create New" Card */}
            <Card
                onClick={onCreateClick}
                className="cursor-pointer transition-all duration-300 border-2 border-dashed border-zinc-800 bg-zinc-900/20 hover:border-zinc-600 hover:bg-zinc-900/40 min-h-[140px] flex items-center justify-center group"
            >
                <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    <div className="p-3 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold">Crear Materia</span>
                </div>
            </Card>
        </div>
    );
};
