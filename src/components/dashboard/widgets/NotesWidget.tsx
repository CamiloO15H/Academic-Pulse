'use client';

import React, { useState, useEffect } from 'react';
import { StickyNote, Save } from 'lucide-react';

interface NotesWidgetProps {
    instanceId?: string;
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ instanceId = 'default' }) => {
    const [note, setNote] = useState('');
    const storageKey = `dashboard_quick_note_${instanceId}`;

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) setNote(saved);
    }, [storageKey]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNote(val);
        localStorage.setItem(storageKey, val);
    };

    return (
        <div className="h-full w-full flex flex-col p-4">
            <div className="flex-1 relative group">
                <textarea
                    value={note}
                    onChange={handleChange}
                    placeholder="Escribe algo importante..."
                    className="w-full h-full bg-transparent border-none outline-none text-zinc-300 font-medium leading-relaxed resize-none placeholder:text-zinc-700 custom-scrollbar"
                />
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Save className="w-4 h-4 text-zinc-600" />
                </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-zinc-600">
                <span>Auto-guardado activo</span>
                <StickyNote className="w-3 h-3" />
            </div>
        </div>
    );
};

export default NotesWidget;
