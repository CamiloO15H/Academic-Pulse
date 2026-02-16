'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

const FocusTimerWidget: React.FC = () => {
    const [seconds, setSeconds] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((s) => s - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
            // Alert user or switch mode
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setIsActive(false);
        setSeconds(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-6 space-y-6">
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-all rounded-full" />
                <div className="relative text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                    {formatTime(seconds)}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggle}
                    className="p-4 rounded-full bg-white text-black hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                    {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <button
                    onClick={reset}
                    className="p-4 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:scale-110 active:scale-95 transition-all"
                >
                    <RotateCcw className="w-6 h-6" />
                </button>
            </div>

            <div className="flex gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                <button
                    onClick={() => { setMode('focus'); setSeconds(25 * 60); setIsActive(false); }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'focus' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Focus
                </button>
                <button
                    onClick={() => { setMode('break'); setSeconds(5 * 60); setIsActive(false); }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'break' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Break
                </button>
            </div>
        </div>
    );
};

export default FocusTimerWidget;
