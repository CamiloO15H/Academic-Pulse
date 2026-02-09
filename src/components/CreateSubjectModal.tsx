import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';

interface CreateSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, color: string) => void;
}

const PREMIUM_COLORS = [
    { name: 'Indigo Pulse', value: '#6366F1' },
    { name: 'Deep Purple', value: '#8B5CF6' },
    { name: 'Crimson Red', value: '#EF4444' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Amber Gold', value: '#F59E0B' },
    { name: 'Cyan Sky', value: '#06B6D4' },
];

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
    isOpen,
    onClose,
    onSave
}) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PREMIUM_COLORS[0].value);

    if (!isOpen) return null;

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim(), selectedColor);
            setName('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full" />
                        Nueva Materia
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-400">Nombre de la Materia</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Inteligencia Artificial..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-zinc-400">Identidad Visual (Color)</label>
                        <div className="grid grid-cols-6 gap-3">
                            {PREMIUM_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setSelectedColor(color.value)}
                                    className={`relative w-full aspect-square rounded-full transition-all duration-200 hover:scale-110 active:scale-90 ${selectedColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110 shadow-lg' : ''
                                        }`}
                                    style={{ backgroundColor: color.value, boxShadow: selectedColor === color.value ? `0 0 15px ${color.value}40` : 'none' }}
                                >
                                    {selectedColor === color.value && (
                                        <Check className="mx-auto w-4 h-4 text-white drop-shadow-md" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold pt-1 text-center">
                            Selecciona el pulso de tu materia
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-zinc-950/50 flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20"
                    >
                        Crear Materia
                    </Button>
                </div>
            </div>
        </div>
    );
};
