'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveGridLayout, useContainerWidth, type Layout } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import DashboardWidget from './DashboardWidget';
import CalendarWidget from './widgets/CalendarWidget';
import RecentActivityWidget from './widgets/RecentActivityWidget';
import NotesWidget from './widgets/NotesWidget';
import FocusTimerWidget from './widgets/FocusTimerWidget';
import SubjectActivityWidget from './widgets/SubjectActivityWidget';
import RadarWidget from './widgets/RadarWidget';
import ChatWidget from './widgets/ChatWidget';
import EmailWidget from './widgets/EmailWidget';



import { Subject } from '@/domain/entities/Subject';
import { AcademicContent } from '@/domain/entities/AcademicContent';
import { Calendar, Sparkles, Plus, StickyNote, Timer, LayoutGrid, X, Bot, Mail } from 'lucide-react';
import ContentCard from './ContentCard';

interface DashboardGridProps {
    contextId?: string; // 'main' or `subject-${id}`
    subjects: Subject[];
    contents: AcademicContent[];
    events: any[];
    isMosaicMode?: boolean;
    onEditEvent?: (event: any) => void;
    onDayClick?: (date: string, contents: AcademicContent[], events: any[]) => void;
    onAskAI: (content: AcademicContent) => void;
    onDeleteContent: (id: string, path?: string) => Promise<void>;
    onRefresh: () => void;
}

// Widget Registry
const WIDGET_REGISTRY: Record<string, {
    title: string;
    icon: React.ReactNode;
    defaultLayout: any;
    component: React.FC<any>;
    allowMultiple?: boolean;
}> = {
    chat: {
        title: "Estratega Gemini",
        icon: <Bot className="w-4 h-4 text-primary" />,
        defaultLayout: { w: 4, h: 5, minW: 3, minH: 4 },
        component: ChatWidget
    },
    calendar: {
        title: "Agenda Semanal",
        icon: <Calendar className="w-4 h-4" />,
        defaultLayout: { w: 8, h: 4, minW: 4, minH: 3 },
        component: CalendarWidget
    },
    activity: {
        title: "Radar Académico",
        icon: <Sparkles className="w-4 h-4 text-primary" />,
        defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
        component: RecentActivityWidget
    },
    notes: {
        title: "Notas Rápidas",
        icon: <StickyNote className="w-4 h-4 text-yellow-500" />,
        defaultLayout: { w: 4, h: 2, minW: 3, minH: 2 },
        component: NotesWidget,
        allowMultiple: true
    },
    timer: {
        title: "Focus Timer",
        icon: <Timer className="w-4 h-4 text-blue-500" />,
        defaultLayout: { w: 3, h: 3, minW: 2, minH: 2 },
        component: FocusTimerWidget
    },
    subjectActivity: {
        title: "Bitácora de Materia",
        icon: <LayoutGrid className="w-4 h-4 text-purple-500" />,
        defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
        component: SubjectActivityWidget
    },
    radar: {
        title: "Radar de Prioridades",
        icon: <Sparkles className="w-4 h-4 text-red-500" />,
        defaultLayout: { w: 4, h: 5, minW: 3, minH: 4 },
        component: RadarWidget
    },
    email: {
        title: "Bandeja Outlook",
        icon: <Mail className="w-4 h-4 text-blue-500" />,
        defaultLayout: { w: 4, h: 4, minW: 3, minH: 3 },
        component: EmailWidget
    }
};

const DashboardGrid: React.FC<DashboardGridProps> = ({
    contextId = 'main',
    subjects,
    contents,
    events,
    isMosaicMode = false,
    onEditEvent,
    onDayClick,
    onAskAI,
    onDeleteContent,
    onRefresh
}) => {
    const [activeWidgets, setActiveWidgets] = useState<{ id: string, type: string }[]>([]);
    const [layouts, setLayouts] = useState<any>({});
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);

    const { width, containerRef, mounted: widthMounted } = useContainerWidth({
        measureBeforeMount: true
    });

    useEffect(() => {
        const savedLayouts = localStorage.getItem(`layouts_${contextId}`);
        const savedWidgets = localStorage.getItem(`widgets_${contextId}`);

        if (savedWidgets) {
            setActiveWidgets(JSON.parse(savedWidgets));
        } else {
            // Default widgets based on context
            const defaults = contextId === 'main'
                ? [{ id: 'chat', type: 'chat' }, { id: 'radar', type: 'radar' }, { id: 'calendar', type: 'calendar' }]
                : (isMosaicMode
                    ? [{ id: 'chat', type: 'chat' }, { id: 'notes-default', type: 'notes' }]
                    : [{ id: 'radar', type: 'radar' }, { id: 'subjectActivity', type: 'subjectActivity' }, { id: 'notes-default', type: 'notes' }]);
            setActiveWidgets(defaults);
        }

        if (savedLayouts) {
            setLayouts(JSON.parse(savedLayouts));
        } else {
            // Explicitly reset layouts to avoid leakage from previous context
            setLayouts({});
        }
        setIsLayoutLoaded(true);
    }, [contextId, isMosaicMode]);

    const layoutTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Use useCallback and a small timeout to break any potential synchronous update loops
    const onLayoutChange = React.useCallback((layout: any, allLayouts: any) => {
        if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);

        layoutTimerRef.current = setTimeout(() => {
            setLayouts((prev: any) => {
                const prevStr = JSON.stringify(prev);
                const nextStr = JSON.stringify(allLayouts);

                if (prevStr !== nextStr) {
                    return allLayouts;
                }
                return prev;
            });
        }, 50);
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);
        };
    }, []);

    // Persist layouts to localStorage when they change (only if not empty AND loaded)
    useEffect(() => {
        if (isLayoutLoaded && layouts && Object.keys(layouts).length > 0) {
            localStorage.setItem(`layouts_${contextId}`, JSON.stringify(layouts));
        }
    }, [layouts, contextId, isLayoutLoaded]);

    const addWidget = (type: string) => {
        const widgetDef = WIDGET_REGISTRY[type];
        if (!widgetDef) return;

        // Duplicate check (only if multiple instances are NOT allowed)
        if (!widgetDef.allowMultiple && activeWidgets.some(w => w.type === type)) return;

        const instanceId = widgetDef.allowMultiple ? `${type}-${Date.now()}` : type;
        const newWidgets = [...activeWidgets, { id: instanceId, type }];

        setActiveWidgets(newWidgets);
        localStorage.setItem(`widgets_${contextId}`, JSON.stringify(newWidgets));
        setShowAddMenu(false);
    };

    const removeWidget = (id: string) => {
        const newWidgets = activeWidgets.filter(w => w.id !== id);
        setActiveWidgets(newWidgets);
        localStorage.setItem(`widgets_${contextId}`, JSON.stringify(newWidgets));
    };

    const availableWidgets = Object.keys(WIDGET_REGISTRY).filter(type =>
        WIDGET_REGISTRY[type].allowMultiple || !activeWidgets.some(w => w.type === type)
    );

    // Stabilize subject identification and filtering
    const currentSubjectId = React.useMemo(() =>
        contextId?.startsWith('subject-') ? contextId.replace('subject-', '').replace('-mosaic', '') : undefined
        , [contextId]);

    const subjectContents = React.useMemo(() =>
        contents.filter(c => String(c.subjectId) === String(currentSubjectId))
        , [contents, currentSubjectId]);

    // Memoize the grid children to prevent unnecessary re-renders of the grid content
    const gridItems = React.useMemo(() => {
        const items: React.ReactNode[] = [];

        // 1. Add Standard Widgets
        activeWidgets.forEach(widgetInstance => {
            const widget = WIDGET_REGISTRY[widgetInstance.type];
            if (!widget) return;
            const Component = widget.component;

            items.push(
                <div key={widgetInstance.id} data-grid={widget.defaultLayout}>
                    <DashboardWidget
                        title={widget.title}
                        icon={widget.icon}
                        onClose={() => removeWidget(widgetInstance.id)}
                        className="h-full"
                    >
                        <Component
                            subjects={subjects}
                            contents={contents}
                            events={events}
                            subjectId={currentSubjectId}
                            instanceId={widgetInstance.id}
                            onEditEvent={onEditEvent}
                            onDayClick={onDayClick}
                            onAskAI={onAskAI}
                            onDeleteContent={onDeleteContent}
                            onRefresh={onRefresh}
                        />
                    </DashboardWidget>
                </div>
            );
        });

        // 2. Add Content Items (if in Mosaic Mode)
        if (isMosaicMode) {
            subjectContents.forEach((item) => {
                items.push(
                    <div key={`content-${item.id}`} data-grid={{ w: 4, h: 4, minW: 3, minH: 3 }}>
                        <DashboardWidget
                            title={item.title}
                            icon={<Sparkles className="w-4 h-4 text-primary" />}
                            className="h-full"
                        >
                            <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                                <ContentCard
                                    content={item}
                                    onAskAI={onAskAI}
                                    onDelete={(cid: string) => onDeleteContent(cid, '')}
                                    onUpdate={onRefresh}
                                />
                            </div>
                        </DashboardWidget>
                    </div>
                );
            });
        }

        return items;
    }, [isMosaicMode, subjectContents, activeWidgets, subjects, contents, events, currentSubjectId, onEditEvent, onDayClick, onAskAI, onDeleteContent, onRefresh]);

    return (
        <div ref={containerRef} className="w-full min-h-[400px] flex flex-col gap-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-zinc-500">
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                        {isMosaicMode ? 'Mosaico de Conocimiento' : 'Tablero'}
                    </span>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir Widget
                    </button>

                    {showAddMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 border-b border-zinc-800 mb-2 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Widgets Disponibles</span>
                                <button onClick={() => setShowAddMenu(false)}><X className="w-3 h-3 text-zinc-600" /></button>
                            </div>
                            {availableWidgets.length === 0 ? (
                                <p className="p-4 text-[10px] text-zinc-600 text-center">No hay más widgets disponibles</p>
                            ) : (
                                availableWidgets.map(id => (
                                    <button
                                        key={id}
                                        onClick={() => addWidget(id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group text-left"
                                    >
                                        <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                                            {WIDGET_REGISTRY[id].icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-300">{WIDGET_REGISTRY[id].title}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {widthMounted && width > 0 && gridItems.length > 0 && (
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={100}
                    width={width}
                    onLayoutChange={onLayoutChange}
                    margin={[16, 16]}
                    // @ts-ignore: draggableHandle is valid but missing in type definition
                    draggableHandle=".drag-handle"
                >
                    {gridItems}
                </ResponsiveGridLayout>
            )}

            {widthMounted && gridItems.length === 0 && (
                <div className="py-20 text-center bg-zinc-900/10 rounded-[3rem] border-2 border-dashed border-zinc-900">
                    <Sparkles className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-medium text-zinc-500">No hay contenido para mostrar en este modo</p>
                </div>
            )}
        </div>
    );
};

export default DashboardGrid;

