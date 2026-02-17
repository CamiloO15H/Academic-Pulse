import React from 'react';
import { Activity, BookOpen, FileText, Smartphone, Settings } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            {/* Navbar Skeleton */}
            <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/60 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-2.5 rounded-none w-10 h-10 animate-pulse" />
                    <div>
                        <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
                        <div className="h-3 w-32 bg-muted animate-pulse rounded-full mt-2" />
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded-full" />
                        <div className="h-4 w-20 bg-muted animate-pulse rounded-full" />
                    </div>
                    <div className="h-11 w-11 bg-muted animate-pulse rounded-lg border border-border" />
                </div>
            </nav>

            <main className="w-full px-6 lg:px-8 py-12 space-y-20 relative">
                {/* Summary & Analytics Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-8 rounded-xl bg-card border border-border/60 shadow-sm">
                            <div className="w-8 h-8 bg-muted animate-pulse rounded-lg mb-4" />
                            <div className="h-10 w-16 bg-muted animate-pulse rounded-lg mb-2" />
                            <div className="h-3 w-24 bg-muted animate-pulse rounded-full" />
                        </div>
                    ))}
                </div>

                {/* Subjects Grid Skeleton */}
                <section className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                        <div className="space-y-4">
                            <div className="h-12 w-64 bg-muted animate-pulse rounded-xl" />
                            <div className="h-4 w-40 bg-muted animate-pulse rounded-full" />
                        </div>
                        <div className="h-12 w-48 bg-muted animate-pulse rounded-lg" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse rounded-3xl bg-secondary/50 h-56 border border-border/40 shadow-sm" />
                        ))}
                    </div>
                </section>

                {/* Dashboard Grid (Calendar + Activity) Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[600px] bg-secondary/30 animate-pulse rounded-3xl border border-border/40" />
                    <div className="h-[600px] bg-secondary/30 animate-pulse rounded-3xl border border-border/40" />
                </div>

                {/* Bottom Section Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-border">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-secondary animate-pulse border border-border" />
                            <div className="space-y-2">
                                <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
                                <div className="h-3 w-20 bg-muted animate-pulse rounded-full" />
                            </div>
                        </div>
                        <div className="h-24 w-full bg-secondary/50 animate-pulse rounded-2xl border border-border" />
                    </div>
                    <div className="h-24 w-full bg-secondary/50 animate-pulse rounded-2xl border border-border" />
                </div>
            </main>
        </div>
    );
}
