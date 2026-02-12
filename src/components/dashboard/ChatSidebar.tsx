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
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="relative w-full max-w-md h-full bg-white/80 dark:bg-gray-900/90 backdrop-blur-2xl border-l border-white/20 dark:border-gray-800/50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-blue-600/5 to-purple-600/5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Tutor IA</h3>
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
                                {content.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                            <Bot className="w-12 h-12 text-blue-200 dark:text-gray-700" />
                            <div className="space-y-2">
                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                                    ¿En qué puedo ayudarte?
                                </h4>
                                <p className="text-xs font-bold text-gray-400 leading-relaxed">
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
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                        : 'bg-blue-600 text-white'
                                        }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-4 rounded-[2rem] text-sm leading-relaxed overflow-hidden ${msg.role === 'user'
                                        ? 'bg-gray-900 text-white rounded-tr-none'
                                        : 'bg-blue-50 dark:bg-blue-900/20 text-gray-800 dark:text-gray-200 rounded-tl-none border border-blue-100/50 dark:border-blue-800/30'
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
                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="p-4 rounded-[2rem] rounded-tl-none bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/30 dark:border-blue-800/20">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800/50">
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
                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl py-4 pl-6 pr-14 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all resize-none max-h-32 min-h-[56px] dark:placeholder-gray-500"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-2 h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="mt-3 text-[10px] text-center font-black uppercase tracking-widest text-gray-400">
                        AI Tutor Contextual • Academic Pulse
                    </p>
                </div>
            </div>
        </div>
    );
};
