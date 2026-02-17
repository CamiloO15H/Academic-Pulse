import React from 'react';

export const SubjectSkeleton = () => (
    <div className="animate-pulse rounded-3xl bg-gray-200/50 dark:bg-gray-800/50 h-56 shadow-sm flex flex-col p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-300 dark:bg-gray-700" />
        <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-600 rounded-full" />
    </div>
);

export const ContentSkeleton = () => (
    <div className="animate-pulse rounded-[2.5rem] bg-gray-200/50 dark:bg-gray-800/50 h-72 p-8 space-y-6">
        <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-gray-300 dark:bg-gray-700" />
            <div className="w-24 h-6 rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>
        <div className="space-y-3">
            <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-lg" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded-full" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded-full" />
        </div>
        <div className="flex gap-2">
            <div className="w-16 h-4 rounded-full bg-gray-200 dark:bg-gray-600" />
            <div className="w-16 h-4 rounded-full bg-gray-200 dark:bg-gray-600" />
        </div>
    </div>
);
