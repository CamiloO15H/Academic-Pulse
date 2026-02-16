'use client';

import React from 'react';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import ContentCard from '@/components/dashboard/ContentCard';
import { Sparkles } from 'lucide-react';

interface RecentActivityWidgetProps {
    contents: AcademicContent[];
    isLoading: boolean;
    onAskAI: (content: AcademicContent) => void;
    onDeleteContent: (id: string, path: string) => Promise<void>;
    onRefresh: () => void;
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
    contents,
    isLoading,
    onAskAI,
    onDeleteContent,
    onRefresh
}) => {
    // Skeleton component for loading state
    const ContentSkeleton = () => (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-white/10 rounded-full" />
                <div className="h-4 w-4 bg-white/10 rounded-full" />
            </div>
            <div className="space-y-2">
                <div className="h-8 w-3/4 bg-white/10 rounded-xl" />
                <div className="h-4 w-1/2 bg-white/10 rounded-xl" />
            </div>
            <div className="h-24 w-full bg-white/5 rounded-2xl" />
        </div>
    );

    return (
        <div className="h-full w-full flex flex-col">
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 p-4">
                    <ContentSkeleton />
                    <ContentSkeleton />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {/* Summarized Feed Logic: Only show the latest blogcito per subject */}
                    {(() => {
                        const sortedContents = [...contents].sort((a, b) =>
                            new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
                        );

                        if (sortedContents.length === 0) {
                            return (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                                    <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-sm font-medium">El radar está despejado</p>
                                </div>
                            );
                        }

                        return sortedContents.map((item) => (
                            <ContentCard
                                key={item.id}
                                content={item}
                                onAskAI={onAskAI}
                                onDelete={(id) => onDeleteContent(id, '')}
                                onUpdate={onRefresh}
                            />
                        ));
                    })()}
                </div>
            )}
        </div>
    );
};

export default RecentActivityWidget;
