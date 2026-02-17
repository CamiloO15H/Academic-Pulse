'use client';

import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';

interface MobileFABProps {
    onAddSubject: () => void;
    onAddEvent: () => void;
}

/**
 * Botón Flotante de Acción (FAB) para dispositivos móviles.
 */
const MobileFAB: React.FC<MobileFABProps> = ({ onAddSubject, onAddEvent }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-[60] md:hidden">
            {isOpen && (
                <div className="absolute bottom-16 right-0 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <button
                        onClick={() => { onAddEvent(); setIsOpen(false); }}
                        className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-5 py-4 rounded-2xl shadow-2xl hover:scale-105 transition-all outline-none ring-2 ring-indigo-500/20"
                    >
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-bold uppercase tracking-wider">Evento</span>
                    </button>
                    <button
                        onClick={() => { onAddSubject(); setIsOpen(false); }}
                        className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-5 py-4 rounded-2xl shadow-2xl hover:scale-105 transition-all outline-none ring-2 ring-indigo-500/20"
                    >
                        <Plus className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-bold uppercase tracking-wider">Materia</span>
                    </button>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${isOpen ? 'bg-red-500 rotate-45' : 'bg-indigo-600 hover:scale-110 shadow-indigo-600/30'}`}
            >
                <Plus className={`w-8 h-8 ${isOpen ? 'text-white' : 'text-white'}`} />
            </button>
        </div>
    );
};

export default MobileFAB;
