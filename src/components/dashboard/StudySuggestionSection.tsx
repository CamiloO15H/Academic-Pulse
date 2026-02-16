'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Sparkles, Plus } from 'lucide-react';
import { bulkCreateCalendarEvents } from '@/app/actions';
import { toast } from 'sonner';

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
            toast.success('Eventos creados correctamente');
            onComplete();
        } else {
            console.error('Failed to create events:', result.message);
            toast.error('Error al crear eventos');
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-card/95 backdrop-blur-xl border border-border rounded-[2rem] p-8 shadow-2xl space-y-8 max-w-2xl w-full mx-auto animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl shadow-sm border border-primary/20">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-foreground font-display tracking-tight">Plan de Batalla Sugerido</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            Optimizado por Cerebrito AI
                        </p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                >
                    <XCircle className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {suggestions.map((suggestion, idx) => (
                    <div
                        key={idx}
                        onClick={() => toggleSelection(idx)}
                        className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${selectedIndices.includes(idx)
                            ? 'bg-secondary/40 border-primary/50 shadow-lg shadow-primary/5'
                            : 'bg-card border-border hover:border-border/80 hover:bg-secondary/20'
                            }`}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-background border border-border text-muted-foreground">
                                        {suggestion.date} • {suggestion.startTime} - {suggestion.endTime}
                                    </span>
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-background"
                                        style={{ backgroundColor: suggestion.color }}
                                    />
                                </div>
                                <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                    {suggestion.title}
                                </h4>
                                <p className="text-sm text-muted-foreground font-medium italic leading-relaxed">
                                    "{suggestion.description}"
                                </p>
                            </div>
                            <div className={`mt-1 transition-all duration-300 ${selectedIndices.includes(idx) ? 'scale-110 opacity-100' : 'scale-90 opacity-40 group-hover:opacity-100'}`}>
                                {selectedIndices.includes(idx) ? (
                                    <CheckCircle2 className="w-6 h-6 text-primary fill-primary/20" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 pt-6 border-t border-border">
                <button
                    onClick={onCancel}
                    className="flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                >
                    Descartar
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving || selectedIndices.length === 0}
                    className={`flex-[2] py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-3 ${isSaving || selectedIndices.length === 0
                        ? 'bg-muted cursor-not-allowed opacity-50'
                        : 'bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-95'
                        }`}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Agendando...
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4" />
                            Confirmar ({selectedIndices.length})
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
