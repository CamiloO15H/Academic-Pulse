'use client';

import React from 'react';
import { Mail, RefreshCw, ExternalLink } from 'lucide-react';

interface Email {
    id: string;
    subject: string;
    from: string;
    date: string;
    snippet: string;
    isUnread: boolean;
}

const MOCK_EMAILS: Email[] = [
    {
        id: '1',
        subject: 'Actualización de Syllabus: Inteligencia Artificial',
        from: 'Prof. Ricardo Silva',
        date: '10:45 AM',
        snippet: 'Hola a todos, he subido los nuevos recursos para la sesión de mañana y un resumen de lectura obligatorio.',
        isUnread: true
    },
    {
        id: '2',
        subject: 'Recordatorio: Entrega de Proyecto Final',
        from: 'Coordinación Académica',
        date: 'Ayer',
        snippet: 'Les recordamos que la fecha límite para subir el proyecto final es este viernes a medianoche. Sin excepciones.',
        isUnread: false
    },
    {
        id: '3',
        subject: 'Nueva bibliografía disponible en biblioteca virtual',
        from: 'Biblioteca Central',
        date: '15 Feb',
        snippet: 'Se han añadido 5 nuevos títulos relevantes para tu carrera en la plataforma de biblioteca digital.',
        isUnread: false
    }
];

const EmailWidget: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col bg-zinc-950/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">Outlook</h3>
                        <p className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">Bandeja de Entrada</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors" title="Actualizar">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors" title="Abrir Outlook">
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <div className="space-y-1">
                    {MOCK_EMAILS.map((email) => (
                        <div
                            key={email.id}
                            className="group p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer relative"
                        >
                            <div className="flex items-start justify-between gap-3 mb-1">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {email.isUnread && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    )}
                                    <span className={`text-[11px] font-bold truncate ${email.isUnread ? 'text-white' : 'text-zinc-400'}`}>
                                        {email.from}
                                    </span>
                                </div>
                                <span className="text-[10px] text-zinc-600 font-medium shrink-0">
                                    {email.date}
                                </span>
                            </div>
                            <h4 className={`text-xs font-semibold mb-1 truncate ${email.isUnread ? 'text-blue-100' : 'text-zinc-300'}`}>
                                {email.subject}
                            </h4>
                            <p className="text-[11px] text-zinc-500 line-clamp-1 leading-relaxed">
                                {email.snippet}
                            </p>

                            {/* Hover accent */}
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-blue-500 rounded-full group-hover:h-3 transition-all duration-300" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-center">
                <button className="px-4 py-1.5 rounded-full hover:bg-white/5 text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest border border-transparent hover:border-white/10">
                    Ver todos los correos
                </button>
            </div>
        </div>
    );
};

export default EmailWidget;
