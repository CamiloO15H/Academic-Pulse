'use client';

import React from 'react';
import { GripHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    // Props passed by react-grid-layout
    style?: React.CSSProperties;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
    onClose?: () => void;
}

// ForwardRef is required by react-grid-layout
const DashboardWidget = React.forwardRef<HTMLDivElement, DashboardWidgetProps>(
    ({ title, icon, children, className, style, onMouseDown, onMouseUp, onTouchEnd, onClose, ...props }, ref) => {
        return (
            <div
                ref={ref}
                style={style}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchEnd={onTouchEnd}
                className={cn(
                    "flex flex-col bg-card/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-sm transition-shadow hover:shadow-md",
                    className
                )}
                {...props}
            >
                {/* Drag Handle & Header */}
                <div className="drag-handle cursor-move flex items-center justify-between p-4 border-b border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        {icon && <span className="text-zinc-400">{icon}</span>}
                        {title && (
                            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                                {title}
                            </h3>
                        )}
                        {/* If no title/icon, show a subtle handle indicator */}
                        {!title && !icon && (
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700/50" />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {onClose && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <GripHorizontal className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                </div>

                {/* Widget Content */}
                <div className="flex-1 overflow-auto p-1 min-h-0">
                    {children}
                </div>
            </div>
        );
    }
);

DashboardWidget.displayName = 'DashboardWidget';

export default DashboardWidget;
