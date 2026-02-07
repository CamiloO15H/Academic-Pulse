"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Send, Brain, ScrollText, CheckCircle2, Loader2 } from 'lucide-react';
import { processAcademicTranscription } from './actions';

export default function Home() {
    const [transcription, setTranscription] = useState('');
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'confirming'>('idle');
    const [message, setMessage] = useState('');
    const [pendingData, setPendingData] = useState<any>(null);
    const [selectedSubject, setSelectedSubject] = useState<string>('');

    const subjects = [
        'Arquitectura',
        'Estadística',
        'Metodología',
        'Admin. de BD',
        'Gestión',
        'Inv. Operaciones e Informática Avanzada',
        'Seminario',
        'BD'
    ];

    const handleProcess = async (confirmedSubject?: string) => {
        if (!transcription.trim() && !confirmedSubject) return;

        setStatus('processing');
        setMessage(confirmedSubject ? 'Sincronizando con la materia seleccionada...' : 'Llamando a los agentes autónomos...');

        const result = await processAcademicTranscription(transcription, confirmedSubject);

        if (result.success) {
            setStatus('success');
            setMessage(result.message || 'Procesado con éxito.');
            setTranscription('');
            setPendingData(null);
            setSelectedSubject('');
        } else if (result.status === 'REQUIRES_CONFIRMATION' && result.data) {
            setStatus('confirming');
            setPendingData(result.data);
            setSelectedSubject(result.data.subject || '');
            setMessage(result.message || 'Confirma la materia');
        } else {
            setStatus('error');
            setMessage(result.error || 'Algo salió mal.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-indigo-500/30">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <nav className="border-b border-zinc-800/50 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            Academic Pulse
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                        <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Notion MCP Online
                        </span>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 py-12 max-w-4xl relative">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                            Transforma tus clases en <span className="text-indigo-400">inteligencia.</span>
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-2xl">
                            Pega la transcripción de tu clase y deja que nuestros agentes extraigan tareas, fechas y conceptos clave directamente a tu Notion.
                        </p>
                    </div>

                    {status === 'confirming' ? (
                        <Card className="bg-zinc-900/60 border-indigo-500/50 backdrop-blur-xl shadow-2xl border-2 animate-in zoom-in-95 duration-300">
                            <CardHeader>
                                <CardTitle className="text-indigo-400 flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    Confirmación Necesaria
                                </CardTitle>
                                <CardDescription className="text-zinc-400">
                                    La IA detectó "{pendingData?.subject}" pero no está 100% segura. ¿Es correcto?
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg space-y-2">
                                    <p className="text-sm text-zinc-500 font-medium">Materia Sugerida:</p>
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-zinc-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">Selecciona una materia...</option>
                                        {subjects.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                        <option value="General">Otra / General</option>
                                    </select>
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-3 justify-end">
                                <Button variant="ghost" onClick={() => setStatus('idle')} className="text-zinc-400 hover:text-white">
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => handleProcess(selectedSubject)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white"
                                    disabled={!selectedSubject}
                                >
                                    Confirmar y Sincronizar
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card className="bg-zinc-900/40 border-zinc-800/50 backdrop-blur-xl shadow-2xl relative group overflow-hidden">
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-zinc-200">
                                    <Brain className="w-5 h-5 text-indigo-400" />
                                    Nueva Transcripción
                                </CardTitle>
                                <CardDescription className="text-zinc-500">
                                    Los agentes analizarán el texto y organizarán tu vida académica.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <textarea
                                    value={transcription}
                                    onChange={(e) => setTranscription(e.target.value)}
                                    placeholder="Clase de Hoy: El profesor mencionó que el examen parcial será el 25 de marzo y debemos entregar el ensayo de Clean Architecture el viernes..."
                                    className="w-full min-h-[300px] bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all resize-none"
                                />
                            </CardContent>

                            <CardFooter className="flex items-center justify-between border-t border-zinc-800/50 pt-6">
                                <div className="flex items-center gap-3">
                                    {status === 'processing' && (
                                        <div className="flex items-center gap-2 text-indigo-400 text-sm animate-in fade-in slide-in-from-left-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Procesando con IA...</span>
                                        </div>
                                    )}
                                    {status === 'success' && (
                                        <div className="flex items-center gap-2 text-green-400 text-sm animate-in fade-in slide-in-from-left-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>¡Listo en Notion!</span>
                                        </div>
                                    )}
                                    {status === 'error' && (
                                        <div className="text-red-400 text-sm animate-in fade-in slide-in-from-left-2">
                                            Error: {message}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={() => handleProcess()}
                                    disabled={status === 'processing' || !transcription.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 h-11 rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all gap-2"
                                >
                                    {status === 'processing' ? 'Procesando...' : (
                                        <>
                                            Lanzar Agente <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Brain, title: "Análisis IA", desc: "Extracción automática de entidades." },
                            { icon: ScrollText, title: "Sincronización", desc: "Push directo a tus bases de datos." },
                            { icon: CheckCircle2, title: "Organización", desc: "Cronogramas y tareas listos." },
                        ].map((feature, i) => (
                            <div key={i} className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm space-y-2">
                                <feature.icon className="w-6 h-6 text-zinc-500" />
                                <h3 className="font-semibold text-zinc-300">{feature.title}</h3>
                                <p className="text-sm text-zinc-500">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
