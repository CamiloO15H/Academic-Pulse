'use client';

import React, { useState } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { Subject } from '../../domain/entities/Subject';
import { toast } from 'sonner';
import { processAcademicTranscription } from '../../app/actions';

interface BlogcitoFormProps {
    subjects: Subject[];
    selectedSubjectId: string | null;
    onSubjectChange: (id: string | null) => void;
    onSuccess: () => void;
    onCancel?: () => void;
    isInternal?: boolean;
}

const BlogcitoForm: React.FC<BlogcitoFormProps> = ({
    subjects,
    selectedSubjectId,
    onSubjectChange,
    onSuccess,
    onCancel,
    isInternal = false
}) => {
    const [transcription, setTranscription] = useState('');
    const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcess = async () => {
        if (!transcription.trim()) return;
        setIsProcessing(true);

        const formData = new FormData();
        formData.append('transcription', transcription);
        formData.append('classDate', classDate);
        if (selectedSubjectId) formData.append('subjectId', selectedSubjectId);

        try {
            const result = await processAcademicTranscription(formData);

            if (result.status === 'SUCCESS') {
                setTranscription('');
                toast.success('Blogcito generado con éxito');
                onSuccess();
            } else {
                toast.error('Error: ' + result.message);
            }
        } catch (error) {
            toast.error('Error al procesar el blogcito');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={`p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 shadow-2xl space-y-8 animate-in ${isInternal ? 'fade-in zoom-in-95' : 'slide-in-from-left-4'} duration-500 relative`}>
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="absolute top-8 right-8 p-2 rounded-xl bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Plus className="text-white w-7 h-7" />
                </div>
                <div>
                    <h3 className="text-2xl font-black tracking-tight text-white">Nuevo Blogcito</h3>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Captura Inteligente</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. Materia Selector - Hidden if internal and pre-selected */}
                {!isInternal && (
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">1. Selecciona la Materia</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedSubjectId || ''}
                                onChange={(e) => onSubjectChange(e.target.value || null)}
                                className="flex-1 p-4 rounded-2xl bg-zinc-800 border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold appearance-none cursor-pointer text-white"
                            >
                                <option value="">-- Elige una materia --</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* 2. Fecha Selector */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">{isInternal ? '1. Fecha de la Clase' : '2. Fecha de la Clase'}</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={classDate}
                            onChange={(e) => setClassDate(e.target.value)}
                            className="w-full p-4 rounded-2xl bg-zinc-800 border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold cursor-pointer text-white"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" />
                    </div>
                </div>

                {/* 3. Transcripción */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">{isInternal ? '2. Transcripción / Notas' : '3. Transcripción / Notas'}</label>
                    <div className="group relative">
                        <textarea
                            value={transcription}
                            onChange={(e) => setTranscription(e.target.value)}
                            placeholder="¿Qué aprendiste hoy? Pega tu resumen, transcripción o notas para que la IA genere el blogcito..."
                            className="w-full h-64 p-6 rounded-[2rem] bg-zinc-800 border-2 border-transparent focus:border-blue-500 focus:bg-zinc-900 transition-all outline-none text-zinc-100 resize-none font-medium leading-relaxed"
                        />
                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500 group-focus-within:animate-ping" />
                    </div>
                </div>
            </div>

            <button
                onClick={handleProcess}
                disabled={isProcessing || !transcription || !selectedSubjectId}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-lg shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-30 disabled:hover:translate-y-0"
            >
                {isProcessing ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-5 w-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>DESTILANDO CONTENIDO...</span>
                    </div>
                ) : (
                    'GENERAR BLOGCITO'
                )}
            </button>

            <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                impulsado por gemini flash 1.5
            </p>
        </div>
    );
};

export default BlogcitoForm;
