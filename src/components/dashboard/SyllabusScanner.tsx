'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Loader2, Sparkles, X, Edit3, Save, Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { scanSyllabus, bulkCreateEvents } from '@/app/actions';
import { toast } from 'sonner';

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
    const [error, setError] = useState<string | null>(null);

    const handleScan = async () => {
        if (!text.trim() && uploadedFiles.length === 0) return;
        setIsScanning(true);
        setNoResults(false);
        setError(null);

        try {
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
            } else {
                setError(result.message || 'Error al analizar el syllabus.');
            }
        } catch (err) {
            setError('Error al conectar con el servicio de análisis.');
        } finally {
            setIsScanning(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsConverting(true);
        const newFiles = [...uploadedFiles];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`);
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
            toast.success('Eventos agendados correctamente');
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
                    <h2 className="text-3xl font-black tracking-tighter text-foreground font-display">Scanner de Syllabus Pro</h2>
                    <p className="text-muted-foreground font-medium">IA optimizada para fechas densas y pesos de notas</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                    title="Cerrar"
                >
                    <X className="w-6 h-6 text-muted-foreground" />
                </button>
            </div>

            <div className="space-y-6">
                {error && (
                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-in fade-in zoom-in-95">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <p className="text-xs text-destructive font-bold">
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
                                    className="w-full h-48 p-6 rounded-[2rem] bg-secondary/20 border-2 border-dashed border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm resize-none font-medium outline-none text-foreground placeholder:text-muted-foreground"
                                />
                                <div className="absolute top-4 right-4 text-muted-foreground group-hover:text-primary transition-colors">
                                    <Sparkles className="w-5 h-5 animate-pulse" />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="flex flex-col items-center justify-center w-full h-48 rounded-[2rem] border-2 border-dashed border-border bg-secondary/20 hover:bg-primary/5 hover:border-primary cursor-pointer transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-4 rounded-2xl bg-card shadow-xl group-hover:scale-110 transition-transform mb-3 border border-border">
                                            <Upload className="w-6 h-6 text-primary" />
                                        </div>
                                        <p className="mb-2 text-sm text-foreground font-bold">PDF o Imágenes</p>
                                        <p className="text-xs text-muted-foreground font-medium">Arrastra o haz clic para subir</p>
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
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20 text-xs font-bold ring-1 ring-primary/10">
                                        {file.mimeType.includes('pdf') ? <FileText className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                        <span className="max-w-[150px] truncate">{file.name}</span>
                                        <button onClick={() => removeFile(idx)} className="hover:text-destructive transition-colors p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {noResults && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 animate-in fade-in zoom-in-95">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                <p className="text-xs text-amber-600 font-bold">
                                    No se detectaron compromisos claros. Prueba con otra sección o verifica el formato.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleScan}
                            disabled={isScanning || isConverting || (!text.trim() && uploadedFiles.length === 0)}
                            className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
                        <div className="border-b border-border pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-black text-foreground">Resultados del Análisis</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                        {selectedIds.length} Seleccionados
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Revisa, edita si es necesario y agenda. Las fechas por semanas se calcularon desde el <span className="font-bold text-foreground">3 de feb</span>.
                            </p>
                        </div>

                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 ${selectedIds.includes(event.id)
                                        ? event.type === 'Tema'
                                            ? 'bg-amber-500/10 border-amber-500/30'
                                            : 'bg-primary/10 border-primary/30'
                                        : 'bg-card border-border grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div
                                                onClick={() => handleToggleSelect(event.id)}
                                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${selectedIds.includes(event.id) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>

                                            {editingId === event.id ? (
                                                <input
                                                    type="text"
                                                    value={event.title}
                                                    onChange={(e) => handleUpdateEvent(event.id, 'title', e.target.value)}
                                                    className="flex-1 bg-transparent border-b-2 border-primary outline-none font-bold text-sm text-foreground"
                                                />
                                            ) : (
                                                <h4 className="font-bold text-sm text-foreground flex-1">{event.title}</h4>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => setEditingId(editingId === event.id ? null : event.id)}
                                            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-primary"
                                        >
                                            {editingId === event.id ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 ml-10">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                            {editingId === event.id ? (
                                                <input
                                                    type="date"
                                                    value={event.date}
                                                    onChange={(e) => handleUpdateEvent(event.id, 'date', e.target.value)}
                                                    className="bg-transparent border-b border-primary outline-none text-[10px] font-bold uppercase text-foreground"
                                                />
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground font-bold uppercase">{event.date}</span>
                                            )}
                                        </div>

                                        {event.weight && event.weight > 0 && (
                                            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-primary/20">
                                                {event.weight}% PONDERACIÓN
                                            </span>
                                        )}

                                        {event.description?.includes('⚠️ SEMANA CRÍTICA') && (
                                            <span className="text-[9px] bg-red-500/10 text-destructive px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse border border-destructive/20">
                                                SEMANA CRÍTICA
                                            </span>
                                        )}

                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ml-auto ${event.type === 'Tema'
                                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                            : 'bg-secondary text-muted-foreground border border-border'
                                            }`}>
                                            {event.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-border">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 rounded-2xl border-2 border-border font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all"
                            >
                                Salir
                            </button>
                            <button
                                onClick={() => {
                                    setEvents([]);
                                    setNoResults(false);
                                    setEditingId(null);
                                }}
                                className="flex-1 py-4 rounded-2xl border-2 border-border font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground hover:bg-secondary transition-all font-bold"
                            >
                                Re-Escanear
                            </button>
                            <button
                                onClick={handleSchedule}
                                disabled={isScheduling || selectedIds.length === 0 || editingId !== null}
                                className="flex-[2] py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
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
