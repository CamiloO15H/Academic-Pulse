'use client';

import { useState } from 'react';

/**
 * Hook para manejar la lógica de navegación y modos de vista 
 * dentro del detalle de una materia.
 */
export function useSubjectDetail(onRefresh: () => Promise<void>) {
    const [subView, setSubView] = useState<'notes' | 'vault'>('notes');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isMosaicMode, setIsMosaicMode] = useState(true);

    const handleSuccess = async () => {
        await onRefresh();
        setIsAddingNote(false);
    };

    return {
        subView,
        setSubView,
        isAddingNote,
        setIsAddingNote,
        isMosaicMode,
        setIsMosaicMode,
        handleSuccess
    };
}
