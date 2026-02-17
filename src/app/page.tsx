import {
    getRecentActivity,
    getSubjects,
    getCalendarEvents,
    getUserSettings
} from './actions';
import DashboardClient from './DashboardClient';

/**
 * Dashboard Page (Server Component)
 * 
 * This is now a Server Component to enable SSR.
 * It fetches all initial data in parallel on the server,
 * providing a much faster initial page load (FCP/LCP).
 */
export default async function DashboardPage() {
    // Parallel fetching of initial data on the server
    const [
        subjects,
        recentActivity,
        eventsData,
        settingsData
    ] = await Promise.all([
        getSubjects(),
        getRecentActivity(),
        getCalendarEvents({ excludeAcademic: true }), // Optimization: exclude academic content fetch
        getUserSettings()
    ]);

    // Extract data from action responses
    const manualEvents = eventsData.status === 'SUCCESS' ? eventsData.data : [];
    const initialSettings = settingsData.status === 'SUCCESS' ? settingsData.data : null;

    // Map Recent Activity to Academic Events to combine with manual events
    const academicEvents = (recentActivity || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        eventDate: c.classDate ? new Date(c.classDate).toISOString() : c.created_at,
        isAllDay: true,
        color: c.subjects?.color || '#3B82F6',
        type: 'academic' as const
    }));

    const initialEvents = [...academicEvents, ...(manualEvents || [])];

    return (
        <DashboardClient
            initialSubjects={subjects}
            initialContents={recentActivity}
            initialEvents={initialEvents}
            initialSettings={initialSettings}
        />
    );
}
