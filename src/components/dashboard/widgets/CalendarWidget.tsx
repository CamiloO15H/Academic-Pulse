'use client';

import React from 'react';
import StudyCalendar from '@/components/dashboard/StudyCalendar';
import { AcademicContent } from '@/domain/entities/AcademicContent';

interface CalendarWidgetProps {
    contents: AcademicContent[];
    events: any[];
    onEditEvent: (event: any) => void;
    onDayClick?: (date: string, contents: AcademicContent[], events: any[]) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ contents, events, onEditEvent, onDayClick }) => {
    return (
        <div className="h-full w-full overflow-hidden">
            <StudyCalendar
                contents={contents}
                events={events}
                onItemClick={onEditEvent}
                onAddEvent={() => { }} // Widget view might not support adding directly or needs modal
                onDayClick={onDayClick}
            />
        </div>
    );
};

export default CalendarWidget;
