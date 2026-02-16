'use client'

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import { askQuestionToClass } from '@/app/actions';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    content: AcademicContent | null;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onClose, content }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    if (!isOpen || !content) return null;

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input.trim(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await askQuestionToClass(content.id!, userMsg.text);

            if (result.status === 'SUCCESS' && result.data) {
                const assistantMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: typeof result.data === 'string' ? result.data : JSON.stringify(result.data),
                };
                setMessages(prev => [...prev, assistantMsg]);
            } else {
                throw new Error(result.message || 'Error al obtener respuesta de la IA.');
            }
        } catch (error: any) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: `❌ Error: ${error.message}`,
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-3xl h-[85vh] bg-card/90 backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] rounded-[3rem] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-500 ease-out">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-purple-600/5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                            <Sparkles className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Tutor IA</h3>
                            <p className="text-[10px] font-bold text-primary truncate max-w-[200px]">
                                {content.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                            <Bot className="w-12 h-12 text-muted-foreground/30" />
                            <div className="space-y-2">
                                <h4 className="text-sm font-black text-foreground uppercase tracking-widest">
                                    ¿En qué puedo ayudarte?
                                </h4>
                                <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                                    Pregúntame sobre cualquier concepto mencionado en esta clase.
                                    Tengo acceso a la transcripción y al resumen principal.
                                </p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                            >
                                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user'
                                        ? 'bg-secondary text-muted-foreground'
                                        : 'bg-primary text-primary-foreground'
                                        }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-4 rounded-[2rem] text-sm leading-relaxed overflow-hidden ${msg.role === 'user'
                                        ? 'bg-foreground text-background rounded-tr-none'
                                        : 'bg-primary/10 text-foreground rounded-tl-none border border-primary/20'
                                        }`}>
                                        {msg.text.split('\n').map((line, i) => (
                                            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <div className="p-4 rounded-[2rem] rounded-tl-none bg-primary/10 border border-primary/20">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-secondary/30 border-t border-border">
                    <div className="relative group">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Haz una pregunta..."
                            className="w-full bg-background border border-border rounded-3xl py-4 pl-6 pr-14 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none max-h-32 min-h-[56px] placeholder:text-muted-foreground"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-2 h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="mt-3 text-[10px] text-center font-black uppercase tracking-widest text-muted-foreground">
                        AI Tutor Contextual • Academic Pulse
                    </p>
                </div>
            </div>
        </div>
    );
};
