'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Loader2, Sparkles, Plus } from 'lucide-react';
import { bulkCreateCalendarEvents } from '@/app/actions';

interface Suggestion {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    date: string;
    subjectId: string;
    color: string;
}

interface StudySuggestionSectionProps {
    suggestions: Suggestion[];
    onComplete: () => void;
    onCancel: () => void;
}

export const StudySuggestionSection: React.FC<StudySuggestionSectionProps> = ({ suggestions, onComplete, onCancel }) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>(suggestions.map((_, i) => i));
    const [isSaving, setIsSaving] = useState(false);

    const toggleSelection = (index: number) => {
        setSelectedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleSave = async () => {
        if (selectedIndices.length === 0) return;
        setIsSaving(true);

        const eventsToCreate = selectedIndices.map(idx => ({
            title: suggestions[idx].title,
            description: suggestions[idx].description,
            startTime: suggestions[idx].startTime + ':00',
            endTime: suggestions[idx].endTime + ':00',
            eventDate: suggestions[idx].date,
            subjectId: suggestions[idx].subjectId,
            color: suggestions[idx].color,
            isAllDay: false
        }));

        const result = await bulkCreateCalendarEvents(eventsToCreate);
        if (result.status === 'SUCCESS') {
            onComplete();
        } else {
            console.error('Failed to create events:', result.message);
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Plan de Batalla Sugerido</h3>
                        <p className="text-sm text-gray-400">He encontrado los mejores huecos para tus exámenes</p>
                    </div>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
                    <XCircle className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {suggestions.map((suggestion, idx) => (
                    <div
                        key={idx}
                        onClick={() => toggleSelection(idx)}
                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${selectedIndices.includes(idx)
                                ? 'bg-white/15 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300">
                                        {suggestion.date} | {suggestion.startTime} - {suggestion.endTime}
                                    </span>
                                    <div
                                        className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                        style={{ backgroundColor: suggestion.color }}
                                    />
                                </div>
                                <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                    {suggestion.title}
                                </h4>
                                <p className="text-sm text-gray-400 italic line-clamp-2 mt-1">
                                    {suggestion.description}
                                </p>
                            </div>
                            <div className={`mt-1 transition-transform ${selectedIndices.includes(idx) ? 'scale-110' : 'scale-100'}`}>
                                {selectedIndices.includes(idx) ? (
                                    <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/20" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-white/20" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 px-6 rounded-xl font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                    Descartar
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving || selectedIndices.length === 0}
                    className={`flex-[2] py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isSaving || selectedIndices.length === 0
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:scale-[1.02] active:scale-95'
                        }`}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Agendando...
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            Agendar {selectedIndices.length} bloques
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
