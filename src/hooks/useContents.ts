'use client';

import { useState, useEffect } from 'react';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import {
    getRecentActivity,
    getContentBySubject,
    deleteAcademicContent as apiDeleteAcademicContent
} from '@/app/actions';
import { toast } from 'sonner';

/**
 * Hook para la gestión de Blogcitos (Academic Content).
 */
export function useContents(initialContents: AcademicContent[], selectedSubjectId: string | null) {
    const [contents, setContents] = useState<AcademicContent[]>(initialContents);
    const [isLoading, setIsLoading] = useState(false);

    const refreshContent = async () => {
        setIsLoading(true);
        if (selectedSubjectId) {
            const res = await getContentBySubject(selectedSubjectId);
            setContents(res.data || []);
        } else {
            const res = await getRecentActivity();
            setContents(res);
        }
        setIsLoading(false);
    };

    // Efecto para actualizar contenido cuando cambia la materia seleccionada
    useEffect(() => {
        const fetchContent = async () => {
            if (selectedSubjectId) {
                setIsLoading(true);
                const result = await getContentBySubject(selectedSubjectId);
                if (result.status === 'SUCCESS') setContents(result.data || []);
                setIsLoading(false);
            }
        };
        fetchContent();
    }, [selectedSubjectId]);

    const handleDeleteContent = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este blogcito?')) return;
        const res = await apiDeleteAcademicContent(id);
        if (res.status === 'SUCCESS') {
            await refreshContent();
            toast.success('Blogcito eliminado');
        } else {
            toast.error('Error al eliminar');
        }
    };

    return {
        contents,
        setContents,
        isLoading,
        refreshContent,
        handleDeleteContent
    };
}
