'use client';

import { useState } from 'react';
import { AcademicContent } from '@/domain/entities/AcademicContent';

/**
 * Hook para gestionar el estado general de la UI del Dashboard.
 */
export function useDashboard() {
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeChatContent, setActiveChatContent] = useState<AcademicContent | null>(null);
    const [isSyllabusScannerOpen, setIsSyllabusScannerOpen] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [isAddingBlogcito, setIsAddingBlogcito] = useState(false);

    return {
        isLoading,
        setIsLoading,
        isProcessing,
        setIsProcessing,
        isChatOpen,
        setIsChatOpen,
        activeChatContent,
        setActiveChatContent,
        isSyllabusScannerOpen,
        setIsSyllabusScannerOpen,
        isMigrating,
        setIsMigrating,
        isAddingBlogcito,
        setIsAddingBlogcito
    };
}
