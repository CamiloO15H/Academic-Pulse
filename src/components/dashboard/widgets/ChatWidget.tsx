'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Brain, ChevronRight } from 'lucide-react';
import { askGlobalQuestion } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

const ChatWidget: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: '¡Hola! Soy tu Estratega Académico. Tengo acceso a todas tus tareas y eventos. ¿En qué puedo ayudarte hoy? ¿Quieres que revisemos qué tienes para esta semana?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

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
            const result = await askGlobalQuestion(userMsg.text);

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
        <div className="h-full w-full flex flex-col bg-card/30 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl group/widget">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover/widget:scale-110 transition-transform duration-500">
                            <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest leading-none">Gemini Strategist</h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                            <p className="text-[9px] font-bold text-primary uppercase">Escaneando semestre...</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Pro Mode</span>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-zinc-900/20">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div className={cn(
                            "flex gap-3 max-w-[90%]",
                            msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        )}>
                            <div className={cn(
                                "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                                msg.role === 'user'
                                    ? 'bg-zinc-800 border-white/10 text-zinc-400'
                                    : 'bg-primary/20 border-primary/30 text-primary'
                            )}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                            </div>
                            <div className={cn(
                                "p-4 rounded-[2rem] text-sm leading-relaxed shadow-sm relative",
                                msg.role === 'user'
                                    ? 'bg-zinc-100 text-zinc-900 rounded-tr-none'
                                    : 'bg-zinc-900/50 text-zinc-200 border border-white/5 rounded-tl-none backdrop-blur-md'
                            )}>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {msg.text.split('\n').map((line, i) => (
                                        <p key={i} className={i > 0 ? 'mt-3' : ''}>
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-in fade-in duration-300">
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                                <Brain className="w-4 h-4 text-primary animate-pulse" />
                            </div>
                            <div className="p-4 rounded-[2rem] rounded-tl-none bg-zinc-900/50 border border-white/5 backdrop-blur-md">
                                <div className="flex gap-1.5">
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
            <div className="p-6 bg-zinc-900/60 backdrop-blur-xl border-t border-white/5">
                <div className="relative group/input flex items-center gap-3">
                    <div className="relative flex-1">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Pregúntame por tu semana..."
                            className="w-full bg-zinc-800/50 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all resize-none max-h-32 min-h-[56px] placeholder:text-zinc-500 custom-scrollbar shadow-inner"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all group-hover/input:rotate-12"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        Strategist AI • Semester Optimizer
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatWidget;
