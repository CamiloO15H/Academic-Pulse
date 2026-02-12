'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, AlignLeft, Edit2, Trash2, Save, FileText, BookOpen } from 'lucide-react';

interface EventDetailModalProps {
    item: any; // Can be AcademicContent or CalendarEvent
    subjects: any[];
    onClose: () => void;
    onSave: (id: string, updates: any, type: 'academic' | 'manual') => Promise<void>;
    onDelete: (id: string, type: 'academic' | 'manual') => Promise<void>;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ item, subjects, onClose, onSave, onDelete }) => {
    const isAcademic = item.type === 'academic';
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(isAcademic ? (item.description || item.transcription || '') : (item.description || ''));
    const [eventDate, setEventDate] = useState(item.eventDate ? item.eventDate.substring(0, 10) : new Date().toISOString().substring(0, 10));
    const [subjectId, setSubjectId] = useState(item.subjectId || '');
    const [isSaving, setIsSaving] = useState(false);
    const isOptimistic = item.id && item.id.toString().startsWith('temp-');

    const handleSave = async () => {
        setIsSaving(true);
        const updates: any = { title, description };
        if (isAcademic) {
            updates.classDate = new Date(eventDate);
            updates.subjectId = subjectId;
        } else {
            updates.eventDate = eventDate;
            updates.subjectId = subjectId || null;
            // Also update color if subject changed
            if (subjectId) {
                const sub = subjects.find(s => s.id === subjectId);
                if (sub) updates.color = sub.color;
            }
        }

        await onSave(item.id, updates, isAcademic ? 'academic' : 'manual');
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
            await onDelete(item.id, isAcademic ? 'academic' : 'manual');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className={`w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-300`}>
                {/* Header with Color Banner */}
                <div className="h-2 w-full" style={{ backgroundColor: (subjects.find(s => s.id === subjectId)?.color) || item.color || '#3B82F6' }} />

                <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                                    {isAcademic ? 'Blogcito Académico' : 'Evento Manual'}
                                </span>
                                {item.importanceLevel && (
                                    <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-800">
                                        Importancia: {item.importanceLevel}
                                    </span>
                                )}
                            </div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-3xl font-black text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
                                />
                            ) : (
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                    {title}
                                </h2>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Fecha</p>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            className="text-sm font-bold bg-transparent dark:text-white focus:outline-none"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold dark:text-gray-200">
                                            {new Date(eventDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                <BookOpen className="w-5 h-5 text-green-500" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Materia</p>
                                    {isEditing ? (
                                        <select
                                            value={subjectId}
                                            onChange={(e) => setSubjectId(e.target.value)}
                                            className="w-full text-sm font-bold bg-transparent dark:text-white focus:outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="" className="dark:bg-gray-900">Sin Materia</option>
                                            {subjects.map(s => (
                                                <option key={s.id} value={s.id} className="dark:bg-gray-900">{s.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-sm font-bold dark:text-gray-200">
                                            {subjects.find(s => s.id === subjectId)?.name || 'General / Ninguna'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description/Content Section */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 mb-2 ml-1">
                                <FileText className="w-3 h-3" />
                                {isAcademic ? 'Transcripción / Contenido' : 'Descripción'}
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={8}
                                    className="w-full p-6 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium leading-relaxed"
                                />
                            ) : (
                                <div className="max-h-60 overflow-y-auto p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 custom-scrollbar">
                                    <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed whitespace-pre-wrap">
                                        {description || 'Sin descripción adicional.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={handleDelete}
                            className="p-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all active:scale-95"
                            title="Eliminar"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>

                        <div className="flex-1 flex gap-4">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold transition-all active:scale-95"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex-2 flex-[2] py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-xl hover:shadow-gray-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                <span>Guardar Cambios</span>
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    disabled={isOptimistic}
                                    className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold shadow-xl hover:shadow-gray-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Edit2 className="w-5 h-5" />
                                    <span>{isOptimistic ? 'Sincronizando...' : 'Editar'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;
