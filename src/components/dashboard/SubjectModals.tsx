'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';

interface SubjectModalsProps {
    isAddSubjectModalOpen: boolean;
    setIsAddSubjectModalOpen: (open: boolean) => void;
    isEditModalOpen: boolean;
    setIsEditModalOpen: (open: boolean) => void;
    newSubjectName: string;
    setNewSubjectName: (name: string) => void;
    newSubjectColor: string;
    setNewSubjectColor: (color: string) => void;
    handleCreateSubject: () => void;
    handleUpdateSubject: () => void;
    subjectToEdit?: any | null;
}

/**
 * Modales para creación y edición de materias.
 */
const SubjectModals: React.FC<SubjectModalsProps> = ({
    isAddSubjectModalOpen,
    setIsAddSubjectModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    newSubjectName,
    setNewSubjectName,
    newSubjectColor,
    setNewSubjectColor,
    handleCreateSubject,
    handleUpdateSubject,
    subjectToEdit
}) => {
    if (!isAddSubjectModalOpen && !isEditModalOpen) return null;

    const isOpen = isAddSubjectModalOpen || isEditModalOpen;
    const isEdit = isEditModalOpen;
    const title = isEdit ? 'Editar Materia' : 'Nueva Materia';
    const actionLabel = isEdit ? 'Guardar Cambios' : 'Crear Materia';
    const onAction = isEdit ? handleUpdateSubject : handleCreateSubject;
    const onClose = () => {
        setIsAddSubjectModalOpen(false);
        setIsEditModalOpen(false);
        setNewSubjectName('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 border border-white/20">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider ml-1">Nombre</label>
                        <input
                            type="text"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="Ej: Matemáticas Avanzadas"
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider ml-1">Color de Identidad</label>
                        <div className="flex gap-3 items-center p-2 rounded-2xl bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700">
                            <input
                                type="color"
                                value={newSubjectColor}
                                onChange={(e) => setNewSubjectColor(e.target.value)}
                                className="h-12 w-20 rounded-xl cursor-pointer bg-transparent border-none"
                            />
                            <span className="text-sm font-mono text-gray-500 uppercase">{newSubjectColor}</span>
                        </div>
                    </div>

                    <button
                        onClick={onAction}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>{actionLabel}</span>
                        {!isEdit && <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubjectModals;
