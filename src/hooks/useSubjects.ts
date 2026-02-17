'use client';

import { useState } from 'react';
import { Subject } from '@/domain/entities/Subject';
import {
    createSubject as apiCreateSubject,
    updateSubject as apiUpdateSubject,
    deleteSubject as apiDeleteSubject,
    getSubjects
} from '@/app/actions';
import { toast } from 'sonner';

/**
 * Hook especializado para la gestión de materias (Subjects).
 * Centraliza el estado y las operaciones CRUD, desacoplando la lógica de la UI.
 */
export function useSubjects(initialSubjects: Subject[]) {
    const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectColor, setNewSubjectColor] = useState('#3B82F6');

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

    const handleCreateSubject = async () => {
        if (!newSubjectName) return;
        const res = await apiCreateSubject(newSubjectName, newSubjectColor, 'book');
        if (res.status === 'SUCCESS') {
            const subj = await getSubjects();
            setSubjects(subj);
            const newSubj = subj.find(s => s.name === newSubjectName);
            if (newSubj) setSelectedSubjectId(newSubj.id!);
            setIsAddSubjectModalOpen(false);
            setNewSubjectName('');
            toast.success('Materia creada');
        } else {
            toast.error('Error al crear materia');
        }
    };

    const handleUpdateSubject = async () => {
        if (!subjectToEdit || !newSubjectName) return;
        const res = await apiUpdateSubject(subjectToEdit.id!, newSubjectName, newSubjectColor);
        if (res.status === 'SUCCESS') {
            const subj = await getSubjects();
            setSubjects(subj);
            setIsEditModalOpen(false);
            setNewSubjectName('');
            toast.success('Materia actualizada');
        } else {
            toast.error('Error al actualizar materia');
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta materia? Esto borrará todos sus blogcitos asociados.')) return;
        const res = await apiDeleteSubject(id);
        if (res.status === 'SUCCESS') {
            const subj = await getSubjects();
            setSubjects(subj);
            if (selectedSubjectId === id) setSelectedSubjectId(null);
            toast.success('Materia eliminada');
        } else {
            toast.error('Error al eliminar');
        }
    };

    const openEditModal = (subject: Subject) => {
        setSubjectToEdit(subject);
        setNewSubjectName(subject.name);
        setNewSubjectColor(subject.color);
        setIsEditModalOpen(true);
    };

    return {
        subjects,
        selectedSubjectId,
        setSelectedSubjectId,
        selectedSubject,
        isAddSubjectModalOpen,
        setIsAddSubjectModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        subjectToEdit,
        newSubjectName,
        setNewSubjectName,
        newSubjectColor,
        setNewSubjectColor,
        handleCreateSubject,
        handleUpdateSubject,
        handleDeleteSubject,
        openEditModal
    };
}
