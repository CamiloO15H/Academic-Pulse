'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/infrastructure/database/supabaseClient';

const DEFAULT_TIMEOUT_MINUTES = 30;

export default function SessionTimeout() {
    const router = useRouter();
    const supabase = createClient();
    const timeoutHandle = useRef<NodeJS.Timeout | null>(null);

    // Get timeout from env or use default
    const timeoutMinutes = Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES) || DEFAULT_TIMEOUT_MINUTES;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    const handleLogout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            router.push('/login');
            router.refresh(); // Refresh to ensure middleware catches the state change
        } catch (error) {
            console.error('Logout error during timeout:', error);
        }
    }, [supabase, router]);

    const resetTimer = useCallback(() => {
        if (timeoutHandle.current) {
            clearTimeout(timeoutHandle.current);
        }

        timeoutHandle.current = setTimeout(() => {
            handleLogout();
        }, timeoutMs);
    }, [handleLogout, timeoutMs]);

    useEffect(() => {
        // Initial timer start
        resetTimer();

        // Event listeners for activity
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        const handleActivity = () => {
            resetTimer();
        };

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timeoutHandle.current) {
                clearTimeout(timeoutHandle.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    // This component doesn't render anything
    return null;
}
