'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Loader2, Sparkles, X, Edit3, Save, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { scanSyllabus, bulkCreateEvents } from '@/app/actions';

interface SyllabusScannerProps {
    subjectId: string;
    subjectColor: string;
    onComplete: () => void;
    onClose: () => void;
}

export default function SyllabusScanner({ subjectId, subjectColor, onComplete, onClose }: SyllabusScannerProps) {
    const [text, setText] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isScheduling, setIsScheduling] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [noResults, setNoResults] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<{ data: string, mimeType: string, name: string }[]>([]);
    const [isConverting, setIsConverting] = useState(false);

    const handleScan = async () => {
        if (!text.trim() && uploadedFiles.length === 0) return;
        setIsScanning(true);
        setNoResults(false);

        const filesToPass = uploadedFiles.map(f => ({ data: f.data.split(',')[1], mimeType: f.mimeType }));
        const result = await scanSyllabus(text, subjectId, filesToPass.length > 0 ? filesToPass : undefined);

        if (result.status === 'SUCCESS' && result.data) {
            if (result.data.length === 0) {
                setNoResults(true);
            } else {
                const extracted = result.data.map((e: any, idx: number) => ({ ...e, id: idx }));
                setEvents(extracted);
                setSelectedIds(extracted.map((e: any) => e.id));
            }
        }
        setIsScanning(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsConverting(true);
        const newFiles = [...uploadedFiles];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`);
                continue;
            }

            const reader = new FileReader();
            const promise = new Promise((resolve) => {
                reader.onloadend = () => {
                    newFiles.push({
                        data: reader.result as string,
                        mimeType: file.type,
                        name: file.name
                    });
                    resolve(null);
                };
            });
            reader.readAsDataURL(file);
            await promise;
        }

        setUploadedFiles(newFiles);
        setIsConverting(false);
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleToggleSelect = (id: number) => {
        if (editingId !== null) return; // Disable selection while editing
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleUpdateEvent = (id: number, field: string, value: string | number) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const [error, setError] = useState<string | null>(null);

    const handleSchedule = async () => {
        const toSchedule = events.filter(e => selectedIds.includes(e.id));
        if (toSchedule.length === 0) return;

        setIsScheduling(true);
        setError(null);
        const calendarEvents = toSchedule.map(e => ({
            title: e.title,
            description: e.description,
            eventDate: e.date,
            isAllDay: true,
            subjectId: subjectId,
            color: subjectColor,
            weight: e.weight || undefined,
            grade: undefined
        }));

        const result = await bulkCreateEvents(calendarEvents);
        if (result.status === 'SUCCESS') {
            onComplete();
        } else {
            setError(result.message || 'Error al agendar eventos. Por favor intenta de nuevo.');
        }
        setIsScheduling(false);
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter">Scanner de Syllabus Pro</h2>
                    <p className="text-gray-500 font-medium">IA optimizada para fechas densas y pesos de notas</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Cerrar"
                >
                    <X className="w-6 h-6 text-gray-400" />
                </button>
            </div>

            <div className="space-y-6">
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 animate-in fade-in zoom-in-95">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-xs text-red-700 dark:text-red-400 font-bold">
                            {error}
                        </p>
                    </div>
                )}

                {!events.length ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative group">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Pega aquí el texto del syllabus..."
                                    className="w-full h-48 p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm resize-none font-medium outline-none"
                                />
                                <div className="absolute top-4 right-4 text-gray-400 group-hover:text-blue-400 transition-colors">
                                    <Sparkles className="w-5 h-5 animate-pulse" />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="flex flex-col items-center justify-center w-full h-48 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-500 cursor-pointer transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-xl group-hover:scale-110 transition-transform mb-3">
                                            <Upload className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-bold">PDF o Imágenes</p>
                                        <p className="text-xs text-gray-500 font-medium">Arrastra o haz clic para subir</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        disabled={isConverting}
                                    />
                                </label>
                            </div>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                                {uploadedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800 text-xs font-bold ring-1 ring-blue-500/20">
                                        {file.mimeType.includes('pdf') ? <FileText className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                        <span className="max-w-[150px] truncate">{file.name}</span>
                                        <button onClick={() => removeFile(idx)} className="hover:text-red-500 transition-colors p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {noResults && (
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-3 animate-in fade-in zoom-in-95">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                                    No se detectaron compromisos claros. Prueba con otra sección o verifica el formato.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleScan}
                            disabled={isScanning || isConverting || (!text.trim() && uploadedFiles.length === 0)}
                            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Procesando Inteligencia...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Analizar Contenido
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-black">Resultados del Análisis</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                        {selectedIds.length} Seleccionados
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                                Revisa, edita si es necesario y agenda. Las fechas por semanas se calcularon desde el <span className="font-bold text-gray-700 dark:text-gray-300">3 de feb</span>.
                            </p>
                        </div>

                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 ${selectedIds.includes(event.id)
                                        ? event.type === 'Tema'
                                            ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30'
                                            : 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50'
                                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 grayscale opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div
                                                onClick={() => handleToggleSelect(event.id)}
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${selectedIds.includes(event.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-300'}`}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>

                                            {editingId === event.id ? (
                                                <input
                                                    type="text"
                                                    value={event.title}
                                                    onChange={(e) => handleUpdateEvent(event.id, 'title', e.target.value)}
                                                    className="flex-1 bg-transparent border-b-2 border-blue-500 outline-none font-bold text-sm text-gray-800 dark:text-gray-100"
                                                />
                                            ) : (
                                                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100 flex-1">{event.title}</h4>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setEditingId(editingId === event.id ? null : event.id)}
                                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-500"
                                        >
                                            {editingId === event.id ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 ml-10">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            {editingId === event.id ? (
                                                <input
                                                    type="date"
                                                    value={event.date}
                                                    onChange={(e) => handleUpdateEvent(event.id, 'date', e.target.value)}
                                                    className="bg-transparent border-b border-blue-400 outline-none text-[10px] font-bold uppercase text-gray-600 dark:text-gray-400"
                                                />
                                            ) : (
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">{event.date}</span>
                                            )}
                                        </div>

                                        {event.weight && event.weight > 0 && (
                                            <span className="text-[9px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                                {event.weight}% PONDERACIÓN
                                            </span>
                                        )}

                                        {event.description?.includes('⚠️ SEMANA CRÍTICA') && (
                                            <span className="text-[9px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                                                SEMANA CRÍTICA
                                            </span>
                                        )}

                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ml-auto ${event.type === 'Tema'
                                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                            }`}>
                                            {event.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 font-black uppercase tracking-[0.2em] text-[10px] text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900/30 transition-all"
                            >
                                Salir
                            </button>
                            <button
                                onClick={() => {
                                    setEvents([]);
                                    setNoResults(false);
                                    setEditingId(null);
                                }}
                                className="flex-1 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 font-black uppercase tracking-[0.2em] text-[10px] text-gray-400 hover:bg-gray-50 transition-all font-bold"
                            >
                                Re-Escanear
                            </button>
                            <button
                                onClick={handleSchedule}
                                disabled={isScheduling || selectedIds.length === 0 || editingId !== null}
                                className="flex-[2] py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isScheduling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                Agenda Masiva ({selectedIds.length})
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
