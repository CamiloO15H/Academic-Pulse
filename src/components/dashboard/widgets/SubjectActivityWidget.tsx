'use client';

import React from 'react';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import ContentCard from '@/components/dashboard/ContentCard';
import { Sparkles, Terminal } from 'lucide-react';

interface SubjectActivityWidgetProps {
    contents: AcademicContent[];
    subjectId: string;
    onAskAI: (content: AcademicContent) => void;
    onDeleteContent: (id: string, path: string) => Promise<void>;
    onRefresh: () => void;
}

const SubjectActivityWidget: React.FC<SubjectActivityWidgetProps> = ({
    contents,
    subjectId,
    onAskAI,
    onDeleteContent,
    onRefresh
}) => {

    const subjectContents = contents
        .filter(c => {
            const matches = String(c.subjectId) === String(subjectId);
            return matches;
        })
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());


    return (
        <div className="h-full w-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {subjectContents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                        <Terminal className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm font-medium">No hay blogcitos todavía</p>
                    </div>
                ) : (
                    subjectContents.map((item) => (
                        <ContentCard
                            key={item.id}
                            content={item}
                            onAskAI={onAskAI}
                            onDelete={(id) => onDeleteContent(id, '')}
                            onUpdate={onRefresh}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SubjectActivityWidget;
