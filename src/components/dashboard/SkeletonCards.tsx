import React from 'react';

export const SubjectSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-6">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-3xl bg-gray-200/50 dark:bg-gray-800/50 h-56 shadow-sm" />
        ))}
    </div>
);

export const ContentSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-[2.5rem] bg-gray-200/50 dark:bg-gray-800/50 h-72" />
        ))}
    </div>
);
