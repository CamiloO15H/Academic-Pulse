'use client';

import { useState } from 'react';
import {
    getCalendarEvents,
    createCalendarEvent as apiCreateCalendarEvent,
    updateCalendarEvent as apiUpdateCalendarEvent,
    updateAcademicContent as apiUpdateAcademicContent,
    toggleGoogleSync as apiToggleGoogleSync
} from '@/app/actions';
import { toast } from 'sonner';
import { Subject } from '@/domain/entities/Subject';
import { AcademicContent } from '@/domain/entities/AcademicContent';

/**
 * Hook para la gestión de eventos y calendario.
 */
export function useEvents(initialEvents: any[], initialSettings: any, subjects: Subject[]) {
    const [events, setEvents] = useState<any[]>(initialEvents);
    const [settings, setSettings] = useState<any>(initialSettings);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [quickAddDate, setQuickAddDate] = useState('');
    const [selectedSubjectForEvent, setSelectedSubjectForEvent] = useState<string>('');
    const [selectedCalendarItem, setSelectedCalendarItem] = useState<any | null>(null);
    const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
    const [selectedDayContent, setSelectedDayContent] = useState<{ date: string; contents: AcademicContent[]; events: any[] } | null>(null);

    const handleQuickAddEvent = async () => {
        if (!newEventTitle.trim()) return;

        const sub = subjects.find(s => s.id === selectedSubjectForEvent);
        const color = sub?.color || '#F59E0B';

        const tempId = 'temp-' + Date.now();
        const optimisticEvent = {
            id: tempId,
            title: newEventTitle,
            eventDate: quickAddDate,
            isAllDay: true,
            color: color,
            subjectId: selectedSubjectForEvent || undefined,
            type: 'manual' as const
        };

        setEvents(prev => [...prev, optimisticEvent]);
        setIsAddEventModalOpen(false);
        setNewEventTitle('');
        setSelectedSubjectForEvent('');
        const toastId = toast.loading('Agendando evento...');

        const result = await apiCreateCalendarEvent({
            title: newEventTitle,
            eventDate: quickAddDate,
            isAllDay: true,
            color: color,
            subjectId: selectedSubjectForEvent || undefined
        });

        if (result.status === 'SUCCESS') {
            toast.success('Evento agendado', { id: toastId });
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
        } else {
            setEvents(prev => prev.filter(e => e.id !== tempId));
            toast.error(result.message || 'Error al agendar', { id: toastId });
        }
    };

    const handleUpdateCalendarItem = async (id: string, updates: any, type: 'academic' | 'manual') => {
        const previousEvents = [...events];
        // Nota: contents se maneja externamente generalmente, pero aquí actualizamos localmente si es manual
        if (type === 'manual') {
            setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
        }

        setSelectedCalendarItem(null);

        let result;
        if (type === 'academic') {
            result = await apiUpdateAcademicContent(id, updates);
        } else {
            result = await apiUpdateCalendarEvent(id, updates);
        }

        if (result.status === 'SUCCESS') {
            toast.success('Actualizado correctamente');
            const eventData = await getCalendarEvents();
            if (eventData.status === 'SUCCESS') setEvents(eventData.data || []);
            return true;
        } else {
            setEvents(previousEvents);
            toast.error(result.message || 'Error al actualizar');
            return false;
        }
    };

    const handleToggleSync = async () => {
        const newStatus = !settings?.googleSyncEnabled;
        const result = await apiToggleGoogleSync(newStatus);
        if (result.status === 'SUCCESS') {
            setSettings({ ...settings, googleSyncEnabled: newStatus });
            toast.success(`Google Calendar ${newStatus ? 'activado' : 'desactivado'}`);
        } else {
            toast.error(result.message || 'Error al cambiar sync');
        }
    };

    return {
        events,
        setEvents,
        settings,
        isAddEventModalOpen,
        setIsAddEventModalOpen,
        newEventTitle,
        setNewEventTitle,
        quickAddDate,
        setQuickAddDate,
        selectedSubjectForEvent,
        setSelectedSubjectForEvent,
        selectedCalendarItem,
        setSelectedCalendarItem,
        isDayDetailModalOpen,
        setIsDayDetailModalOpen,
        selectedDayContent,
        setSelectedDayContent,
        handleQuickAddEvent,
        handleUpdateCalendarItem,
        handleToggleSync
    };
}
